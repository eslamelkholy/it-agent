export enum TicketIntent {
  PASSWORD_RESET = 'password_reset',
  SYSTEM_RESTART = 'system_restart',
  BACKUP_FAILURE = 'backup_failure',
  ACCESS_REQUEST = 'access_request',
  SOFTWARE_INSTALL = 'software_install',
  NETWORK_ISSUE = 'network_issue',
  EMAIL_ISSUE = 'email_issue',
  HARDWARE_ISSUE = 'hardware_issue',
  VPN_ISSUE = 'vpn_issue',
  PERFORMANCE_ISSUE = 'performance_issue',
  UNKNOWN = 'unknown',
}

export interface IntentClassification {
  intent: TicketIntent;
  confidence: number;
  isAutomatable: boolean;
  reasoning: string;
}

export interface KnowledgeContext {
  relevantDocs: RelevantDocument[];
  suggestedActions: string[];
  historicalResolutions: HistoricalResolution[];
}

export interface RelevantDocument {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export interface HistoricalResolution {
  ticketId: string;
  title: string;
  resolution: string;
  similarity: number;
}
