'use client'

import { toast } from "sonner"
import Image from "next/image"
import { useState } from "react"
import { useTheme } from "next-themes"
import { PanelLeftClose, PanelRightClose, SquarePen } from "lucide-react"

import LogoIcon from "@/assets/icons/logo.svg"
import LogoDark from "@/assets/icons/logo-dark.svg"
import { useChatContext } from "@/contexts/ChatContext"

import Profile from "../Profile"
import ConversationList from "../Chat/ConversationList"

export default function Menu() {
  const { theme, systemTheme } = useTheme()

  const [hover, setHover] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const {
    conversations,
    selectedModelId,
    currentConversation,
    deleteConversation,
    updateConversation,
    switchConversation,
    createConversation
  } = useChatContext()

  const currentTheme = theme === 'system' ? systemTheme : theme
  const logo = currentTheme ? (currentTheme === 'light' ? LogoIcon : LogoDark) : LogoIcon
  
    /**
   * 创建新对话
   */
  const handleNewConversation = async () => {
    if (!selectedModelId) {
      return toast.warning('请先选择一个模型')
    }
    
    if (conversations.find(c => c.title === '新对话'))
      return

    try {
      await createConversation({
        modelId: selectedModelId,
        title: '新对话',
      })
    } catch (error) {
      console.error('创建对话失败:', error)
      return toast.error('创建对话失败')
    }
  }

  function handleEnter() {
    const t = setTimeout(() => setHover(true), 150) // 延迟150ms触发
    setTimer(t)
  }

  function handleLeave() {
    if (timer) clearTimeout(timer)
    const t = setTimeout(() => setHover(false), 150)
    setTimer(t)
  }

  /**
   * 展开视图
   */
  const expandedView = () => {
    return (
      <div className="flex items-center justify-between px-4 py-2">
        <div className="cursor-pointer p-2 rounded-md hover:bg-[#EDEDED] dark:hover:bg-[#303030]">
            <Image src={logo} alt="logo" width={24} height={24} />
        </div>
        <div
          className="cursor-pointer p-2 rounded-md hover:bg-[#EDEDED] dark:hover:bg-[#303030]"
          onClick={() => {
            setCollapsed(!collapsed)
            setHover(false)
          }}
        >
          <PanelLeftClose size={20} strokeWidth={1.5}/>
        </div>
      </div>
    )
  }

  /**
   * 收起视图
   */
  const collapsedView = () => {
    return (
      <div className="px-1.5 py-2 w-13.5">
        <div
          className="h-10 flex items-center cursor-pointer p-2 rounded-md hover:bg-[#EDEDED] dark:hover:bg-[#303030]"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          { hover ?
            <div className="w-full flex items-center justify-center" onClick={() => setCollapsed(!collapsed)}>
              <PanelRightClose size={20} strokeWidth={1.5}/>
            </div> 
            : <Image src={logo} alt="logo" width={24} height={24} />
          }
        </div>
      </div>
    )
  }

  return (
    <div className={`
        h-screen bg-[#F9F9F9] dark:bg-[#181818] flex flex-col gap-4 border-r border-[#EDEDED] dark:border-[#242424]
        ease-in-out overflow-hidden transition-[width] duration-300
        ${collapsed ? 'w-13.5' : 'w-60'}
      `}>
      <div className="flex flex-col gap-4">
        {/* Logo */}
        {collapsed ? collapsedView() : expandedView() }
      </div>

      <div className="px-2">
        <div
          className={`w-full text-sm flex items-center ${collapsed?'justify-center':''} gap-2 p-2 select-none cursor-pointer transition-all rounded-lg hover:bg-[#EDEDED] dark:hover:bg-[#303030] overflow-hidden`}
          onClick={handleNewConversation}
        >
          <SquarePen size={18} strokeWidth={1.5} className="text-black shrink-0 dark:text-white" />
          {!collapsed && <div className="text-nowrap truncate">新聊天</div>}
        </div>
      </div>

      {/* 对话记录 */}
      <div className="flex-1">
        {!collapsed && (
          <ConversationList
            conversations={conversations}
            currentConversation={currentConversation}
            onSelect={switchConversation}
            onDelete={deleteConversation}
          />
        )}
      </div>

      {/* 个人信息 */}
      <Profile collapsed={collapsed} />
    </div>
  )
}
