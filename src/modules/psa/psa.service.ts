import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { CreateTicketDto, UpdateTicketDto, CreateTicketAttachmentDto } from './dto';

@Injectable()
export class PsaService {
  private readonly logger = new Logger(PsaService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketAttachment)
    private readonly attachmentRepository: Repository<TicketAttachment>,
  ) {}

  async createTicket(createDto: CreateTicketDto): Promise<Ticket> {
    this.logger.log(`Creating ticket: ${createDto.title}`);
    const ticket = this.ticketRepository.create(createDto);
    const savedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Ticket created with ID: ${savedTicket.id}`);
    return savedTicket;
  }

  async findAllTickets(filters?: {
    clientId?: string;
    status?: TicketStatus;
    assignedTo?: string;
  }): Promise<Ticket[]> {
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoinAndSelect('ticket.rmmDevice', 'rmmDevice')
      .leftJoinAndSelect('ticket.assignedUser', 'assignedUser')
      .leftJoinAndSelect('ticket.attachments', 'attachments')
      .orderBy('ticket.createdAt', 'DESC');

    if (filters?.clientId) {
      queryBuilder.andWhere('ticket.clientId = :clientId', { clientId: filters.clientId });
    }
    if (filters?.status) {
      queryBuilder.andWhere('ticket.status = :status', { status: filters.status });
    }
    if (filters?.assignedTo) {
      queryBuilder.andWhere('ticket.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
    }

    return queryBuilder.getMany();
  }

  async findTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['client', 'rmmDevice', 'assignedUser', 'attachments'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }
    return ticket;
  }

  async findTicketByExternalId(externalTicketId: string): Promise<Ticket | null> {
    return this.ticketRepository.findOne({
      where: { externalTicketId },
      relations: ['client', 'rmmDevice', 'assignedUser', 'attachments'],
    });
  }

  async updateTicket(id: string, updateDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findTicketById(id);
    this.logger.log(`Updating ticket ${id}: status=${updateDto.status || ticket.status}`);
    Object.assign(ticket, updateDto);
    return this.ticketRepository.save(ticket);
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const ticket = await this.findTicketById(id);
    this.logger.log(`Updating ticket ${id} status: ${ticket.status} → ${status}`);
    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }

  async assignTicket(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.findTicketById(id);
    this.logger.log(`Assigning ticket ${id} to user ${userId}`);
    ticket.assignedTo = userId;
    if (ticket.status === TicketStatus.NEW) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }
    return this.ticketRepository.save(ticket);
  }

  async removeTicket(id: string): Promise<void> {
    const ticket = await this.findTicketById(id);
    this.logger.log(`Removing ticket ${id}`);
    await this.ticketRepository.remove(ticket);
  }

  async addAttachment(createDto: CreateTicketAttachmentDto): Promise<TicketAttachment> {
    await this.findTicketById(createDto.ticketId);
    this.logger.log(`Adding attachment to ticket ${createDto.ticketId}: ${createDto.fileName}`);
    const attachment = this.attachmentRepository.create(createDto);
    return this.attachmentRepository.save(attachment);
  }

  async findAttachmentsByTicket(ticketId: string): Promise<TicketAttachment[]> {
    return this.attachmentRepository.find({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });
  }

  async removeAttachment(id: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID "${id}" not found`);
    }
    this.logger.log(`Removing attachment ${id}`);
    await this.attachmentRepository.remove(attachment);
  }

  async getTicketStats(clientId?: string): Promise<{
    total: number;
    byStatus: Record<TicketStatus, number>;
  }> {
    const queryBuilder = this.ticketRepository.createQueryBuilder('ticket');
    
    if (clientId) {
      queryBuilder.where('ticket.clientId = :clientId', { clientId });
    }

    const tickets = await queryBuilder.getMany();
    
    const byStatus = {
      [TicketStatus.NEW]: 0,
      [TicketStatus.IN_PROGRESS]: 0,
      [TicketStatus.RESOLVED]: 0,
      [TicketStatus.CLOSED]: 0,
    };

    tickets.forEach((ticket) => {
      byStatus[ticket.status]++;
    });

    return {
      total: tickets.length,
      byStatus,
    };
  }
}
