import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmClassifierService } from './llm-classifier.service';

@Module({
  imports: [ConfigModule],
  providers: [LlmClassifierService],
  exports: [LlmClassifierService],
})
export class ClassificationModule {}
