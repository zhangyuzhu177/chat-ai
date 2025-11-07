'use client'

import { useState } from 'react'
import { MessageSquare, Pin, Trash2 } from 'lucide-react'
import type { Conversation } from '@/types/chat'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface ConversationListProps {
  conversations: Conversation[]
  currentConversation: Conversation | null
  onSelect: (conversation: Conversation) => void | Promise<void>
  onDelete: (id: string) => void
}

export default function ConversationList({
  conversations,
  currentConversation,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>()

  const renderConversation = (conversation: Conversation) => {
    const isActive = currentConversation?.id === conversation.id
    return (
      <div
        key={conversation.id}
        className={`
          group w-full flex justify-between items-center px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors
          ${
            isActive
              ? 'bg-[#EAEAEA] dark:bg-[#212121]'
              : 'hover:bg-[#EAEAEA] dark:hover:bg-[#212121]'
          }
        `}
        onClick={() => onSelect(conversation)}
      >
        <div className="text-sm font-medium text-nowrap truncate"> {conversation.title} </div>
        <div className="top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Trash2 onClick={(e) => {
            e.stopPropagation()
            setConversation(conversation)
            setDeleteDialog(true)
          }} size={14} className="text-red-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto overflow-x-hidden px-2">
      {/* 对话 */}
      {conversations.length > 0 && (
        <div className='flex flex-col gap-1'>
          <div className="text-sm text-[#8F8F8F] dark:text-[#AFAFAF] px-2">
            聊天
          </div>
          <div className="flex flex-col gap-1">
            {conversations.map(renderConversation)}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <MessageSquare size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">还没有对话</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            开始一个新对话吧
          </p>
        </div>
      )}

      {/* 删除对话框 */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除对话?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex gap-1">
            确定要删除 <div className="font-bold">{ conversation?.title }</div> 对话吗?
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className='cursor-pointer'>取消</AlertDialogCancel>
            <AlertDialogAction className='cursor-pointer' onClick={() => {
              if (!conversation?.id)
                return
              onDelete(conversation.id)
              setDeleteDialog(false)
            }}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
