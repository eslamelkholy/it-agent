import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService, VectorSearchResult } from './vector-store.service';
import { KnowledgeCategory } from './entities/knowledge-base.entity';
import {
  TicketIntent,
  IntentClassification,
  KnowledgeContext,
  RelevantDocument,
  HistoricalResolution,
} from './interfaces/rag.interfaces';
import { LlmClassifierService } from '../classification';

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

    const suggestedActions = this.getSuggestedActions(intent);
    const historicalResolutions = this.getHistoricalResolutions(intent);

    return {
      relevantDocs,
      suggestedActions,
      historicalResolutions,
    };
  }

  private getSuggestedActions(intent: TicketIntent): string[] {
    const actionMap: Record<TicketIntent, string[]> = {
      [TicketIntent.PASSWORD_RESET]: [
        'Verify user identity via security questions or manager approval',
        'Reset password in Active Directory',
        'Send temporary password to user via secure channel',
        'Force password change at next logon',
        'Update ticket with resolution details',
      ],
      [TicketIntent.SYSTEM_RESTART]: [
        'Check for unsaved user work',
        'Notify user of impending restart',
        'Execute remote restart via RMM',
        'Verify system comes back online',
        'Confirm with user that issue is resolved',
      ],
      [TicketIntent.BACKUP_FAILURE]: [
        'Check backup server disk space',
        'Verify backup service credentials',
        'Review backup job error logs',
        'Test network connectivity to backup target',
        'Re-run backup job manually if appropriate',
      ],
      [TicketIntent.ACCESS_REQUEST]: [
        'Verify request approval from manager',
        'Create user account in Active Directory',
        'Assign appropriate security groups',
        'Set up email mailbox',
        'Configure VPN access if required',
      ],
      [TicketIntent.SOFTWARE_INSTALL]: [
        'Verify software licensing availability',
        'Check system requirements',
        'Deploy software via RMM',
        'Verify installation success',
        'Configure software settings if needed',
      ],
      [TicketIntent.NETWORK_ISSUE]: [
        'Verify physical network connection',
        'Check IP address configuration',
        'Test DNS resolution',
        'Verify network share permissions',
        'Check firewall rules if applicable',
      ],
      [TicketIntent.EMAIL_ISSUE]: [
        'Verify Outlook/Exchange connectivity',
        'Check mailbox size and quotas',
        'Clear Outlook cache if needed',
        'Recreate email profile if necessary',
        'Verify autodiscover settings',
      ],
      [TicketIntent.VPN_ISSUE]: [
        'Verify VPN client is up to date',
        'Check user VPN credentials',
        'Test base internet connectivity',
        'Review VPN client logs',
        'Escalate to network team if persistent',
      ],
      [TicketIntent.HARDWARE_ISSUE]: [
        'Gather hardware details and symptoms',
        'Escalate to on-site technician',
        'Arrange hardware replacement if needed',
      ],
      [TicketIntent.PERFORMANCE_ISSUE]: [
        'Check system resource usage',
        'Review startup programs',
        'Run disk cleanup and defragmentation',
        'Check for malware',
        'Consider hardware upgrade if persistent',
      ],
      [TicketIntent.UNKNOWN]: [
        'Review ticket details manually',
        'Request additional information from user',
        'Escalate to appropriate team',
      ],
    };

    return actionMap[intent] || actionMap[TicketIntent.UNKNOWN];
  }

  private getHistoricalResolutions(intent: TicketIntent): HistoricalResolution[] {
    const historicalData: Record<TicketIntent, HistoricalResolution[]> = {
      [TicketIntent.PASSWORD_RESET]: [
        {
          ticketId: 'HIST-001',
          title: 'User locked out of account',
          resolution: 'Reset password in AD, provided temp password via Teams call',
          similarity: 0.89,
        },
      ],
      [TicketIntent.SYSTEM_RESTART]: [
        {
          ticketId: 'HIST-002',
          title: 'Workstation frozen after update',
          resolution: 'Remote restart via Datto RMM, verified system stability post-restart',
          similarity: 0.85,
        },
      ],
      [TicketIntent.BACKUP_FAILURE]: [
        {
          ticketId: 'HIST-003',
          title: 'Backup job failed with error 0x80070005',
          resolution: 'Updated service account credentials, re-ran backup successfully',
          similarity: 0.91,
        },
      ],
      [TicketIntent.SOFTWARE_INSTALL]: [],
      [TicketIntent.NETWORK_ISSUE]: [],
      [TicketIntent.EMAIL_ISSUE]: [],
      [TicketIntent.VPN_ISSUE]: [],
      [TicketIntent.HARDWARE_ISSUE]: [],
      [TicketIntent.ACCESS_REQUEST]: [],
      [TicketIntent.PERFORMANCE_ISSUE]: [],
      [TicketIntent.UNKNOWN]: [],
    };

    return historicalData[intent] || [];
  }
}
