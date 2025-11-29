import { Module, forwardRef } from '@nestjs/common';
import { RagModule } from '../rag';
import { PsaModule } from '../psa';
import { AlphoraAgentService } from './alphora-agent.service';
import { TicketProcessorService } from './ticket-processor.service';
import { ActionPlannerService } from './action-planner.service';
import { EscalationService } from './escalation.service';

@Module({
  imports: [RagModule, forwardRef(() => PsaModule)],
  providers: [
    AlphoraAgentService,
    TicketProcessorService,
    ActionPlannerService,
    EscalationService,
  ],
  exports: [AlphoraAgentService],
})
export class AlphoraAgentModule {}
