import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from 'src/entities';
import { CreateConversationDto, UpdateConversationDto } from './dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly _conversationRepo: Repository<Conversation>,
  ) {}

  /**
   * 创建对话
   */
  async createConversation(userId: string, dto: CreateConversationDto) {
    try {
      const conversation = this._conversationRepo.create({
        ...dto,
        userId,
        title: dto.title || '新对话',
      });
      return await this._conversationRepo.save(conversation);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '创建对话失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取用户的所有对话列表
   */
  async getUserConversations(userId: string) {
    return await this._conversationRepo.find({
      where: { userId },
      relations: ['model'],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * 获取单个对话详情（包含消息）
   */
  async getConversationById(id: string, userId: string) {
    const conversation = await this._conversationRepo.findOne({
      where: { id, userId },
      relations: ['model', 'messages'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!conversation) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: '对话不存在',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return conversation;
  }

  /**
   * 更新对话
   */
  async updateConversation(id: string, userId: string, dto: UpdateConversationDto) {
    const conversation = await this._conversationRepo.findOne({
      where: { id, userId },
    });

    if (!conversation) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: '对话不存在',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      Object.assign(conversation, dto);
      return await this._conversationRepo.save(conversation);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '更新对话失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除对话（软删除）
   */
  async deleteConversation(id: string, userId: string) {
    const conversation = await this._conversationRepo.findOne({
      where: { id, userId },
    });

    if (!conversation) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: '对话不存在',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this._conversationRepo.softDelete(id);
      return { message: '删除成功' };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '删除对话失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 增加消息计数
   */
  async incrementMessageCount(id: string) {
    await this._conversationRepo.increment({ id }, 'messageCount', 1);
  }

  /**
   * 增加 token 消耗
   */
  async incrementTotalTokens(id: string, tokens: number) {
    await this._conversationRepo.increment({ id }, 'totalTokens', tokens);
  }

  /**
   * 获取 Repository（供其他服务使用）
   */
  repo() {
    return this._conversationRepo;
  }
}
