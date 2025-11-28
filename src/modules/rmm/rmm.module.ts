import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RmmDevice } from './entities/rmm-device.entity';
import { RmmAction } from './entities/rmm-action.entity';
import { RmmService } from './rmm.service';
import { RmmController } from './rmm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RmmDevice, RmmAction])],
  controllers: [RmmController],
  providers: [RmmService],
  exports: [RmmService],
})
export class RmmModule {}
