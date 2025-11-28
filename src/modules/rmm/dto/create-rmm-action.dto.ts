import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ActionType } from '../entities/rmm-action.entity';

export class CreateRmmActionDto {
  @IsUUID()
  rmmDeviceId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEnum(ActionType)
  actionType: ActionType;

  @IsString()
  @IsOptional()
  actionName?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
