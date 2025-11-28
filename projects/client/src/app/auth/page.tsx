'use client'

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useFetch } from "@/hooks/useFetch"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// GitHub 图标组件
const GithubIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

function AuthContent() {
  const { apiBase } = useFetch()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  // 检查URL中是否有错误参数
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      toast.error(errorParam)
      // 清除URL中的错误参数
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.pathname)
    }
  }, [searchParams])

  async function login() {
    if (loading) return // 防止重复点击
    setLoading(true)
    try {
      // 模拟跳转 GitHub OAuth
      window.location.href = `${apiBase}/auth/login`
    } catch (error) {
      toast.error('登录失败')
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="w-md px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-2xl font-bold">欢迎回来</h1>
        </div>
        <Button
          type="button"
          size='lg'
          className={`w-full group relative overflow-hidden cursor-pointer rounded-xl px-6 py-4 font-medium text-white transition-all duration-300 ${
            loading
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-linear-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          }`}
          onClick={login}
          disabled={loading}
        >
          <div className="relative flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>登录中...</span>
              </>
            ) : (
              <>
                <GithubIcon size={20} />
                <span>使用 GitHub 登录</span>
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  )
}

export default function Auth() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}
