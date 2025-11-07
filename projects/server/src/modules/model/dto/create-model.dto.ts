import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateModelDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
