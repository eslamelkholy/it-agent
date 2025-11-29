import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { PsaService } from './psa.service';
import { PsaController } from './psa.controller';
import { AlphoraAgentModule } from '../alphora-agent';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketAttachment]),
    forwardRef(() => AlphoraAgentModule),
  ],
  controllers: [PsaController],
  providers: [PsaService],
  exports: [PsaService],
})
export class PsaModule {}
