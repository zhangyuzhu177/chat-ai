import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation";

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // 关联对话
  @ManyToOne(() => Conversation, conversation => conversation.messages, { nullable: false, onDelete: 'CASCADE' })
  conversation: Conversation

  @Column()
  conversationId: string

  // 消息角色
  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER
  })
  role: MessageRole

  // 消息内容
  @Column({ type: 'text' })
  content: string

  // Token 消耗（用户消息为 prompt tokens，助手消息为 completion tokens）
  @Column({ default: 0 })
  tokenCount: number

  // 消息元数据（可存储附件、引用等信息）
  @Column({ type: 'json', nullable: true })
  metadata: {
    finishReason?: string  // stop, length, content_filter 等
    model?: string         // 实际使用的模型
    attachments?: any[]    // 附件列表
    [key: string]: any
  }

  // 是否出错
  @Column({ default: false })
  isError: boolean

  // 错误信息
  @Column({ type: 'text', nullable: true })
  errorMessage: string

  @CreateDateColumn()
  createdAt: Date
}
