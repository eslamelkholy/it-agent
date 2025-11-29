import { TicketIntent, IntentClassification, KnowledgeContext } from '../../rag';

export enum AgentDecision {
  AUTOMATE = 'automate',
  ESCALATE = 'escalate',
  PENDING_INFO = 'pending_info',
}

export enum EscalationReason {
  LOW_CONFIDENCE = 'low_confidence',
  NOT_AUTOMATABLE = 'not_automatable',
  ACTION_FAILED = 'action_failed',
  REQUIRES_HUMAN = 'requires_human',
  UNKNOWN_INTENT = 'unknown_intent',
}

export interface TicketAnalysis {
  ticketId: string;
  classification: IntentClassification;
  context: KnowledgeContext;
  decision: AgentDecision;
  escalationReason?: EscalationReason;
  actionPlan: ActionPlan;
  processedAt: Date;
}

export interface ActionPlan {
  intent: TicketIntent;
  steps: ActionStep[];
  estimatedDuration: number;
  requiresApproval: boolean;
}

export interface ActionStep {
  order: number;
  action: string;
  tool: string;
  parameters: Record<string, unknown>;
  status: ActionStepStatus;
  result?: string;
  error?: string;
}

export enum ActionStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface EscalationContext {
  ticketId: string;
  reason: EscalationReason;
  classification: IntentClassification;
  attemptedActions: ActionStep[];
  suggestedNextSteps: string[];
  escalatedAt: Date;
}
