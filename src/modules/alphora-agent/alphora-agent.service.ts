import { Injectable, Logger } from '@nestjs/common';
import { Ticket, TicketStatus } from '../psa/entities/ticket.entity';
import { PsaService } from '../psa/psa.service';
import { TicketProcessorService } from './ticket-processor.service';
import { TicketAnalysis, AgentDecision } from './interfaces/agent.interfaces';

@Injectable()
export class AlphoraAgentService {
  private readonly logger = new Logger(AlphoraAgentService.name);

  constructor(
    private readonly ticketProcessor: TicketProcessorService,
    private readonly psaService: PsaService,
  ) {}

  async handleNewTicket(ticket: Ticket): Promise<TicketAnalysis> {
    this.logger.log(`========================================`);
    this.logger.log(`ALPHORA AGENT - New Ticket Received`);
    this.logger.log(`Ticket ID: ${ticket.id}`);
    this.logger.log(`Title: ${ticket.title}`);
    this.logger.log(`Client ID: ${ticket.clientId}`);
    this.logger.log(`========================================`);

    await this.psaService.updateTicketStatus(ticket.id, TicketStatus.PROCESSING);

    const analysis = await this.ticketProcessor.processTicket(ticket);

    if (analysis.decision === AgentDecision.AUTOMATE) {
      await this.psaService.updateTicketStatus(ticket.id, TicketStatus.RESOLVED);
      this.logger.log(`Ticket ${ticket.id} is automatable. Action plan ready for execution.`);
    } else if (analysis.decision === AgentDecision.ESCALATE) {
      await this.psaService.updateTicketStatus(ticket.id, TicketStatus.IN_PROGRESS);
      this.logger.warn(`Ticket ${ticket.id} escalated to human technician.`);
    }

    return analysis;
  }
}
