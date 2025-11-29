import { Injectable, Logger } from '@nestjs/common';
import { TicketIntent, KnowledgeContext } from '../rag';
import {
  ActionPlan,
  ActionStep,
  ActionStepStatus,
} from './interfaces/agent.interfaces';

@Injectable()
export class ActionPlannerService {
  private readonly logger = new Logger(ActionPlannerService.name);

  async createActionPlan(
    intent: TicketIntent,
    context: KnowledgeContext,
  ): Promise<ActionPlan> {
    this.logger.log(`Creating action plan for intent: ${intent}`);

    const steps = this.generateSteps(intent, context);
    const estimatedDuration = this.estimateDuration(intent, steps);
    const requiresApproval = this.checkApprovalRequired(intent);

    const plan: ActionPlan = {
      intent,
      steps,
      estimatedDuration,
      requiresApproval,
    };

    this.logger.log(`Action plan created with ${steps.length} steps`);
    this.printActionPlan(plan);

    return plan;
  }

  private generateSteps(intent: TicketIntent, context: KnowledgeContext): ActionStep[] {
    const stepTemplates = this.getStepTemplates(intent);

    return stepTemplates.map((template, index) => ({
      order: index + 1,
      action: template.action,
      tool: template.tool,
      parameters: template.parameters,
      status: ActionStepStatus.PENDING,
    }));
  }

  private getStepTemplates(intent: TicketIntent): Array<{
    action: string;
    tool: string;
    parameters: Record<string, unknown>;
  }> {
    const templates: Record<TicketIntent, Array<{
      action: string;
      tool: string;
      parameters: Record<string, unknown>;
    }>> = {
      [TicketIntent.PASSWORD_RESET]: [
        {
          action: 'Verify user identity',
          tool: 'identity_verification',
          parameters: { method: 'security_questions' },
        },
        {
          action: 'Reset password in Active Directory',
          tool: 'active_directory',
          parameters: { operation: 'reset_password', forceChange: true },
        },
        {
          action: 'Send temporary password',
          tool: 'secure_messaging',
          parameters: { channel: 'teams' },
        },
        {
          action: 'Update ticket status',
          tool: 'psa_api',
          parameters: { status: 'resolved' },
        },
      ],
      [TicketIntent.SYSTEM_RESTART]: [
        {
          action: 'Check for active user sessions',
          tool: 'rmm_agent',
          parameters: { operation: 'get_logged_users' },
        },
        {
          action: 'Notify user of restart',
          tool: 'rmm_agent',
          parameters: { operation: 'send_notification', message: 'System restart in 5 minutes' },
        },
        {
          action: 'Execute remote restart',
          tool: 'rmm_agent',
          parameters: { operation: 'restart', delay: 300 },
        },
        {
          action: 'Verify system online',
          tool: 'rmm_agent',
          parameters: { operation: 'ping', timeout: 600 },
        },
      ],
      [TicketIntent.BACKUP_FAILURE]: [
        {
          action: 'Check backup server disk space',
          tool: 'rmm_agent',
          parameters: { operation: 'check_disk_space' },
        },
        {
          action: 'Verify backup service status',
          tool: 'rmm_agent',
          parameters: { operation: 'check_service', serviceName: 'backup_service' },
        },
        {
          action: 'Review backup error logs',
          tool: 'log_analyzer',
          parameters: { logType: 'backup', timeRange: '24h' },
        },
        {
          action: 'Restart backup job',
          tool: 'backup_api',
          parameters: { operation: 'restart_job' },
        },
      ],
      [TicketIntent.SOFTWARE_INSTALL]: [
        {
          action: 'Check system requirements',
          tool: 'rmm_agent',
          parameters: { operation: 'get_system_info' },
        },
        {
          action: 'Verify software license',
          tool: 'license_manager',
          parameters: { operation: 'check_availability' },
        },
        {
          action: 'Deploy software package',
          tool: 'rmm_agent',
          parameters: { operation: 'deploy_package' },
        },
        {
          action: 'Verify installation',
          tool: 'rmm_agent',
          parameters: { operation: 'verify_install' },
        },
      ],
      [TicketIntent.ACCESS_REQUEST]: [
        {
          action: 'Verify manager approval',
          tool: 'approval_workflow',
          parameters: { approverType: 'manager' },
        },
        {
          action: 'Create AD account',
          tool: 'active_directory',
          parameters: { operation: 'create_user' },
        },
        {
          action: 'Assign security groups',
          tool: 'active_directory',
          parameters: { operation: 'add_groups' },
        },
        {
          action: 'Setup email mailbox',
          tool: 'exchange_api',
          parameters: { operation: 'create_mailbox' },
        },
      ],
      [TicketIntent.NETWORK_ISSUE]: [
        {
          action: 'Check network connectivity',
          tool: 'rmm_agent',
          parameters: { operation: 'network_diagnostics' },
        },
        {
          action: 'Verify DNS resolution',
          tool: 'rmm_agent',
          parameters: { operation: 'dns_lookup' },
        },
        {
          action: 'Check share permissions',
          tool: 'active_directory',
          parameters: { operation: 'check_permissions' },
        },
      ],
      [TicketIntent.EMAIL_ISSUE]: [
        {
          action: 'Check Outlook connectivity',
          tool: 'rmm_agent',
          parameters: { operation: 'test_outlook' },
        },
        {
          action: 'Verify mailbox status',
          tool: 'exchange_api',
          parameters: { operation: 'get_mailbox_status' },
        },
        {
          action: 'Clear Outlook cache',
          tool: 'rmm_agent',
          parameters: { operation: 'clear_outlook_cache' },
        },
      ],
      [TicketIntent.VPN_ISSUE]: [
        {
          action: 'Check VPN client version',
          tool: 'rmm_agent',
          parameters: { operation: 'get_software_version', software: 'vpn_client' },
        },
        {
          action: 'Test internet connectivity',
          tool: 'rmm_agent',
          parameters: { operation: 'test_internet' },
        },
        {
          action: 'Review VPN logs',
          tool: 'log_analyzer',
          parameters: { logType: 'vpn' },
        },
      ],
      [TicketIntent.HARDWARE_ISSUE]: [
        {
          action: 'Collect hardware diagnostics',
          tool: 'rmm_agent',
          parameters: { operation: 'hardware_diagnostics' },
        },
        {
          action: 'Escalate to on-site support',
          tool: 'escalation',
          parameters: { team: 'field_services' },
        },
      ],
      [TicketIntent.PERFORMANCE_ISSUE]: [
        {
          action: 'Check system resources',
          tool: 'rmm_agent',
          parameters: { operation: 'get_resource_usage' },
        },
        {
          action: 'Review startup programs',
          tool: 'rmm_agent',
          parameters: { operation: 'list_startup' },
        },
        {
          action: 'Run disk cleanup',
          tool: 'rmm_agent',
          parameters: { operation: 'disk_cleanup' },
        },
      ],
      [TicketIntent.UNKNOWN]: [
        {
          action: 'Escalate for manual review',
          tool: 'escalation',
          parameters: { team: 'l2_support' },
        },
      ],
    };

    return templates[intent] || templates[TicketIntent.UNKNOWN];
  }

  private estimateDuration(intent: TicketIntent, steps: ActionStep[]): number {
    const baseDurations: Record<TicketIntent, number> = {
      [TicketIntent.PASSWORD_RESET]: 5,
      [TicketIntent.SYSTEM_RESTART]: 15,
      [TicketIntent.BACKUP_FAILURE]: 30,
      [TicketIntent.SOFTWARE_INSTALL]: 20,
      [TicketIntent.ACCESS_REQUEST]: 45,
      [TicketIntent.NETWORK_ISSUE]: 20,
      [TicketIntent.EMAIL_ISSUE]: 15,
      [TicketIntent.VPN_ISSUE]: 15,
      [TicketIntent.HARDWARE_ISSUE]: 60,
      [TicketIntent.PERFORMANCE_ISSUE]: 25,
      [TicketIntent.UNKNOWN]: 30,
    };

    return baseDurations[intent] || 30;
  }

  private checkApprovalRequired(intent: TicketIntent): boolean {
    const requiresApproval = new Set([
      TicketIntent.ACCESS_REQUEST,
      TicketIntent.SOFTWARE_INSTALL,
    ]);

    return requiresApproval.has(intent);
  }

  private printActionPlan(plan: ActionPlan): void {
    this.logger.log('========== ACTION PLAN ==========');
    this.logger.log(`Intent: ${plan.intent}`);
    this.logger.log(`Estimated Duration: ${plan.estimatedDuration} minutes`);
    this.logger.log(`Requires Approval: ${plan.requiresApproval}`);
    this.logger.log('Steps:');
    
    for (const step of plan.steps) {
      this.logger.log(`  ${step.order}. [${step.tool}] ${step.action}`);
      this.logger.log(`     Parameters: ${JSON.stringify(step.parameters)}`);
    }
    
    this.logger.log('=================================');
  }
}
