import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from 'src/entities';
import { CreateMessageDto } from './dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly _messageRepo: Repository<Message>,
  ) {}

  /**
   * 创建消息
   */
  async createMessage(dto: CreateMessageDto) {
    try {
      const message = this._messageRepo.create(dto);
      return await this._messageRepo.save(message);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '创建消息失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 批量创建消息
   */
  async createMessages(dtos: CreateMessageDto[]) {
    try {
      const messages = this._messageRepo.create(dtos);
      return await this._messageRepo.save(messages);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '批量创建消息失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取对话的所有消息
   */
  async getMessagesByConversationId(conversationId: string) {
    return await this._messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 删除对话的所有消息
   */
  async deleteMessagesByConversationId(conversationId: string) {
    try {
      await this._messageRepo.delete({ conversationId });
      return { message: '删除成功' };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '删除消息失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 标记消息为错误
   */
  async markMessageAsError(id: string, errorMessage: string) {
    try {
      await this._messageRepo.update(id, {
        isError: true,
        errorMessage,
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '更新消息状态失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取 Repository（供其他服务使用）
   */
  repo() {
    return this._messageRepo;
  }
}
