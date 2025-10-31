'use client'

import Link from "next/link"
import Image from "next/image"
import { User } from "@/app/types/user"
import { useEffect, useState } from "react"
import { useFetch } from "@/hooks/useFetch"
import { usePathname, useRouter } from "next/navigation"
import LogoutIcon from '@mui/icons-material/Logout';

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"

const menu = [
    { name: '首页', path: '/' ,},
    { name: '聊天', path: '/chat',},
  ]
export default function Menu() {
  const router = useRouter()
  const pathName = usePathname()
  const { fetchClient } = useFetch()
  const [user, setUser] = useState<User>()
  const [path, setPath] = useState<string>(pathName || '/')

  /**
   * 退出登录
   */
  async function logout() {
    try {
      const res = await fetchClient('/auth/logout',{ method: 'POST' })
      router.replace('/auth')
      console.log('退出登录成功', res)
    } catch (error) {
      console.error('请求失败', error)
    }
  }

  useEffect(() => {
    async function getUserProfile() {
      try {
        const res = await fetchClient<{ data: User }>('/user/own/profile')
        setUser(res.data)
      } catch (error) {
        console.error('请求失败', error)
      }
    }
    getUserProfile()
  }, [])

  return (
    <div className="w-60 h-screen bg-[#F9F9F9] flex flex-col gap-6 px-2 py-4 border-r border-[#EDEDED] justify-between">
      <div className="flex flex-col gap-4">
        <div className="text-2xl text-center font-bold px-4 py-2">AI</div>

        {/* 菜单 */}
        <div className="flex flex-col gap-2">
          { menu.map((item) => (
            <Link
              key={item.name}
              className={`
                ${path === item.path ? 'bg-[#EFEFEF]' : 'hover:bg-[#EFEFEF]'} 
                px-4 py-1 rounded-md transition-all flex items-center gap-2
              `}
              href={item.path}
              onClick={() => setPath(item.path)}
            >
              <div>{item.name}</div>
            </Link>
          )) }
        </div>
      </div>

      {/* 个人信息 */}
      {user && (
        <Menubar className="bg-transparent h-auto p-0 border-none shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="w-full cursor-pointer p-0 flex items-center gap-2 justify-between">
            <div className="w-full flex items-center justify-between p-2 cursor-pointer transition-all rounded-lg hover:bg-[#EDEDED]">
              <div className="flex items-center gap-2">
                <Image src={user?.avatar} width={30} height={30} className="rounded-full" alt="" />
                <div>{user?.name}</div> 
              </div>
              <div>...</div>
            </div>
          </MenubarTrigger>
          <MenubarContent>
              <MenubarItem className="flex items-center gap-2" onClick={logout}>
                <LogoutIcon fontSize="small" />
                <div>退出登录</div>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      )}
    </div>
  )
}
