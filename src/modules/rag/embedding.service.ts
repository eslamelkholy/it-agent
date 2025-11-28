import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embeddingModel: string;
  private readonly embeddingDimension: number;
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.embeddingModel = this.configService.get<string>('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small');
    this.embeddingDimension = this.configService.get<number>('EMBEDDING_DIMENSION', 1536);
  }

  onModuleInit() {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. Using mock embeddings for development.');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      return this.generateMockEmbedding(text);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error}`);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      return Promise.all(texts.map(text => this.generateMockEmbedding(text)));
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: texts,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      return data.data.map((item: { embedding: number[] }) => item.embedding);
    } catch (error) {
      this.logger.error(`Failed to generate embeddings: ${error}`);
      throw error;
    }
  }

  private generateMockEmbedding(text: string): number[] {
    const hash = this.hashString(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < this.embeddingDimension; i++) {
      const seed = hash + i;
      embedding.push(this.seededRandom(seed) * 2 - 1);
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  getEmbeddingModel(): string {
    return this.embeddingModel;
  }

  getEmbeddingDimension(): number {
    return this.embeddingDimension;
  }
}
