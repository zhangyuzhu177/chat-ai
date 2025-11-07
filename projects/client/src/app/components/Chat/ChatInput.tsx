'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = '输入消息...',
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!content.trim() || disabled) return

    onSend(content)
    setContent('')

    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    // 自动调整文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="border-t border-[#EDEDED] dark:border-[#303030] bg-white dark:bg-[#181818] px-4 py-4">
      <div className="flex gap-3 max-w-4xl mx-auto">
        {/* 输入框 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={`
              w-full px-4 py-3 pr-12
              bg-[#F9F9F9] dark:bg-[#212121]
              border border-[#EDEDED] dark:border-[#303030]
              rounded-lg resize-none outline-none
              text-sm text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              transition-colors
              focus:border-blue-500 dark:focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-40 overflow-y-auto
            `}
            style={{ minHeight: '48px' }}
          />

          {/* 字符计数 */}
          {content.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {content.length}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={disabled || !content.trim()}
          className={`
            flex-shrink-0 w-12 h-12 rounded-lg
            flex items-center justify-center
            transition-all
            ${
              disabled || !content.trim()
                ? 'bg-gray-200 dark:bg-[#303030] text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }
          `}
          title={disabled ? '正在发送中...' : '发送 (Enter)'}
        >
          {disabled ? (
            <Square size={18} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* 提示文本 */}
      <div className="text-xs text-gray-400 text-center mt-2">
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  )
}
