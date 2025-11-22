import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { SendMessageDto } from './dto';
import { MessageRole } from 'src/entities';
import { ModelService } from '../model/model.service';
import { MessageService } from '../message/message.service';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class ChatService {
  private _openai: OpenAI;

  constructor(
    private readonly _cfgSrv: ConfigService,
    private readonly _modelSrv: ModelService,
    private readonly _messageSrv: MessageService,
    private readonly _conversationSrv: ConversationService,
  ) {
    // 初始化 DeepSeek 客户端（使用 OpenAI SDK）
    this._openai = new OpenAI({
      apiKey: this._cfgSrv.get<string>('OPENAI_API_KEY'),
      baseURL: this._cfgSrv.get<string>('OPENAI_API_BASE_URL'),
    });
  }

  /**
   * 发送消息并获取 AI 响应
   */
  async sendMessage(userId: string, dto: SendMessageDto) {
    // 1. 验证对话是否存在且属于当前用户
    const conversation = await this._conversationSrv.getConversationById(
      dto.conversationId,
      userId,
    );

    // 2. 获取使用的模型
    const model = await this._modelSrv.getModelById(conversation.modelId);
    if (!model.isActive) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: '当前模型不可用',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. 保存用户消息
    const userMessage = await this._messageSrv.createMessage({
      conversationId: dto.conversationId,
      role: MessageRole.USER,
      content: dto.content,
      tokenCount: 0, // 稍后通过 API 响应更新
    });

    try {
      // 4. 构建消息历史（包含系统提示词）
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      // 添加系统提示词
      if (conversation.systemPrompt) {
        messages.push({
          role: 'system',
          content: conversation.systemPrompt,
        });
      }

      // 添加历史消息（最近 20 条）
      const historyMessages = conversation.messages?.slice(-20) || [];
      for (const msg of historyMessages) {
        messages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }

      // 添加当前用户消息
      messages.push({
        role: 'user',
        content: dto.content,
      });

      // 5. 调用 DeepSeek API
      const response = await this._openai.chat.completions.create({
        model: model.name,
        messages,
        temperature: conversation.config?.temperature || 0.7,
        top_p: conversation.config?.topP || 1.0,
        max_tokens: conversation.config?.maxTokens || model.maxTokens,
        stream: false,
      });

      // 6. 提取响应数据
      const choice = response.choices[0];
      const assistantContent = choice.message?.content || '';
      const usage = response.usage;

      // 7. 保存 AI 响应消息
      const assistantMessage = await this._messageSrv.createMessage({
        conversationId: dto.conversationId,
        role: MessageRole.ASSISTANT,
        content: assistantContent,
        tokenCount: usage?.completion_tokens || 0,
        metadata: {
          finishReason: choice.finish_reason,
          model: response.model,
        },
      });

      // 8. 更新对话统计信息
      await this._conversationSrv.incrementMessageCount(dto.conversationId);
      await this._conversationSrv.incrementMessageCount(dto.conversationId);
      if (usage) {
        await this._conversationSrv.incrementTotalTokens(
          dto.conversationId,
          usage.total_tokens,
        );
      }

      // 9. 如果是第一条消息且标题为空或为"新对话"，自动生成标题
      if (conversation.messageCount === 0 && (!conversation.title || conversation.title === '新对话')) {
        const title = this.generateTitle(dto.content);
        await this._conversationSrv.updateConversation(
          dto.conversationId,
          userId,
          { title },
        );
      }

      // 10. 返回响应
      return {
        userMessage,
        assistantMessage,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      // 标记消息为错误
      await this._messageSrv.markMessageAsError(
        userMessage.id,
        error.message || 'API 调用失败',
      );

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'AI 响应失败：' + (error.message || '未知错误'),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 流式发送消息（返回 SSE 流）
   */
  async sendMessageStream(userId: string, dto: SendMessageDto) {
    // 验证对话
    const conversation = await this._conversationSrv.getConversationById(
      dto.conversationId,
      userId,
    );

    // 获取模型
    const model = await this._modelSrv.getModelById(conversation.modelId);

    // 保存用户消息
    const userMessage = await this._messageSrv.createMessage({
      conversationId: dto.conversationId,
      role: MessageRole.USER,
      content: dto.content,
      tokenCount: 0,
    });

    // 构建消息历史
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (conversation.systemPrompt) {
      messages.push({
        role: 'system',
        content: conversation.systemPrompt,
      });
    }

    const historyMessages = conversation.messages?.slice(-20) || [];
    for (const msg of historyMessages) {
      messages.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      });
    }

    messages.push({
      role: 'user',
      content: dto.content,
    });

    // 返回流式响应
    const stream = await this._openai.chat.completions.create({
      model: model.name,
      messages,
      temperature: conversation.config?.temperature || 0.7,
      top_p: conversation.config?.topP || 1.0,
      max_tokens: conversation.config?.maxTokens || model.maxTokens,
      stream: true,
    });

    return {
      stream,
      userMessage,
      conversationId: dto.conversationId,
      conversation,
      userId,
      userContent: dto.content,
    };
  }

  /**
   * 生成对话标题（从第一条消息提取）
   */
  generateTitle(content: string): string {
    // 简单实现：取前 20 个字符
    const title = content.trim().slice(0, 20);
    return title + (content.length > 20 ? '...' : '');
  }
}
