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
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
    this.logger.log('pgvector extension enabled');
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
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let sqlQuery = `
      SELECT 
        id, title, content, category, tags,
        1 - (embedding <=> $1::vector) as similarity
      FROM knowledge_base
      WHERE is_active = true
    `;

    const params: (string | number)[] = [embeddingStr];

    if (category) {
      sqlQuery += ` AND category = $2`;
      params.push(category);
    }

    sqlQuery += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
    params.push(limit);

    const results = await this.dataSource.query(sqlQuery, params);

    return results.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      category: row.category as KnowledgeCategory,
      tags: row.tags as string[],
      similarity: parseFloat(row.similarity as string),
    }));
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
