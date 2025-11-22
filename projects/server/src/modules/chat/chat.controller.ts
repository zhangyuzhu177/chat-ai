import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';
import { IsLogin } from 'src/guards';
import { MessageService } from '../message/message.service';
import { MessageRole } from 'src/entities';
import { ConversationService } from '../conversation/conversation.service';

@Controller('chat')
@IsLogin()
export class ChatController {
  constructor(
    private readonly _chatSrv: ChatService,
    private readonly _messageSrv: MessageService,
    private readonly _conversationSrv: ConversationService,
  ) {}

  /**
   * 发送消息（普通响应）
   */
  @Post('send')
  @IsLogin()
  async sendMessage(@Req() req: Request, @Body() dto: SendMessageDto) {
    const userId = req.user?.id || '';
    return await this._chatSrv.sendMessage(userId, dto);
  }

  /**
   * 发送消息（流式响应）
   */
  @Post('send-stream')
  @IsLogin()
  async sendMessageStream(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: SendMessageDto,
  ) {
    const userId = req.user?.id || '';
    const { stream, userMessage, conversationId, conversation, userContent } =
      await this._chatSrv.sendMessageStream(userId, dto);

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullContent = '';
    let tokenCount = 0;

    try {
      // 流式发送数据
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;

        if (content) {
          const data = JSON.stringify({ content });
          res.write(`data: ${data}\n\n`);
        }
      }

      // 保存 AI 响应消息
      await this._messageSrv.createMessage({
        conversationId,
        role: MessageRole.ASSISTANT,
        content: fullContent,
        tokenCount,
        metadata: {
          model: 'deepseek-chat',
        },
      });

      // 更新对话统计
      await this._conversationSrv.incrementMessageCount(conversationId);
      await this._conversationSrv.incrementMessageCount(conversationId);

      // 如果是第一条消息且标题为空或为"新对话"，自动生成标题
      if (conversation.messageCount === 0 && (!conversation.title || conversation.title === '新对话')) {
        const title = this._chatSrv.generateTitle(userContent);
        await this._conversationSrv.updateConversation(
          conversationId,
          userId,
          { title },
        );
      }

      // 发送结束标记
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      // 标记用户消息为错误
      await this._messageSrv.markMessageAsError(
        userMessage.id,
        error.message || 'Stream 失败',
      );

      const errorData = JSON.stringify({ error: error.message });
      res.write(`data: ${errorData}\n\n`);
      res.end();
    }
  }
}
