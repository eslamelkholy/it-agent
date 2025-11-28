import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsUUID()
  clientId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  phone?: string;
}
