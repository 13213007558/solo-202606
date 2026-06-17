import React, { useState, useEffect, useCallback, useRef } from 'react'
import { LocationForm } from './components/LocationForm'
import { PackingList } from './components/PackingList'
import { generatePackingList } from './utils/ruleEngine'
import type { FormData, PackingList as PackingListType } from './types'

const STORAGE_KEY = 'travel-packing-list-state-v1'

interface ToastState {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const DEFAULT_FORM_DRAFT: FormData = {
  destination: '',
  days: 3,
  season: 'spring',
  activities: []
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [formDraft, setFormDraft] = useState<FormData>(DEFAULT_FORM_DRAFT)
  const [packingList, setPackingList] = useState<PackingListType | null>(null)
  const [toasts, setToasts] = useState<ToastState[]>([])
  const isHydrated = useRef(false)

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          formData: FormData | null
          formDraft: FormData | null
          packingList: PackingListType | null
        }
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.formDraft) setFormDraft(parsed.formDraft)
        if (parsed.packingList) setPackingList(parsed.packingList)
      }
    } catch (err) {
      console.warn('读取本地存储失败:', err)
    }
    isHydrated.current = true
  }, [])

  useEffect(() => {
    if (!isHydrated.current) return
    try {
      const data = JSON.stringify({ formData, formDraft, packingList })
      localStorage.setItem(STORAGE_KEY, data)
    } catch (err) {
      console.warn('写入本地存储失败:', err)
    }
  }, [formData, formDraft, packingList])

  const handleFormChange = useCallback((partial: Partial<FormData>) => {
    setFormDraft((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleGenerate = useCallback(
    (data: FormData) => {
      setFormData(data)
      const list = generatePackingList(data)
      setPackingList(list)
      const total = list.categories.reduce((sum, c) => sum + c.items.length, 0)
      showToast(`✨ 清单已生成，共 ${total} 项物品`, 'success')
    },
    [showToast]
  )

  const handleToggleItem = useCallback((categoryId: string, itemId: string) => {
    setPackingList((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === itemId ? { ...item, checked: !item.checked } : item
                )
              }
            : cat
        )
      }
    })
  }, [])

  const handleDeleteItem = useCallback((categoryId: string, itemId: string) => {
    setPackingList((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.filter((item) => item.id !== itemId)
              }
            : cat
        )
      }
    })
    showToast('已删除该物品', 'info')
  }, [showToast])

  const handleRegenerate = useCallback(() => {
    if (!formData) return
    const list = generatePackingList(formData)
    setPackingList(list)
    const total = list.categories.reduce((sum, c) => sum + c.items.length, 0)
    showToast(`🔄 已重新生成，共 ${total} 项物品`, 'success')
  }, [formData, showToast])

  const handleExport = useCallback(() => {
    if (!packingList) {
      showToast('暂无清单可导出', 'error')
      return
    }
    try {
      const json = JSON.stringify(packingList, null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `packing-list-${packingList.formData.destination}-${new Date()
        .toISOString()
        .slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('📤 清单已导出', 'success')
    } catch (err) {
      console.error(err)
      showToast('导出失败', 'error')
    }
  }, [packingList, showToast])

  const handleImport = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const parsed = JSON.parse(content) as PackingListType
          if (
            !parsed.categories ||
            !Array.isArray(parsed.categories) ||
            !parsed.formData
          ) {
            throw new Error('文件格式无效')
          }
          setPackingList(parsed)
          setFormData(parsed.formData)
          showToast('📥 清单已导入', 'success')
        } catch (err) {
          console.error(err)
          showToast('导入失败：文件格式无效', 'error')
        }
      }
      reader.onerror = () => {
        showToast('读取文件失败', 'error')
      }
      reader.readAsText(file)
    },
    [showToast]
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="app-title-emoji">✈️</span>
          <span>旅行打包清单</span>
          <span className="app-title-accent">智能生成器</span>
        </h1>
        <p className="app-subtitle">根据你的旅行信息，一键生成专业打包清单</p>
      </header>

      <main className="app-main">
        <aside className="app-sidebar">
          <LocationForm
            initialData={formData ?? formDraft}
            onSubmit={handleGenerate}
            onFormChange={handleFormChange}
          />
        </aside>

        <section className="app-content">
          {packingList ? (
            <PackingList
              list={packingList}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onExport={handleExport}
              onImport={handleImport}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎒</div>
              <h3 className="empty-state-title">还没有打包清单</h3>
              <p className="empty-state-desc">
                填写左侧表单，点击「生成打包清单」开始吧
              </p>
            </div>
          )}
        </section>
      </main>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
