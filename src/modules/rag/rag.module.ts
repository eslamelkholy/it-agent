import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RagOrchestratorService } from './rag-orchestrator.service';
import { KnowledgeSeedService } from './knowledge-seed.service';
import { ClassificationModule } from '../classification';

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeBase]),
    ClassificationModule,
  ],
  providers: [
    EmbeddingService,
    VectorStoreService,
    RagOrchestratorService,
    KnowledgeSeedService,
  ],
  exports: [
    EmbeddingService,
    VectorStoreService,
    RagOrchestratorService,
  ],
})
export class RagModule implements OnModuleInit {
  constructor(private readonly knowledgeSeed: KnowledgeSeedService) {}

  async onModuleInit() {
    await this.knowledgeSeed.seedKnowledgeBase();
  }
}
