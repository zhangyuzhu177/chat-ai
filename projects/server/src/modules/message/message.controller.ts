import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { IsLogin } from 'src/guards';
import { CreateMessageDto } from './dto';
import { MessageService } from './message.service';

@Controller('message')
@IsLogin()
export class MessageController {
  constructor(private readonly _messageSrv: MessageService) {}

  /**
   * 创建消息
   */
  @Post()
  @IsLogin()
  createMessage(@Body() dto: CreateMessageDto) {
    return this._messageSrv.createMessage(dto);
  }

  /**
   * 获取对话的所有消息
   */
  @Get('conversation/:conversationId')
  @IsLogin()
  getMessagesByConversationId(@Param('conversationId') conversationId: string) {
    return this._messageSrv.getMessagesByConversationId(conversationId);
  }

  /**
   * 删除对话的所有消息
   */
  @Delete('conversation/:conversationId')
  @IsLogin()
  deleteMessagesByConversationId(@Param('conversationId') conversationId: string) {
    return this._messageSrv.deleteMessagesByConversationId(conversationId);
  }
}
