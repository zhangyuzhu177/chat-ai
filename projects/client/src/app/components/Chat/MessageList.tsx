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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    const isError = message.isError

    return (
      <div
        key={message.id}
        className={`flex gap-4 px-4 py-6 ${
          isUser ? 'bg-transparent' : 'bg-[#F9F9F9] dark:bg-[#212121]'
        }`}
      >
        {/* 头像 */}
        <div
          className={`
            shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${
              isUser
                ? 'bg-blue-500'
                : isError
                ? 'bg-red-500'
                : 'bg-green-500'
            }
          `}
        >
          {isUser ? (
            <User size={18} className="text-white" />
          ) : isError ? (
            <AlertCircle size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isUser ? '你' : isError ? 'Error' : 'AI'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* 消息文本 */}
          <div
            className={`
              ${isError ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}
            `}
          >
            {isError && message.errorMessage ? (
              <div className="whitespace-pre-wrap wrap-break-words">{message.errorMessage}</div>
            ) : isUser ? (
              <div className="whitespace-pre-wrap wrap-break-words">{message.content}</div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Token 消耗（仅 AI 消息） */}
          {!isUser && !isError && message.tokenCount > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              使用了 {message.tokenCount} tokens
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
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
            <div className="flex gap-4 px-4 py-6 bg-[#F9F9F9] dark:bg-[#212121]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    AI
                  </span>
                  <span className="text-xs text-gray-400">正在输入...</span>
                </div>
                <div className="text-gray-800 dark:text-gray-200">
                  <MarkdownRenderer content={streamingContent} />
                  <span className="inline-block w-1 h-4 bg-green-500 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* 加载指示器 */}
          {isLoading && !streamingContent && (
            <div className="flex gap-4 px-4 py-6 bg-[#F9F9F9] dark:bg-[#212121]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
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
