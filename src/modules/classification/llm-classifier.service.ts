import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TicketIntent,
  IntentClassification,
} from '../rag/interfaces/rag.interfaces';
import {
  INTENT_CLASSIFICATION_SYSTEM_PROMPT,
  buildTicketClassificationPrompt,
} from './prompts';
import {
  OpenAIMessage,
  OpenAIChatResponse,
  ClassificationResponse,
} from './dto';
import { AUTOMATABLE_INTENTS } from '../actions';

@Injectable()
export class LlmClassifierService {
  private readonly logger = new Logger(LlmClassifierService.name);
  private readonly openaiApiKey: string;
  private readonly model = 'gpt-4.1-mini';
  private readonly openaiBaseUrl = 'https://api.openai.com/v1';

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
  }

  async classifyTicket(
    title: string,
    body: string,
  ): Promise<IntentClassification> {
    this.logger.log(`Classifying ticket: "${title}"`);

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: INTENT_CLASSIFICATION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildTicketClassificationPrompt(title, body),
      },
    ];

    const response = await this.callOpenAI(messages);
    const classification = this.parseClassificationResponse(response);

    this.logger.log(
      `Classified as ${classification.intent} with ${(classification.confidence * 100).toFixed(1)}% confidence`,
    );

    return classification;
  }

  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
    const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.1,
        max_tokens: 256,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`OpenAI API error: ${response.status} - ${errorBody}`);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data: OpenAIChatResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI returned empty response');
    }

    return data.choices[0].message.content;
  }

  private parseClassificationResponse(response: string): IntentClassification {
    let parsed: ClassificationResponse;

    try {
      parsed = JSON.parse(response);
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${response}`);
      return this.createUnknownClassification(
        'Failed to parse LLM response as JSON',
      );
    }

    if (!parsed.intent || typeof parsed.confidence !== 'number') {
      this.logger.error(`Invalid classification structure: ${response}`);
      return this.createUnknownClassification(
        'Invalid classification response structure',
      );
    }

    const validIntent = this.validateIntent(parsed.intent);
    const confidence = Math.min(Math.max(parsed.confidence, 0), 1);

    return {
      intent: validIntent,
      confidence,
      isAutomatable: AUTOMATABLE_INTENTS.has(validIntent),
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  }

  private validateIntent(intentStr: string): TicketIntent {
    const normalizedIntent = intentStr.toLowerCase().replace(/-/g, '_');

    const intentValues = Object.values(TicketIntent);
    const matchedIntent = intentValues.find(
      (intent) => intent === normalizedIntent,
    );

    if (matchedIntent) {
      return matchedIntent;
    }

    const upperIntent = intentStr.toUpperCase();
    const intentKey = Object.keys(TicketIntent).find(
      (key) => key === upperIntent,
    );

    if (intentKey) {
      return TicketIntent[intentKey as keyof typeof TicketIntent];
    }

    this.logger.warn(`Unknown intent from LLM: ${intentStr}`);
    return TicketIntent.UNKNOWN;
  }

  private createUnknownClassification(reason: string): IntentClassification {
    return {
      intent: TicketIntent.UNKNOWN,
      confidence: 0,
      isAutomatable: false,
      reasoning: reason,
    };
  }
}
