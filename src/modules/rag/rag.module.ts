import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RagOrchestratorService } from './rag-orchestrator.service';
import { KnowledgeSeedService } from './knowledge-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBase])],
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
