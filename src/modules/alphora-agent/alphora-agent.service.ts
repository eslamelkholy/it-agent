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
      const topKbArticle = analysis.context.relevantDocs[0];

      await this.psaService.updateTicket(ticket.id, {
        status: TicketStatus.RESOLVED,
        resolutionSteps: topKbArticle?.content,
        knowledgeBaseArticleId: topKbArticle?.id,
      });
      this.logger.log(`Ticket ${ticket.id} resolved using KB article: ${topKbArticle?.title || 'N/A'}`);
    } else if (analysis.decision === AgentDecision.ESCALATE) {
      await this.psaService.updateTicketStatus(ticket.id, TicketStatus.IN_PROGRESS);
      this.logger.warn(`Ticket ${ticket.id} escalated to human technician.`);
    }

    return analysis;
  }
}
