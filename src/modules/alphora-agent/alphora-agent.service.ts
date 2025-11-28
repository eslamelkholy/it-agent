import { Injectable, Logger } from '@nestjs/common';
import { Ticket } from '../psa/entities/ticket.entity';
import { TicketProcessorService } from './ticket-processor.service';
import { TicketAnalysis, AgentDecision } from './interfaces/agent.interfaces';

@Injectable()
export class AlphoraAgentService {
  private readonly logger = new Logger(AlphoraAgentService.name);

  constructor(private readonly ticketProcessor: TicketProcessorService) {}

  async handleNewTicket(ticket: Ticket): Promise<TicketAnalysis> {
    this.logger.log(`========================================`);
    this.logger.log(`ALPHORA AGENT - New Ticket Received`);
    this.logger.log(`Ticket ID: ${ticket.id}`);
    this.logger.log(`Title: ${ticket.title}`);
    this.logger.log(`Client ID: ${ticket.clientId}`);
    this.logger.log(`========================================`);

    const analysis = await this.ticketProcessor.processTicket(ticket);

    if (analysis.decision === AgentDecision.AUTOMATE) {
      this.logger.log(`Ticket ${ticket.id} is automatable. Action plan ready for execution.`);
    } else if (analysis.decision === AgentDecision.ESCALATE) {
      this.logger.warn(`Ticket ${ticket.id} escalated to human technician.`);
    }

    return analysis;
  }
}
