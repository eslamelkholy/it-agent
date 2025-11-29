import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService, VectorSearchResult } from './vector-store.service';
import { KnowledgeCategory } from './entities/knowledge-base.entity';
import {
  TicketIntent,
  IntentClassification,
  KnowledgeContext,
  RelevantDocument,
} from './interfaces/rag.interfaces';
import { LlmClassifierService } from '../classification';
import { ActionsService } from '../actions';

export interface RagQueryResult {
  classification: IntentClassification;
  context: KnowledgeContext;
  rawResults: VectorSearchResult[];
}

@Injectable()
export class RagOrchestratorService {
  private readonly logger = new Logger(RagOrchestratorService.name);

  private readonly intentToCategoryMap: Record<TicketIntent, KnowledgeCategory> = {
    [TicketIntent.PASSWORD_RESET]: KnowledgeCategory.PASSWORD_RESET,
    [TicketIntent.SYSTEM_RESTART]: KnowledgeCategory.SYSTEM_RESTART,
    [TicketIntent.BACKUP_FAILURE]: KnowledgeCategory.BACKUP_FAILURE,
    [TicketIntent.ACCESS_REQUEST]: KnowledgeCategory.ACCESS_REQUEST,
    [TicketIntent.SOFTWARE_INSTALL]: KnowledgeCategory.SOFTWARE_INSTALL,
    [TicketIntent.NETWORK_ISSUE]: KnowledgeCategory.NETWORK_ISSUE,
    [TicketIntent.EMAIL_ISSUE]: KnowledgeCategory.EMAIL_ISSUE,
    [TicketIntent.HARDWARE_ISSUE]: KnowledgeCategory.HARDWARE_ISSUE,
    [TicketIntent.VPN_ISSUE]: KnowledgeCategory.VPN_ISSUE,
    [TicketIntent.PERFORMANCE_ISSUE]: KnowledgeCategory.PERFORMANCE_ISSUE,
    [TicketIntent.UNKNOWN]: KnowledgeCategory.GENERAL,
  };

  constructor(
    private readonly vectorStore: VectorStoreService,
    private readonly llmClassifier: LlmClassifierService,
    private readonly actionsService: ActionsService,
  ) {}

  async runRagQuery(title: string, body: string): Promise<RagQueryResult> {
    this.logger.log(`Running RAG query for: ${title}`);

    const classification = await this.llmClassifier.classifyTicket(title, body);
    this.logger.log(`Classified intent: ${classification.intent} (confidence: ${classification.confidence})`);

    const category = this.intentToCategoryMap[classification.intent];
    const combinedQuery = `${title}\n${body}`;

    const rawResults = await this.vectorStore.searchSimilar(combinedQuery, 5, category);
    this.logger.log(`Found ${rawResults.length} relevant documents`);

    const context = this.buildKnowledgeContext(rawResults, classification.intent);

    return {
      classification,
      context,
      rawResults,
    };
  }

  private buildKnowledgeContext(
    results: VectorSearchResult[],
    intent: TicketIntent,
  ): KnowledgeContext {
    const relevantDocs: RelevantDocument[] = results.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      similarity: r.similarity,
    }));

    const suggestedActions = this.actionsService.getSuggestedActions(intent);
    const historicalResolutions = this.actionsService.getHistoricalResolutions(intent);

    return {
      relevantDocs,
      suggestedActions,
      historicalResolutions,
    };
  }
}
