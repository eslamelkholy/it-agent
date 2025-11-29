import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  resolutionSteps?: string;

  @IsUUID()
  @IsOptional()
  knowledgeBaseArticleId?: string;
}
