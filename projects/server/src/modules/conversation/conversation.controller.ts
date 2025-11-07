import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ConversationService } from './conversation.service';
import { CreateConversationDto, UpdateConversationDto } from './dto';
import { IsLogin } from 'src/guards';

@Controller('conversation')
@IsLogin()
export class ConversationController {
  constructor(private readonly _conversationSrv: ConversationService) {}

  /**
   * 创建对话
   */
  @Post()
  createConversation(@Req() req: Request, @Body() dto: CreateConversationDto) {
    const userId = req.user?.id || '';
    return this._conversationSrv.createConversation(userId, dto);
  }

  /**
   * 获取当前用户的所有对话列表
   */
  @Get()
  getUserConversations(@Req() req: Request) {
    const userId = req.user?.id || '';
    return this._conversationSrv.getUserConversations(userId);
  }

  /**
   * 获取单个对话详情
   */
  @Get(':id')
  getConversationById(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id || '';
    return this._conversationSrv.getConversationById(id, userId);
  }

  /**
   * 更新对话
   */
  @Put(':id')
  updateConversation(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    const userId = req.user?.id || '';
    return this._conversationSrv.updateConversation(id, userId, dto);
  }

  /**
   * 删除对话
   */
  @Delete(':id')
  deleteConversation(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id || '';
    return this._conversationSrv.deleteConversation(id, userId);
  }
}
