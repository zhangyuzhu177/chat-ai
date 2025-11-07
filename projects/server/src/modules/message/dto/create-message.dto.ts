import { IsString, IsEnum, IsOptional, IsObject, IsNumber } from 'class-validator';
import { MessageRole } from 'src/entities';

export class CreateMessageDto {
  @IsString()
  conversationId: string;

  @IsEnum(MessageRole)
  role: MessageRole;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  tokenCount?: number;

  @IsObject()
  @IsOptional()
  metadata?: {
    finishReason?: string;
    model?: string;
    attachments?: any[];
    [key: string]: any;
  };
}
