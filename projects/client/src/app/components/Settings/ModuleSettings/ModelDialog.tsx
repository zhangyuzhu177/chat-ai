'use client'

import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { Model, CreateModelDto, UpdateModelDto } from '@/types/chat'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ModelDialogProps {
  open: boolean
  model: Model | null
  onClose: () => void
  onCreate: (dto: CreateModelDto) => Promise<void>
  onUpdate: (id: string, dto: UpdateModelDto) => Promise<void>
}

const providerOpts = [
  { value: 'OpenAI', label: 'OpenAI' },
  { value: 'Deepseek', label: 'Deepseek' },
  { value: 'Anthropic', label: 'Anthropic' },
  { value: 'Qwen', label: 'Qwen' },
  { value: '其他', label: '其他' },
]

export default function ModelDialog({
  open,
  model,
  onClose,
  onCreate,
  onUpdate,
}: ModelDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateModelDto>({
    name: '',
    provider: providerOpts[0].value,
    maxTokens: 4096,
    isActive: true,
    icon: '',
    sortOrder: 0,
  })

  // 当打开对话框或编辑模型时，初始化表单
  useEffect(() => {
    if (open) {
      if (model) {
        // 编辑模式
        setFormData({
          name: model.name,
          provider: model.provider,
          maxTokens: model.maxTokens,
          isActive: model.isActive,
          icon: model.icon || '',
          sortOrder: model.sortOrder,
        })
      } else {
        // 创建模式 - 重置为默认值
        setFormData({
          name: '',
          provider: providerOpts[0].value,
          maxTokens: 4096,
          isActive: true,
          icon: '',
          sortOrder: 0,
        })
      }
    }
  }, [open, model])

  /**
   * 更新表单数据
   * @param key 
   * @param value 
   */
  const handleChange = (key: keyof Model, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  /**
   * 提交表单
   * @param e 
   * @returns 
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name)
      return toast.warning('请填写模型名称')
    if (!formData.icon)
      return toast.warning('请输入图标URL')

    setIsSubmitting(true)

    try {
      if (model) {
        // 更新模式
        await onUpdate(model.id, formData)
      } else {
        // 创建模式
        await onCreate(formData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={()=>onClose()}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#212121] p-4 [&>button:last-child]:hidden focus:outline-none focus:ring-0">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <div>{model ? '编辑模型' : '添加模型'}</div>
              <X className="cursor-pointer" size={24} strokeWidth={2} onClick={()=>onClose()}/>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[400px] p-1 w-full flex gap-4 text-sm overflow-auto">
            <form className='w-full'>
              <FieldGroup>
                <FieldSet>
                  <FieldGroup className='gap-4'>
                    <Field className='gap-1'>
                      <FieldLabel>
                        模型名称
                      </FieldLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="请输入模型名称"
                      />
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel>
                        供应商
                      </FieldLabel>
                      <Select value={formData.provider} onValueChange={value => handleChange('provider', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择供应商" />
                        </SelectTrigger>
                        <SelectContent>
                          {providerOpts.map((opt) => {
                              return (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              )
                            })}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel> 最大Token数 </FieldLabel>
                      <Input
                        placeholder="请输入最大Token数"
                        value={formData.maxTokens}
                        onChange={e => handleChange('maxTokens', e.target.value)}
                        type='number'
                      />
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel> 图标URL </FieldLabel>
                      <Input
                        value={formData.icon}
                        onChange={e => handleChange('icon', e.target.value)}
                        placeholder="https://..."
                      />
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel> 排序 </FieldLabel>
                      <Input
                        value={formData.sortOrder}
                        onChange={e => handleChange('sortOrder', e.target.value)}
                        placeholder="排序"
                        type='number'
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        checked={formData.isActive}
                        onCheckedChange={checked => handleChange('isActive', checked === true)}
                        defaultChecked
                      />
                      <FieldLabel className="font-normal" > 模型状态 </FieldLabel>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className='cursor-pointer' variant="outline">取消</Button>
            </DialogClose>
            <Button className='cursor-pointer' disabled={isSubmitting} type="submit" onClick={handleSubmit}>
              {isSubmitting ? '提交中...' : model ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}