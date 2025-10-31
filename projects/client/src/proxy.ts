import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value || ''
  const { pathname } = req.nextUrl

  // ✅ 静态资源、API、公共文件直接放行
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // ✅ 未登录的用户访问受保护页面 → 跳转到登录页
  const isAuthPage = pathname.startsWith('/auth')
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/auth', req.url)
    // 登录后可返回原地址
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ 已登录用户访问 /auth 页面 → 自动跳转到首页
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // ✅ 默认放行
  return NextResponse.next()
}

// ✅ 配置作用范围（排除静态资源）
export const config = {
  matcher: [
    // 匹配除 _next/static、_next/image、favicon.ico 以外的所有路径
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
