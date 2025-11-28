import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { ClientModule } from './modules/client/client.module';
import { UserModule } from './modules/user/user.module';
import { RmmModule } from './modules/rmm/rmm.module';
import { PsaModule } from './modules/psa/psa.module';
import { RagModule } from './modules/rag/rag.module';
import { AlphoraAgentModule } from './modules/alphora-agent/alphora-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    ClientModule,
    UserModule,
    RmmModule,
    RagModule,
    AlphoraAgentModule,
    PsaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
