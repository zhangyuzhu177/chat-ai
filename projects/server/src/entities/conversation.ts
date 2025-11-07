import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { User, Model, Message } from "./"

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // 对话标题（默认为第一条消息的摘要）
  @Column({ default: '新对话' })
  title: string

  // 关联用户
  @ManyToOne(() => User, { nullable: false })
  user: User

  @Column()
  userId: string

  // 关联模型
  @ManyToOne(() => Model, { nullable: false, onDelete: 'CASCADE' })
  model: Model

  @Column()
  modelId: string

  // 对话的消息列表
  @OneToMany(() => Message, message => message.conversation)
  messages: Message[]

  // 系统提示词（可选）
  @Column({ type: 'text', nullable: true })
  systemPrompt: string

  // 对话配置（JSON 存储温度、top_p 等参数）
  @Column({ type: 'json', nullable: true })
  config: {
    temperature?: number
    topP?: number
    maxTokens?: number
    [key: string]: any
  }

  // 是否置顶
  @Column({ default: false })
  isPinned: boolean

  // 总消息数
  @Column({ default: 0 })
  messageCount: number

  // 总 token 消耗
  @Column({ default: 0 })
  totalTokens: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 软删除支持
  @DeleteDateColumn()
  deletedAt: Date
}
