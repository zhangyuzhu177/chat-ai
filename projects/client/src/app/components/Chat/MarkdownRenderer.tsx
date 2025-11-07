'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // 代码块
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const codeString = String(children).replace(/\n$/, '')

          if (!inline && language) {
            return (
              <CodeBlock
                language={language}
                code={codeString}
                isDark={isDark}
              />
            )
          }

          // 行内代码
          return (
            <code
              className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          )
        },
        // 段落
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>
        },
        // 标题
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>
        },
        // 列表
        ul({ children }) {
          return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
        },
        // 引用
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          )
        },
        // 表格
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold">
              {children}
            </th>
          )
        },
        td({ children }) {
          return (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
              {children}
            </td>
          )
        },
        // 链接
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// 代码块组件（带复制功能）
function CodeBlock({ language, code, isDark }: { language: string; code: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4">
      {/* 语言标签和复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 rounded-t-lg border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-700"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <SyntaxHighlighter
        language={language}
        style={isDark ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
        }}
        showLineNumbers={true}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
