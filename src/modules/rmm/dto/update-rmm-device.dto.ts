import { PartialType } from '@nestjs/mapped-types';
import { CreateRmmDeviceDto } from './create-rmm-device.dto';

export class UpdateRmmDeviceDto extends PartialType(CreateRmmDeviceDto) {}
