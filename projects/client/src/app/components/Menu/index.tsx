'use client'

import { useState } from "react"
import Image from "next/image";
import { PanelLeftClose, PanelRightClose } from "lucide-react";

import Profile from "../Profile"
import Logo from "@/assets/icons/logo.svg"

export default function Menu() {
  const [collapsed, setCollapsed] = useState(false)
  const [hover, setHover] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  function handleEnter() {
    const t = setTimeout(() => setHover(true), 150) // 延迟150ms触发
    setTimer(t)
  }

  function handleLeave() {
    if (timer) clearTimeout(timer)
    const t = setTimeout(() => setHover(false), 150)
    setTimer(t)
  }

  return (
    <div className={`
        h-screen bg-[#F9F9F9] flex flex-col gap-6 border-r border-[#EDEDED] justify-between
        transition-all duration-700 ease-in-out overflow-hidden
        ${collapsed ? 'w-13.5' : 'w-60'}
      `}>
      <div className="flex flex-col gap-4">
        {/* Logo */}
        {
          collapsed
          ? (<div className="px-1.5 py-2 w-13.5">
            <div
              className="flex items-center cursor-pointer p-2 rounded-md hover:bg-[#EDEDED]"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              { hover ?
                <div className="w-full flex items-center justify-center" onClick={() => setCollapsed(!collapsed)}>
                  <PanelRightClose size={20} strokeWidth={1.5}/>
                </div> 
                : <Image src={Logo} alt="logo" width={24} height={24} />
              }
            </div>
          </div>)
          : (
            <div className="flex items-center justify-between px-4 py-2">
              <div className="cursor-pointer p-2 rounded-md hover:bg-[#EDEDED]">
                  <Image src={Logo} alt="logo" width={24} height={24} />
              </div>
              <div
                className="cursor-pointer p-2 rounded-md hover:bg-[#EDEDED]"
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

        {/* 菜单 */}
        <div className="flex flex-col gap-2">
        </div>
      </div>

      {/* 个人信息 */}
      <Profile collapsed={collapsed}/>
    </div>
  )
}
