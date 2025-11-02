'use client'

import { useState } from "react"
import { useFetch } from "@/hooks/useFetch"

export default function Auth() {
  const { apiBase } = useFetch()
  const [loading, setLoading] = useState(false)

  async function login() {
    if (loading) return // 防止重复点击
    setLoading(true)
    try {
      // 模拟跳转 GitHub OAuth
      window.location.href = `${apiBase}/auth/login`
    } catch (error) {
      console.error('登录出错:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="w-100 text-center border border-slate-200 bg-slate-100 px-4 py-4 rounded-lg flex flex-col gap-4">
        <h1 className="text-4xl font-bold">登录</h1>
        <button
          className={`px-4 py-2 rounded-lg text-white select-none transition-colors ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-slate-900'
          }`}
          onClick={login}
          disabled={loading}
        >
          {loading ? '正在跳转...' : 'GitHub 登录'}
        </button>
      </div>
    </div>
  )
}
