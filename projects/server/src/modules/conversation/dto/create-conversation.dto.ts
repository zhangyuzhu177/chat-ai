import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  modelId: string;

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
}
