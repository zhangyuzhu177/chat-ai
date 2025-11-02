
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { User } from "@/app/types/user"
import { useFetch } from "@/hooks/useFetch"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"
import { CircleUser, Ellipsis, LogOut } from "lucide-react"
import Settings from "../Settings"

interface ProfileProps {
  /**
   * 是否折叠
   */
  collapsed?: boolean
}

export default function Profile(props: ProfileProps) {
  const router = useRouter()
  const { fetchClient } = useFetch()
  const [user, setUser] = useState<User>()

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
    <>
      {user && (
        <div className="px-1.5 py-4 w-full">
          <Menubar open={false} className="bg-transparent h-auto p-0 border-none shadow-none">
            <MenubarMenu>
              <MenubarTrigger className="w-full cursor-pointer p-0 flex items-center gap-2 justify-between">
                <div className="w-full flex items-center justify-between p-2 cursor-pointer transition-all rounded-lg hover:bg-[#EDEDED] data-[state=open]:bg-[#EDEDED] ">
                  {
                    props.collapsed
                    ? <Image src={user?.avatar} width={24} height={24} className="rounded-full" alt="" />
                    : <>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Image src={user?.avatar} width={24} height={24} className="rounded-full" alt="" />
                          <div className="text-nowrap truncate">{user?.name}</div> 
                        </div>
                        <Ellipsis size={20} />
                      </>
                  }
                </div>
              </MenubarTrigger>
              <MenubarContent >
                <div className="flex items-center gap-2 p-2 text-sm text-[#8F8F8F]">
                  <CircleUser size={16} />
                  <div>{ user?.email }</div>
                </div>
                {/* <MenubarItem className="flex items-center gap-2"> */}
                  <Settings />
                {/* </MenubarItem> */}
                <MenubarItem className="flex items-center gap-2" onClick={logout}>
                  <LogOut size={24} color="black"/>
                  <div>退出登录</div>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      )}
    </>
  )
}
