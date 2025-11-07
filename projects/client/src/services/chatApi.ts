import type {
  Model,
  Conversation,
  Message,
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  ApiResponse,
  SendMessageResponse,
  CreateModelDto,
  UpdateModelDto,
} from '@/types/chat'

/**
 * Chat API Service
 * 封装所有聊天相关的 API 调用
 */
export class ChatApi {
  constructor(private fetchClient: <T>(url: string, options?: any) => Promise<T>) {}

  // ==================== Model 相关 ====================

  /**
   * 获取所有启用的模型
   */
  async getActiveModels(): Promise<ApiResponse<Model[]>> {
    return this.fetchClient<ApiResponse<Model[]>>('/model/active')
  }

  /**
   * 获取所有模型（管理员）
   */
  async getAllModels(): Promise<ApiResponse<Model[]>> {
    return this.fetchClient<ApiResponse<Model[]>>('/model')
  }

  /**
   * 获取单个模型
   */
  async getModelById(id: string): Promise<ApiResponse<Model>> {
    return this.fetchClient<ApiResponse<Model>>(`/model/${id}`)
  }

  /**
   * 创建模型
   */
  async createModel(dto: CreateModelDto): Promise<ApiResponse<Model>> {
    return this.fetchClient<ApiResponse<Model>>('/model', {
      method: 'POST',
      body: dto,
    })
  }

  /**
   * 更新模型
   */
  async updateModel(id: string, dto: UpdateModelDto): Promise<ApiResponse<Model>> {
    return this.fetchClient<ApiResponse<Model>>(`/model/${id}`, {
      method: 'PUT',
      body: dto,
    })
  }

  /**
   * 删除模型
   */
  async deleteModel(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchClient<ApiResponse<{ message: string }>>(`/model/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== Conversation 相关 ====================

  /**
   * 创建对话
   */
  async createConversation(dto: CreateConversationDto): Promise<ApiResponse<Conversation>> {
    return this.fetchClient<ApiResponse<Conversation>>('/conversation', {
      method: 'POST',
      body: dto,
    })
  }

  /**
   * 获取当前用户的所有对话
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.fetchClient<ApiResponse<Conversation[]>>('/conversation')
  }

  /**
   * 获取单个对话详情
   */
  async getConversationById(id: string): Promise<ApiResponse<Conversation>> {
    return this.fetchClient<ApiResponse<Conversation>>(`/conversation/${id}`)
  }

  /**
   * 更新对话
   */
  async updateConversation(
    id: string,
    dto: UpdateConversationDto
  ): Promise<ApiResponse<Conversation>> {
    return this.fetchClient<ApiResponse<Conversation>>(`/conversation/${id}`, {
      method: 'PUT',
      body: dto,
    })
  }

  /**
   * 删除对话
   */
  async deleteConversation(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchClient<ApiResponse<{ message: string }>>(`/conversation/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== Message 相关 ====================

  /**
   * 获取对话的所有消息
   */
  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    return this.fetchClient<ApiResponse<Message[]>>(`/message/conversation/${conversationId}`)
  }

  // ==================== Chat 相关 ====================

  /**
   * 发送消息（普通响应）
   */
  async sendMessage(dto: SendMessageDto): Promise<ApiResponse<SendMessageResponse>> {
    return this.fetchClient<ApiResponse<SendMessageResponse>>('/chat/send', {
      method: 'POST',
      body: dto,
    })
  }

  /**
   * 发送消息（流式响应）
   * @returns EventSource URL
   */
  async sendMessageStream(
    dto: SendMessageDto,
    onMessage: (content: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
    const url = `${apiBase}/chat/send-stream`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
        signal, // 添加 AbortSignal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              onComplete()
              return
            }

            try {
              const json = JSON.parse(data)
              if (json.content) {
                onMessage(json.content)
              } else if (json.error) {
                onError(json.error)
                return
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      // 如果是用户主动取消，不触发错误回调
      if (error instanceof Error && error.name === 'AbortError') {
        onComplete() // 直接完成，不触发错误
        return
      }
      onError(error instanceof Error ? error.message : '未知错误')
    }
  }
}
