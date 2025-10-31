'use client'

import { useFetch } from "@/hooks/useFetch"

export default function Auth() {

  const {apiBase} = useFetch()

  async function login() {
    window.location.href = `${apiBase}/auth/login`
  }

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="w-100 text-center border border-slate-200 bg-slate-100 px-4 py-4 rounded-lg flex flex-col gap-4">
        <h1 className="text-4xl font-bold">登录</h1>
        <div className="cursor-pointer px-4 py-2 rounded-lg text-white bg-black select-none hover:bg-slate-900" onClick={login}>
          GitHub 登录
        </div>
      </div>
    </div>
  )
}
