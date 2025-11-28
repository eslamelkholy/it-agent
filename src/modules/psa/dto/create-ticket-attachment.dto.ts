import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateTicketAttachmentDto {
  @IsUUID()
  ticketId: string;

  @IsString()
  fileName: string;

  @IsUrl()
  fileUrl: string;

  @IsString()
  @IsOptional()
  fileType?: string;
}
