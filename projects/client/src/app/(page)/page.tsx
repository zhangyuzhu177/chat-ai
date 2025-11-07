'use client'

import { useEffect } from 'react'
import MessageList from '@/app/components/Chat/MessageList'
import ChatInput from '@/app/components/Chat/ChatInput'
import { useChatContext } from '@/contexts/ChatContext'
import { toast } from 'sonner'

export default function Home() {
  const {
    models,
    currentConversation,
    messages,
    isSending,
    streamingContent,
    selectedModelId,
    setSelectedModelId,
    loadModels,
    loadConversations,
    createConversation,
    sendMessageStream,
  } = useChatContext()

  // 初始化：加载模型和对话列表
  useEffect(() => {
    loadModels()
    loadConversations()
  }, [loadModels, loadConversations])

  // 自动选择第一个模型
  useEffect(() => {
    if (models.length > 0 && !selectedModelId) {
      setSelectedModelId(models[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models])

  /**
   * 发送消息
   */
  const handleSendMessage = async (content: string) => {
    if (!currentConversation) {
      // 如果没有当前对话，先创建一个
      if (!selectedModelId) {
        return toast.warning('请先选择一个模型')
      }

      try {
        const newConversation = await createConversation({
          modelId: selectedModelId,
          title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
        })

        // 在新对话中发送消息
        await sendMessageStream(content, newConversation.id)
      } catch (error) {
        console.error('发送消息失败:', error)
        return toast.error('发送消息失败')
      }
    } else {
      // 在当前对话中发送消息
      try {
        await sendMessageStream(content)
      } catch (error) {
        console.error('发送消息失败:', error)
        return toast.error('发送消息失败')
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#212121]">
      {/* 消息列表 */}
      <MessageList
        messages={messages}
        isLoading={isSending}
        streamingContent={streamingContent}
      />

      {/* 输入框 */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isSending}
        placeholder={
          currentConversation
            ? '输入消息...'
            : '输入消息开始新对话...'
        }
      />
    </div>
  )
}
