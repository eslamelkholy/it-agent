import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeviceType, OsType, RmmPlatform } from '../entities/rmm-device.entity';

export class CreateRmmDeviceDto {
  @IsUUID()
  clientId: string;

  @IsString()
  deviceName: string;

  @IsString()
  @IsOptional()
  hostname?: string;

  @IsEnum(DeviceType)
  @IsOptional()
  deviceType?: DeviceType;

  @IsEnum(OsType)
  @IsOptional()
  osType?: OsType;

  @IsString()
  @IsOptional()
  osVersion?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  macAddress?: string;

  @IsEnum(RmmPlatform)
  @IsOptional()
  rmmPlatform?: RmmPlatform;

  @IsString()
  @IsOptional()
  externalDeviceId?: string;
}
