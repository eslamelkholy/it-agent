import { TicketIntent, HistoricalResolution } from '../rag/interfaces/rag.interfaces';

export const INTENT_ACTION_MAP: Record<TicketIntent, string[]> = {
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

export const HISTORICAL_RESOLUTIONS: Record<TicketIntent, HistoricalResolution[]> = {
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
