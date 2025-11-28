import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { KnowledgeBase, KnowledgeCategory } from './entities/knowledge-base.entity';
import { EmbeddingService } from './embedding.service';

export interface VectorSearchResult {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  similarity: number;
}

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);
  private pgvectorEnabled = false;

  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepo: Repository<KnowledgeBase>,
    private readonly embeddingService: EmbeddingService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.initializePgVector();
  }

  private async initializePgVector() {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
      this.pgvectorEnabled = true;
      this.logger.log('pgvector extension enabled');
    } catch (error) {
      this.logger.warn('pgvector extension not available. Using fallback search.');
      this.pgvectorEnabled = false;
    }
  }

  async addDocument(
    title: string,
    content: string,
    category: KnowledgeCategory,
    tags: string[] = [],
  ): Promise<KnowledgeBase> {
    this.logger.log(`Adding document: ${title}`);

    const combinedText = `${title}\n\n${content}`;
    const embedding = await this.embeddingService.generateEmbedding(combinedText);

    const document = this.knowledgeBaseRepo.create({
      title,
      content,
      category,
      tags,
      embedding: `[${embedding.join(',')}]`,
      embeddingModel: this.embeddingService.getEmbeddingModel(),
      isActive: true,
    });

    return this.knowledgeBaseRepo.save(document);
  }

  async addDocuments(
    documents: Array<{
      title: string;
      content: string;
      category: KnowledgeCategory;
      tags?: string[];
    }>,
  ): Promise<KnowledgeBase[]> {
    this.logger.log(`Adding ${documents.length} documents in batch`);

    const texts = documents.map(doc => `${doc.title}\n\n${doc.content}`);
    const embeddings = await this.embeddingService.generateEmbeddings(texts);

    const entities = documents.map((doc, index) =>
      this.knowledgeBaseRepo.create({
        title: doc.title,
        content: doc.content,
        category: doc.category,
        tags: doc.tags || [],
        embedding: `[${embeddings[index].join(',')}]`,
        embeddingModel: this.embeddingService.getEmbeddingModel(),
        isActive: true,
      }),
    );

    return this.knowledgeBaseRepo.save(entities);
  }

  async searchSimilar(
    query: string,
    limit: number = 5,
    category?: KnowledgeCategory,
  ): Promise<VectorSearchResult[]> {
    this.logger.log(`Searching for: "${query.substring(0, 50)}..."`);

    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    if (this.pgvectorEnabled) {
      return this.vectorSearch(queryEmbedding, limit, category);
    }

    return this.fallbackSearch(queryEmbedding, limit, category);
  }

  private async vectorSearch(
    queryEmbedding: number[],
    limit: number,
    category?: KnowledgeCategory,
  ): Promise<VectorSearchResult[]> {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let query = `
      SELECT 
        id, title, content, category, tags,
        1 - (embedding <=> $1::vector) as similarity
      FROM knowledge_base
      WHERE is_active = true
    `;

    const params: (string | number)[] = [embeddingStr];

    if (category) {
      query += ` AND category = $2`;
      params.push(category);
    }

    query += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
    params.push(limit);

    const results = await this.dataSource.query(query, params);

    return results.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      category: row.category as KnowledgeCategory,
      tags: row.tags as string[],
      similarity: parseFloat(row.similarity as string),
    }));
  }

  private async fallbackSearch(
    queryEmbedding: number[],
    limit: number,
    category?: KnowledgeCategory,
  ): Promise<VectorSearchResult[]> {
    const whereCondition: Record<string, unknown> = { isActive: true };
    if (category) {
      whereCondition.category = category;
    }

    const documents = await this.knowledgeBaseRepo.find({
      where: whereCondition,
    });

    const results = documents
      .map(doc => {
        const docEmbedding = JSON.parse(doc.embedding || '[]') as number[];
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        return {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          tags: doc.tags,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  async getDocumentCount(): Promise<number> {
    return this.knowledgeBaseRepo.count({ where: { isActive: true } });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.knowledgeBaseRepo.update(id, { isActive: false });
  }

  async clearAllDocuments(): Promise<void> {
    await this.knowledgeBaseRepo.update({}, { isActive: false });
  }
}
