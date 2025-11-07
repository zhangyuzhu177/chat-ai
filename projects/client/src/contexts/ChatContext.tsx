'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useChat } from '@/hooks/useChat'
import type { Model, Conversation, Message } from '@/types/chat'

interface ChatContextType {
  // 状态
  models: Model[]
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  streamingContent: string
  selectedModelId: string | null
  setSelectedModelId: (modelId: string | null) => void

  // 方法
  loadModels: () => Promise<void>
  loadConversations: () => Promise<void>
  createConversation: (dto: {
    modelId: string
    title: string
    systemPrompt?: string
    config?: { temperature?: number; topP?: number; maxTokens?: number }
  }) => Promise<Conversation>
  updateConversation: (
  id: string,
  dto: Partial<{
    title: string
    systemPrompt: string
    isPinned: boolean
    config: { temperature?: number; topP?: number; maxTokens?: number }
  }>
) => Promise<Conversation>
  deleteConversation: (id: string) => Promise<void>
  sendMessageStream: (content: string, conversationId?: string) => Promise<void>
  switchConversation: (conversation: Conversation) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat()

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
