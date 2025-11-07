'use client'

import { useChatContext } from '@/contexts/ChatContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Header() {
  const { models, selectedModelId, setSelectedModelId } = useChatContext()

  return (
    <div className="px-4 py-3 border-b border-[#EDEDED] dark:border-[#303030] bg-white dark:bg-[#212121]">
      <Select value={selectedModelId||''} onValueChange={value => setSelectedModelId(value)}>
        <SelectTrigger className='w-70 border-none transition-all decoration-300 bg-white dark:bg-[#212121] hover:bg-[#EDEDED] shadow-none cursor-pointer'>
          <SelectValue placeholder="请选择模型" />
        </SelectTrigger>
        <SelectContent className='w-70'>
          {models.map((m) => {
              return (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              )
            })}
        </SelectContent>
      </Select>
    </div>
  )
}
