'use client'

import { useState, useCallback, useRef } from 'react'
import { useFetch } from './useFetch'
import { ChatApi } from '@/services/chatApi'
import type {
  Conversation,
  Message,
  Model,
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  MessageRole,
} from '@/types/chat'
import { toast } from 'sonner'

/**
 * 聊天 Hook
 * 管理对话、消息和 AI 交互
 */
export function useChat() {
  const { fetchClient } = useFetch()
  const chatApi = useRef(new ChatApi(fetchClient)).current

  // 状态管理
  const [models, setModels] = useState<Model[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

  // AbortController 用于终止流式请求
  const abortControllerRef = useRef<AbortController | null>(null)

  // 追踪当前流式内容（用于停止时保存）
  const currentStreamContentRef = useRef<string>('')
  const currentConversationIdRef = useRef<string>('')

  // ==================== Model 相关 ====================

  /**
   * 加载可用模型
   */
  const loadModels = useCallback(async () => {
    try {
      const response = await chatApi.getActiveModels()
      setModels(response.data || [])
      setSelectedModelId(models[0]?.id || null)
    } catch (error) {
      console.error('加载模型失败:', error)
    }
  }, [chatApi])

  // ==================== Conversation 相关 ====================

  /**
   * 加载对话列表
   */
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await chatApi.getConversations()
      setConversations(response.data || [])
    } catch (error) {
      console.error('加载对话失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [chatApi])

  /**
   * 加载单个对话详情
   */
  const loadConversation = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        const response = await chatApi.getConversationById(id)
        setCurrentConversation(response.data)
        setMessages(response.data.messages || [])
      } catch (error) {
        console.error('加载对话详情失败:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [chatApi]
  )

  /**
   * 创建新对话
   */
  const createConversation = useCallback(
    async (dto: CreateConversationDto) => {
      try {
        const response = await chatApi.createConversation(dto)
        const newConversation = response.data
        setConversations((prev) => [newConversation, ...prev])
        setCurrentConversation(newConversation)
        setMessages([])
        return newConversation
      } catch (error) {
        console.error('创建对话失败:', error)
        throw error
      }
    },
    [chatApi]
  )

  /**
   * 更新对话
   */
  const updateConversation = useCallback(
    async (id: string, dto: UpdateConversationDto) => {
      try {
        const response = await chatApi.updateConversation(id, dto)
        const updated = response.data

        setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)))

        if (currentConversation?.id === id) {
          setCurrentConversation(updated)
        }

        return updated
      } catch (error) {
        console.error('更新对话失败:', error)
        throw error
      }
    },
    [chatApi, currentConversation]
  )

  /**
   * 删除对话
   */
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await chatApi.deleteConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))

        if (currentConversation?.id === id) {
          setCurrentConversation(null)
          setMessages([])
        }
        toast.success('删除成功')
      } catch (error:any) {
        toast.error(error.message)
      }
    },
    [chatApi, currentConversation]
  )

  // ==================== Message 相关 ====================

  /**
   * 发送消息（普通模式）
   */
  const sendMessage = useCallback(
    async (content: string, conversationId?: string) => {
      if (!content.trim()) return

      const targetConversationId = conversationId || currentConversation?.id
      if (!targetConversationId) {
        throw new Error('没有选中的对话')
      }

      try {
        setIsSending(true)

        // 添加临时用户消息
        const tempUserMessage: Message = {
          id: `temp-${Date.now()}`,
          conversationId: targetConversationId,
          role: 'user' as MessageRole,
          content,
          tokenCount: 0,
          isError: false,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempUserMessage])

        // 发送请求
        const dto: SendMessageDto = {
          conversationId: targetConversationId,
          content,
        }

        const response = await chatApi.sendMessage(dto)
        const { userMessage, assistantMessage } = response.data

        // 替换临时消息为真实消息
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMessage.id)
          return [...filtered, userMessage, assistantMessage]
        })

        // 更新对话列表中的消息计数
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConversationId
              ? { ...c, messageCount: c.messageCount + 2, updatedAt: new Date().toISOString() }
              : c
          )
        )
      } catch (error) {
        console.error('发送消息失败:', error)
        // 标记最后一条消息为错误
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, isError: true, errorMessage: '发送失败' } : m
          )
        )
        throw error
      } finally {
        setIsSending(false)
      }
    },
    [chatApi, currentConversation]
  )

  /**
   * 发送消息（流式模式）
   */
  const sendMessageStream = useCallback(
    async (content: string, conversationId?: string) => {
      if (!content.trim()) return

      const targetConversationId = conversationId || currentConversation?.id
      if (!targetConversationId) {
        throw new Error('没有选中的对话')
      }

      try {
        setIsSending(true)
        setStreamingContent('')

        // 创建新的 AbortController
        abortControllerRef.current = new AbortController()

        // 重置流式内容追踪
        currentStreamContentRef.current = ''
        currentConversationIdRef.current = targetConversationId

        // 添加用户消息
        const tempUserMessage: Message = {
          id: `temp-user-${Date.now()}`,
          conversationId: targetConversationId,
          role: 'user' as MessageRole,
          content,
          tokenCount: 0,
          isError: false,
          createdAt: new Date().toISOString(),
        }

        // 只添加用户消息，不添加AI消息占位符
        setMessages((prev) => [...prev, tempUserMessage])

        const dto: SendMessageDto = {
          conversationId: targetConversationId,
          content,
        }

        let fullContent = ''

        await chatApi.sendMessageStream(
          dto,
          // onMessage
          (chunk: string) => {
            fullContent += chunk
            currentStreamContentRef.current = fullContent
            setStreamingContent(fullContent)
          },
          // onComplete
          async () => {
            // 添加完整的 AI 回复消息
            const aiMessage: Message = {
              id: `ai-${Date.now()}`,
              conversationId: targetConversationId,
              role: 'assistant' as MessageRole,
              content: fullContent,
              tokenCount: 0,
              isError: false,
              createdAt: new Date().toISOString(),
            }

            setMessages((prev) => [...prev, aiMessage])
            setStreamingContent('')
            setIsSending(false)
            abortControllerRef.current = null
            currentStreamContentRef.current = ''
            currentConversationIdRef.current = ''

            // 重新加载对话详情以获取更新的标题
            try {
              const response = await chatApi.getConversationById(targetConversationId)
              const updatedConversation = response.data

              // 更新当前对话
              setCurrentConversation(updatedConversation)

              // 更新对话列表
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === targetConversationId ? updatedConversation : c
                )
              )
            } catch (error) {
              console.error('重新加载对话失败:', error)
              // 降级：只更新消息计数
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === targetConversationId
                    ? { ...c, messageCount: c.messageCount + 2, updatedAt: new Date().toISOString() }
                    : c
                )
              )
            }
          },
          // onError
          (error: string) => {
            console.error('流式响应错误:', error)

            // 添加错误消息
            const errorMessage: Message = {
              id: `error-${Date.now()}`,
              conversationId: targetConversationId,
              role: 'assistant' as MessageRole,
              content: '',
              tokenCount: 0,
              isError: true,
              errorMessage: error,
              createdAt: new Date().toISOString(),
            }

            setMessages((prev) => [...prev, errorMessage])
            setStreamingContent('')
            setIsSending(false)
            abortControllerRef.current = null
          },
          abortControllerRef.current.signal // 传递 AbortSignal
        )
      } catch (error: any) {
        console.error('发送流式消息失败:', error)

        setStreamingContent('')
        setIsSending(false)
        abortControllerRef.current = null
        currentStreamContentRef.current = ''
        currentConversationIdRef.current = ''
        throw error
      }
    },
    [chatApi, currentConversation]
  )

  /**
   * 停止流式输出
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      // 保存当前已接收的内容
      const content = currentStreamContentRef.current
      const conversationId = currentConversationIdRef.current

      // 中止请求
      abortControllerRef.current.abort()
      abortControllerRef.current = null

      // 如果有内容，保存为消息
      if (content) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          conversationId,
          role: 'assistant' as MessageRole,
          content,
          tokenCount: 0,
          isError: false,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMessage])
      }

      // 清理状态
      setStreamingContent('')
      setIsSending(false)
      currentStreamContentRef.current = ''
      currentConversationIdRef.current = ''
    }
  }, [])

  /**
   * 切换对话
   */
  const switchConversation = useCallback(
    async (conversation: Conversation) => {
      try {
        setIsLoading(true)
        // 加载完整的对话详情（包含所有消息）
        const response = await chatApi.getConversationById(conversation.id)
        const fullConversation = response.data
        setCurrentConversation(fullConversation)
        setMessages(fullConversation.messages || [])
      } catch (error) {
        console.error('加载对话详情失败:', error)
        // 降级：使用对话列表中的数据
        setCurrentConversation(conversation)
        setMessages(conversation.messages || [])
      } finally {
        setIsLoading(false)
      }
    },
    [chatApi]
  )

  /**
   * 清空当前对话
   */
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null)
    setMessages([])
  }, [])

  return {
    // 状态
    models,
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    streamingContent,
    selectedModelId,
    setSelectedModelId,

    // 方法
    loadModels,
    loadConversations,
    loadConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    sendMessage,
    sendMessageStream,
    stopStreaming,
    switchConversation,
    clearCurrentConversation,
  }
}
