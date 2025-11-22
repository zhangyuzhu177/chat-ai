'use client'

import { useEffect, useRef } from 'react'
import { User, Bot, AlertCircle } from 'lucide-react'
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  streamingContent?: string
}

export default function MessageList({ messages, isLoading, streamingContent }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    })
  }, [messages, streamingContent])

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    const isError = message.isError

    return (
      <div
        key={message.id}
        className={`flex gap-3 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {/* 用户消息：右对齐，头像在右 */}
        {isUser ? (
          <>
            {/* 消息内容 */}
            <div className="flex flex-col max-w-[70%] items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
              </div>
            </div>

            {/* 头像 */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          </>
        ) : (
          <>
            {/* AI消息：左对齐，头像在左 */}
            {/* 头像 */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isError ? 'bg-red-500' : 'bg-green-500'
            }`}>
              {isError ? (
                <AlertCircle size={18} className="text-white" />
              ) : (
                <Bot size={18} className="text-white" />
              )}
            </div>

            {/* 消息内容 */}
            <div className="flex flex-col max-w-[70%]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 w-full ${
                isError
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-[#F0F0F0] dark:bg-[#2A2A2A]'
              }`}>
                <div className={isError ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}>
                  {isError && message.errorMessage ? (
                    <div className="whitespace-pre-wrap wrap-break-word">{message.errorMessage}</div>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                </div>

                {/* Token 消耗（仅 AI 消息） */}
                {!isError && message.tokenCount > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    使用了 {message.tokenCount} tokens
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <Bot size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            开始对话
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            输入消息开始与 AI 对话
          </p>
        </div>
      ) : (
        <>
          {messages.map(renderMessage)}

          {/* 流式输出时的临时消息 */}
          {streamingContent && (
            <div className="flex gap-3 px-4 py-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* 头像 */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>

              {/* 消息内容 */}
              <div className="flex flex-col max-w-[70%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">AI</span>
                  <span className="text-xs text-gray-400">正在输入...</span>
                </div>
                <div className="bg-[#F0F0F0] dark:bg-[#2A2A2A] rounded-2xl rounded-tl-sm px-4 py-2.5 w-full">
                  <div className="text-gray-800 dark:text-gray-200">
                    <MarkdownRenderer content={streamingContent} />
                    <span className="inline-block w-1 h-4 bg-green-500 ml-1 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 加载指示器 */}
          {isLoading && !streamingContent && (
            <div className="flex gap-3 px-4 py-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* 头像 */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>

              {/* 消息内容 */}
              <div className="flex flex-col max-w-[70%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">AI</span>
                  <span className="text-xs text-gray-400">正在思考...</span>
                </div>
                <div className="bg-[#F0F0F0] dark:bg-[#2A2A2A] rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
