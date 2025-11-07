/**
 * 消息角色
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * AI 模型
 */
export interface Model {
  id: string
  name: string
  displayName: string
  provider: string
  description?: string
  maxTokens: number
  isActive: boolean
  icon?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 对话配置
 */
export interface ConversationConfig {
  temperature?: number
  topP?: number
  maxTokens?: number
  [key: string]: any
}

/**
 * 消息元数据
 */
export interface MessageMetadata {
  finishReason?: string
  model?: string
  attachments?: any[]
  [key: string]: any
}

/**
 * 消息
 */
export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  tokenCount: number
  metadata?: MessageMetadata
  isError: boolean
  errorMessage?: string
  createdAt: string
}

/**
 * 对话
 */
export interface Conversation {
  id: string
  title: string
  userId: string
  modelId: string
  model?: Model
  messages?: Message[]
  systemPrompt?: string
  config?: ConversationConfig
  isPinned: boolean
  messageCount: number
  totalTokens: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/**
 * 创建对话 DTO
 */
export interface CreateConversationDto {
  modelId: string
  title?: string
  systemPrompt?: string
  config?: ConversationConfig
}

/**
 * 更新对话 DTO
 */
export interface UpdateConversationDto {
  title?: string
  systemPrompt?: string
  config?: ConversationConfig
  isPinned?: boolean
}

/**
 * 发送消息 DTO
 */
export interface SendMessageDto {
  conversationId: string
  content: string
  modelId?: string
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}

/**
 * 发送消息响应
 */
export interface SendMessageResponse {
  userMessage: Message
  assistantMessage: Message
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * 创建模型 DTO
 */
export interface CreateModelDto {
  name: string
  provider?: string
  maxTokens?: number
  isActive?: boolean
  icon?: string
  sortOrder?: number
}

/**
 * 更新模型 DTO
 */
export interface UpdateModelDto {
  name?: string
  displayName?: string
  provider?: string
  description?: string
  maxTokens?: number
  isActive?: boolean
  icon?: string
  sortOrder?: number
}
