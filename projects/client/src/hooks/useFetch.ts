'use client'

import { useRouter } from 'next/navigation'

export interface FetchClientOptions extends RequestInit {
  /** 请求体，可传对象，自动转 JSON */
  body?: any
  /** 是否自动将 body 序列化为 JSON（默认 true） */
  json?: boolean
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

/**
 * 客户端通用请求 Hook
 * 自动带上 cookie，自动处理 403 跳转登录
 */
export function useFetch() {
  const router = useRouter()

  const fetchClient = async <T>(
    url: string,
    options: FetchClientOptions = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      body,
      json = true,
      headers = {},
      ...rest
    } = options

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include', // ✅ 自动携带 cookie
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...rest,
    }

    // 如果有 body 且是 JSON 类型，则自动序列化
    if (body && json && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body)
    }

    // 支持相对路径或完整路径
    const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`

    const response = await fetch(fullUrl, fetchOptions)
    const res = await response.json()
    
    if (res.status === 403) {
      router.replace('/auth')
      throw new Error(res.message)
    }

    if (!response.ok) {
      throw new Error(res.message)
    }

    try {
      return await res
    } catch {
      return null as unknown as T
    }
  }

  return { fetchClient, apiBase }
}
