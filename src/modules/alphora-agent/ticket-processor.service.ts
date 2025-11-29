import { Injectable, Logger } from '@nestjs/common';
import { RagOrchestratorService } from '../rag';
import { Ticket } from '../psa/entities/ticket.entity';
import { ActionPlannerService } from './action-planner.service';
import { EscalationService } from './escalation.service';
import {
  TicketAnalysis,
  AgentDecision,
} from './interfaces/agent.interfaces';

@Injectable()
export class TicketProcessorService {
  private readonly logger = new Logger(TicketProcessorService.name);

  constructor(
    private readonly ragOrchestrator: RagOrchestratorService,
    private readonly actionPlanner: ActionPlannerService,
    private readonly escalationService: EscalationService,
  ) {}

  async processTicket(ticket: Ticket): Promise<TicketAnalysis> {
    this.logger.log(`Processing ticket: ${ticket.id} - ${ticket.title}`);

    const ragResult = await this.ragOrchestrator.runRagQuery(
      ticket.title,
      ticket.body,
    );

    this.logger.log(
      `Classification: ${ragResult.classification.intent} (confidence: ${ragResult.classification.confidence})`,
    );
    this.logger.log(`Found ${ragResult.rawResults.length} relevant knowledge base articles`);

    const escalationCheck = this.escalationService.shouldEscalate(ragResult.classification);

    if (escalationCheck.shouldEscalate) {
      this.logger.warn(`Ticket ${ticket.id} requires escalation: ${escalationCheck.reason}`);

      const escalationContext = await this.escalationService.escalate(
        ticket.id,
        escalationCheck.reason!,
        ragResult.classification,
      );

      return {
        ticketId: ticket.id,
        classification: ragResult.classification,
        context: {
          relevantDocs: ragResult.context.relevantDocs,
          suggestedActions: escalationContext.suggestedNextSteps,
          historicalResolutions: [],
        },
        decision: AgentDecision.ESCALATE,
        escalationReason: escalationCheck.reason,
        actionPlan: {
          intent: ragResult.classification.intent,
          steps: [],
          estimatedDuration: 0,
          requiresApproval: false,
        },
        processedAt: new Date(),
      };
    }

    const actionPlan = await this.actionPlanner.createActionPlan(
      ragResult.classification.intent,
      ragResult.context,
    );

    const analysis: TicketAnalysis = {
      ticketId: ticket.id,
      classification: ragResult.classification,
      context: ragResult.context,
      decision: AgentDecision.AUTOMATE,
      actionPlan,
      processedAt: new Date(),
    };

    this.printAnalysisSummary(analysis);

    return analysis;
  }

  private printAnalysisSummary(analysis: TicketAnalysis): void {
    this.logger.log('========== TICKET ANALYSIS SUMMARY ==========');
    this.logger.log(`Ticket ID: ${analysis.ticketId}`);
    this.logger.log(`Intent: ${analysis.classification.intent}`);
    this.logger.log(`Confidence: ${analysis.classification.confidence}`);
    this.logger.log(`Decision: ${analysis.decision}`);
    this.logger.log(`Automatable: ${analysis.classification.isAutomatable}`);
    this.logger.log(`Reasoning: ${analysis.classification.reasoning}`);
    
    if (analysis.context.relevantDocs.length > 0) {
      this.logger.log('Relevant Knowledge Base Articles:');
      for (const doc of analysis.context.relevantDocs) {
        this.logger.log(`  - ${doc.title} (similarity: ${doc.similarity})`);
      }
    }
    
    if (analysis.context.historicalResolutions.length > 0) {
      this.logger.log('Similar Historical Tickets:');
      for (const hist of analysis.context.historicalResolutions) {
        this.logger.log(`  - ${hist.title} (similarity: ${hist.similarity})`);
      }
    }
    
    this.logger.log(`Action Plan: ${analysis.actionPlan.steps.length} steps`);
    this.logger.log(`Estimated Duration: ${analysis.actionPlan.estimatedDuration} minutes`);
    this.logger.log('=============================================');
  }
}
