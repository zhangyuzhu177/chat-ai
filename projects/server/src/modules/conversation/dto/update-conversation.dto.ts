import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateConversationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsObject()
  @IsOptional()
  config?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    [key: string]: any;
  };

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}
