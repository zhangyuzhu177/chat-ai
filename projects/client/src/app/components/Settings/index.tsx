'use client'

import { useState } from "react"
import { Settings as SettingsIcon, X } from "lucide-react"

import { MenubarItem } from "@/components/ui/menubar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Settings() {
  const [open, setOpen] = useState(false)
  
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
          <SettingsIcon size={24} color="black"/>
          <div>设置</div>
        </div>
      </MenubarItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[760px]! p-4 [&>button:last-child]:hidden focus:outline-none focus:ring-0">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <div>系统设置</div>
              <X className="cursor-pointer" size={24} strokeWidth={2} onClick={()=>setOpen(false)}/>
            </DialogTitle>
          </DialogHeader>
          <div className=" h-[430px]">
            123
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
