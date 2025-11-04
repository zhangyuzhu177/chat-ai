import { LaptopMinimal, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ThemeTab {
  name: string
  value: string
  icon: React.ReactNode
}

export default function GeneralSettings() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const themeTabs:ThemeTab[] = [
    {
      name: '浅色',
      value: 'light',
      icon: <Sun size={16} />
    },
    {
      name: '深色',
      value: 'dark',
      icon: <Moon size={16} />
    },
    {
      name: '跟随系统',
      value: 'system',
      icon: <LaptopMinimal size={16} />
    },
  ]

    useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])
  if (!mounted) return null

  // ✅ 计算当前实际主题（resolvedTheme）
  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <div>主题</div>
        <div className='flex gap-2'>
          {
            themeTabs.map(t => {
              return (
                <div
                  key={t.value}
                  className={`flex flex-col gap-1 items-center justify-center flex-1 cursor-pointer rounded-lg py-4 ${theme===t.value?'bg-[#F1F3F5] dark:bg-[#43454A]':''} border border-[#D8DADC] dark:border-[#5A5C60]`}
                  onClick={() => setTheme(t.value)}
                >
                  {t.icon}
                  <div>{ t.name }</div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}
