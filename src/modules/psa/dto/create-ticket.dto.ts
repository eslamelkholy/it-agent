import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  @IsOptional()
  rmmDeviceId?: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsString()
  body: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsString()
  @IsOptional()
  externalTicketId?: string;
}
