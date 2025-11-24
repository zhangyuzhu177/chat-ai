'use client'

import { useState } from "react"
import { Package, Settings as SettingsIcon, X } from "lucide-react"

import { MenubarItem } from "@/components/ui/menubar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import ModuleSettings from "./ModuleSettings"
import GeneralSettings from "./GeneralSettings"

interface Tab {
  tab: number
  title: string
  icon: React.ReactNode
}

export default function Settings() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab['tab']>(1)

  const tabs: Tab[] = [
    {
      tab: 1,
      title: '通用设置',
      icon: <SettingsIcon size={16} className="text-black dark:text-white"/>
    },
    {
      tab: 2,
      title: '模型设置',
      icon: <Package size={16} className="text-black dark:text-white"/>
    },
  ]
  
  return (
    <>
      {/* 触发器（菜单项） */}
      <MenubarItem
        onSelect={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <SettingsIcon size={24} className="text-black dark:text-white" />
          <div>设置</div>
        </div>
      </MenubarItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[860px]! bg-white dark:bg-[#212121] p-4 [&>button:last-child]:hidden focus:outline-none focus:ring-0">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <div>系统设置</div>
              <X className="cursor-pointer" size={24} strokeWidth={2} onClick={()=>setOpen(false)}/>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[430px] flex gap-4 text-sm">
            <div className="flex flex-col gap-1 w-40">
              {
                tabs.map((t) => (
                  <div
                    key={t.tab}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${tab === t.tab ? 'bg-[#EFEFEF] dark:bg-[#353535]' : ''} hover:bg-[#EFEFEF] dark:hover:bg-[#353535]`}
                    onClick={() => setTab(t.tab)}
                  >
                    {t.icon}
                    <div>{t.title}</div>
                  </div>
                ))
              }
            </div>
            <div className="flex-1">
              <TabComponent tab={tab} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function TabComponent({tab}:{tab:Tab['tab']}) {
  if (tab === 1)
    return <GeneralSettings />
  else if (tab === 2)
    return <ModuleSettings />
  else
    return <div>暂无数据</div>
}
