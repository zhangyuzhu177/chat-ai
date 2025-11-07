import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // 模型名称（API 调用使用）
  @Column({ unique: true })
  name: string

  // 模型提供商（如 deepseek, openai 等）
  @Column({ default: 'deepseek' })
  provider: string

  // 最大 token 数
  @Column({ default: 4096 })
  maxTokens: number

  // 是否启用
  @Column({ default: true })
  isActive: boolean

  // 模型图标 URL
  @Column({ nullable: true })
  icon: string

  // 排序权重
  @Column({ default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
