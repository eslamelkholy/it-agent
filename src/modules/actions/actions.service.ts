import { Injectable } from '@nestjs/common';
import { TicketIntent, HistoricalResolution } from '../rag/interfaces/rag.interfaces';
import { INTENT_ACTION_MAP, HISTORICAL_RESOLUTIONS } from './actions';

@Injectable()
export class ActionsService {
  getSuggestedActions(intent: TicketIntent): string[] {
    return INTENT_ACTION_MAP[intent] || INTENT_ACTION_MAP[TicketIntent.UNKNOWN];
  }

  getHistoricalResolutions(intent: TicketIntent): HistoricalResolution[] {
    return HISTORICAL_RESOLUTIONS[intent] || [];
  }
}
