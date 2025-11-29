import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Logger,
} from '@nestjs/common';
import { PsaService } from './psa.service';
import { CreateTicketDto, UpdateTicketDto, CreateTicketAttachmentDto } from './dto';
import { TicketStatus } from './entities/ticket.entity';
import { AlphoraAgentService } from '../alphora-agent';

@Controller('psa')
export class PsaController {
  private readonly logger = new Logger(PsaController.name);

  constructor(
    private readonly psaService: PsaService,
    private readonly alphoraAgent: AlphoraAgentService,
  ) {}

  @Post('tickets')
  createTicket(@Body() createDto: CreateTicketDto) {
    return this.psaService.createTicket(createDto);
  }

  @Post('webhook/tickets')
  async handleTicketWebhook(@Body() createDto: CreateTicketDto) {
    this.logger.log(`Webhook received: ${createDto.title}`);

    const ticket = await this.psaService.createTicket(createDto);
    this.logger.log(`Ticket created: ${ticket.id}`);

    setImmediate(async () => {
      try {
        await this.alphoraAgent.handleNewTicket(ticket);
      } catch (error) {
        this.logger.error(`Agent processing failed for ticket ${ticket.id}:`, error);
      }
    });

    return ticket;
  }

  @Get('tickets')
  findAllTickets(
    @Query('clientId') clientId?: string,
    @Query('status') status?: TicketStatus,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.psaService.findAllTickets({ clientId, status, assignedTo });
  }

  @Get('tickets/stats')
  getTicketStats(@Query('clientId') clientId?: string) {
    return this.psaService.getTicketStats(clientId);
  }

  @Get('tickets/:id')
  findTicketById(@Param('id', ParseUUIDPipe) id: string) {
    return this.psaService.findTicketById(id);
  }

  @Get('tickets/external/:externalId')
  findTicketByExternalId(@Param('externalId') externalId: string) {
    return this.psaService.findTicketByExternalId(externalId);
  }

  @Patch('tickets/:id')
  updateTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTicketDto,
  ) {
    return this.psaService.updateTicket(id, updateDto);
  }

  @Patch('tickets/:id/status')
  updateTicketStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.psaService.updateTicketStatus(id, status);
  }

  @Patch('tickets/:id/assign')
  assignTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.psaService.assignTicket(id, userId);
  }

  @Delete('tickets/:id')
  removeTicket(@Param('id', ParseUUIDPipe) id: string) {
    return this.psaService.removeTicket(id);
  }

  @Post('attachments')
  addAttachment(@Body() createDto: CreateTicketAttachmentDto) {
    return this.psaService.addAttachment(createDto);
  }

  @Get('tickets/:ticketId/attachments')
  findAttachmentsByTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.psaService.findAttachmentsByTicket(ticketId);
  }

  @Delete('attachments/:id')
  removeAttachment(@Param('id', ParseUUIDPipe) id: string) {
    return this.psaService.removeAttachment(id);
  }
}
