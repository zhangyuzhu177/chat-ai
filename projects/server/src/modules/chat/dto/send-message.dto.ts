import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  modelId?: string; // 可选，用于切换模型
}
