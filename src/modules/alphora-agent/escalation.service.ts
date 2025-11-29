import { Injectable, Logger } from '@nestjs/common';
import { IntentClassification } from '../rag';
import {
  EscalationContext,
  EscalationReason,
  ActionStep,
} from './interfaces/agent.interfaces';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  async escalate(
    ticketId: string,
    reason: EscalationReason,
    classification: IntentClassification,
    attemptedActions: ActionStep[] = [],
  ): Promise<EscalationContext> {
    this.logger.warn(`Escalating ticket ${ticketId} - Reason: ${reason}`);

    const suggestedNextSteps = this.getSuggestedNextSteps(reason, classification);

    const escalationContext: EscalationContext = {
      ticketId,
      reason,
      classification,
      attemptedActions,
      suggestedNextSteps,
      escalatedAt: new Date(),
    };

    this.printEscalation(escalationContext);

    return escalationContext;
  }

  shouldEscalate(classification: IntentClassification): { shouldEscalate: boolean; reason?: EscalationReason } {
    if (!classification.isAutomatable) {
      return { shouldEscalate: true, reason: EscalationReason.NOT_AUTOMATABLE };
    }

    if (classification.confidence < 0.3) {
      return { shouldEscalate: true, reason: EscalationReason.LOW_CONFIDENCE };
    }

    if (classification.intent === 'unknown') {
      return { shouldEscalate: true, reason: EscalationReason.UNKNOWN_INTENT };
    }

    return { shouldEscalate: false };
  }

  private getSuggestedNextSteps(
    reason: EscalationReason,
    classification: IntentClassification,
  ): string[] {
    const baseSteps: Record<EscalationReason, string[]> = {
      [EscalationReason.LOW_CONFIDENCE]: [
        'Review ticket details for additional context',
        'Contact user for clarification',
        'Manually classify ticket intent',
        'Update classification training data',
      ],
      [EscalationReason.NOT_AUTOMATABLE]: [
        `Manual intervention required for ${classification.intent}`,
        'Review client-specific procedures',
        'Consider remote session for complex issues',
        'Document resolution for future automation',
      ],
      [EscalationReason.ACTION_FAILED]: [
        'Review action logs for error details',
        'Attempt manual execution of failed step',
        'Check system connectivity and permissions',
        'Escalate to senior technician if persistent',
      ],
      [EscalationReason.REQUIRES_HUMAN]: [
        'Schedule call with end user',
        'Coordinate with on-site resources if needed',
        'Review security implications',
        'Obtain necessary approvals',
      ],
      [EscalationReason.UNKNOWN_INTENT]: [
        'Manually review ticket content',
        'Contact user for additional information',
        'Categorize ticket appropriately',
        'Consider adding new intent category',
      ],
    };

    return baseSteps[reason] || baseSteps[EscalationReason.UNKNOWN_INTENT];
  }

  private printEscalation(context: EscalationContext): void {
    this.logger.warn('========== ESCALATION ==========');
    this.logger.warn(`Ticket ID: ${context.ticketId}`);
    this.logger.warn(`Reason: ${context.reason}`);
    this.logger.warn(`Intent: ${context.classification.intent}`);
    this.logger.warn(`Confidence: ${context.classification.confidence}`);
    this.logger.warn(`Escalated At: ${context.escalatedAt.toISOString()}`);
    this.logger.warn('Suggested Next Steps:');
    
    for (const step of context.suggestedNextSteps) {
      this.logger.warn(`  - ${step}`);
    }
    
    if (context.attemptedActions.length > 0) {
      this.logger.warn('Attempted Actions:');
      for (const action of context.attemptedActions) {
        this.logger.warn(`  ${action.order}. ${action.action} - ${action.status}`);
        if (action.error) {
          this.logger.warn(`     Error: ${action.error}`);
        }
      }
    }
    
    this.logger.warn('=================================');
  }
}
