'use client'

import Image from "next/image"
import { toast } from "sonner"
import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Loader } from 'lucide-react'
import type { Model, CreateModelDto, UpdateModelDto } from '@/types/chat'

import ModelDialog from './ModelDialog'
import { useFetch } from '@/hooks/useFetch'
import { ChatApi } from '@/services/chatApi'
import { Button } from "@/components/ui/button"
import { TooltipContent } from '@/components/ui/tooltip'
import { Tooltip, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Columns {
  filed: keyof Model,
  label: string,
  style?:string
}

export default function ModuleSettings() {
  const { fetchClient } = useFetch()
  const chatApi = useRef(new ChatApi(fetchClient)).current

  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] =useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)

  const columns: Columns[] = [
    {
      filed: 'icon',
      label: 'logo',
      style: 'w-15'
    },
    {
      filed: 'name',
      label: '模型名称',
    },
    {
      filed: 'provider',
      label: '供应商',
      style: 'w-25'
    },
    {
      filed: 'maxTokens',
      label: '最大Token数',
      style: 'w-25'
    },
    {
      filed: 'isActive',
      label: '状态',
      style: 'w-25'
    },
    {
      filed: 'id',
      label: '操作',
      style: 'w-25'
    }
  ]

  /**
   * 加载模型列表
   */
  const loadModels = async () => {
    try {
      setIsLoading(true)
      const response = await chatApi.getAllModels()
      setModels(response.data || [])
    } catch (error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  /**
   * 创建模型
   * @param dto
   */
  const handleCreate = async (dto: CreateModelDto) => {
    try {
      await chatApi.createModel(dto)
      await loadModels()
      setDialogOpen(false)
      toast.success('创建成功')

    } catch (error:any) {
      toast.success(error.message)
    }
  }

  /**
   * 更新模型
   * @param id 
   * @param dto 
   */
  const handleUpdate = async (id: string, dto: UpdateModelDto) => {
    try {
      await chatApi.updateModel(id, dto)
      await loadModels()
      setDialogOpen(false)
      setEditingModel(null)
      toast.success("更新成功")
    } catch (error:any) {
      toast.error(error.message)
    }
  }

  /**
   * 删除模型
   */
  const handleDelete = async () => {
    if(!editingModel?.id)
      return toast.warning("模型不存在")

    console.log(editingModel?.id);
    
    try {
      await chatApi.deleteModel(editingModel?.id)
      await loadModels()
      toast.success("删除成功")
    } catch (error:any) {
      toast.error(error.message)
    }
  }

  // 打开编辑对话框
  const handleEdit = (model: Model) => {
    setEditingModel(model)
    setDialogOpen(true)
  }

  // 打开创建对话框
  const handleOpenCreate = () => {
    setEditingModel(null)
    setDialogOpen(true)
  }

  // 关闭对话框
  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingModel(null)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">
          模型管理
        </div>
        <Button className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg text-white dark:text-black bg-black dark:bg-white"
          onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>添加模型</span>
        </Button>
      </div>

      {/* 模型列表 */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center gap-4 py-16 text-gray-500 dark:text-gray-400">
          <Loader />
          <div>加载中</div>
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 py-16 text-gray-500 dark:text-gray-400"> 暂无模型 </div>
        ) : (
          <div className="border border-[#EDEDED] dark:border-[#242424] rounded-lg overflow-hidden">
            {/* 表头 */}
            <Table>
              <TableHeader className="bg-[#F9F9F9] dark:bg-[#181818] sticky top-0 z-10">
                <TableRow className="hover:bg-[#F9F9F9] dark:hover:bg-[#181818]">
                  {columns.map((c) => (
                    <TableHead key={c.filed} className={`${c.style} text-center`}>
                      {c.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            </Table>

            {/* 表体 */}
            <div className="max-h-[345px] overflow-y-auto scrollbar-none">
              <Table>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.id} className='flex overflow-hidden'>
                      <TableCell className="flex justify-center w-15">
                        {m.icon && <Image src={m.icon} width={20} height={20} alt="模型图标" />}
                      </TableCell>
                      <TableCell className="text-center flex-1 max-w-[188px] ">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='truncate'>{ m.name }</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{ m.name }</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center w-25">{m.provider}</TableCell>
                      <TableCell className="text-center w-25">{m.maxTokens}</TableCell>
                      <TableCell className="w-25">
                        {m.isActive ? (
                          <div className="flex justify-center items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div>启用</div>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <div>禁用</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-25">
                        <div className="flex gap-4 items-center justify-center">
                          <Pencil
                            size={18}
                            className="cursor-pointer text-green-500"
                            onClick={() => handleEdit(m)}
                          />
                          <Trash2
                            size={18}
                            className="cursor-pointer text-red-500"
                            onClick={() => {setEditingModel(m); setDeleteDialog(true)}}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
      )}

      {/* 创建/编辑对话框 */}
      <ModelDialog
        open={dialogOpen}
        model={editingModel}
        onClose={handleCloseDialog}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* 删除对话框 */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除模型?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex gap-1">
            确定要删除 <div className="font-bold">{ editingModel?.name }</div> 模型吗?
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}