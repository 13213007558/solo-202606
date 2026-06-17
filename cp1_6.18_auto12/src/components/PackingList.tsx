import React, { useState, useMemo } from 'react'
import type { PackingList as PackingListType, PackingCategory, PackingItem } from '../types'

interface PackingListProps {
  list: PackingListType
  onToggleItem: (categoryId: string, itemId: string) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
  onExport: () => void
  onImport: (file: File) => void
  onRegenerate: () => void
}

const ProgressRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg className="progress-ring" width="40" height="40" viewBox="0 0 40 40">
      <circle
        className="progress-ring-bg"
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        strokeWidth="3"
      />
      <circle
        className="progress-ring-fg"
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <text
        className="progress-ring-text"
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  )
}

const PackingItemRow: React.FC<{
  item: PackingItem
  onToggle: () => void
  onDelete: () => void
}> = React.memo(({ item, onToggle, onDelete }) => {
  return (
    <div className={`packing-item ${item.checked ? 'packing-item-checked' : ''}`}>
      <label className="item-checkbox-wrap ripple" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="item-checkbox"
          checked={item.checked}
          onChange={onToggle}
        />
        <span className="item-checkmark" />
      </label>
      <span className="item-name-wrap">
        <span className="item-name">{item.name}</span>
        {item.quantity > 1 && <span className="item-quantity">×{item.quantity}</span>}
      </span>
      <button
        type="button"
        className="item-delete ripple"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="删除"
      >
        ✕
      </button>
    </div>
  )
})
PackingItemRow.displayName = 'PackingItemRow'

const AccordionCard: React.FC<{
  category: PackingCategory
  expanded: boolean
  onToggle: () => void
  onToggleItem: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
}> = ({ category, expanded, onToggle, onToggleItem, onDeleteItem }) => {
  const percentage = useMemo(() => {
    if (category.items.length === 0) return 0
    const checked = category.items.filter((i) => i.checked).length
    return (checked / category.items.length) * 100
  }, [category.items])

  const checkedCount = category.items.filter((i) => i.checked).length
  const totalCount = category.items.length

  return (
    <div className={`accordion-card ${expanded ? 'accordion-expanded' : ''}`}>
      <button
        type="button"
        className="accordion-header ripple"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="accordion-icon">{category.icon}</span>
        <span className="accordion-title">
          {category.name}
          <span className="accordion-count">
            {checkedCount}/{totalCount}
          </span>
        </span>
        <ProgressRing percentage={percentage} />
        <span className={`accordion-chevron ${expanded ? 'accordion-chevron-open' : ''}`}>
          ▼
        </span>
      </button>
      <div
        className="accordion-content"
        style={
          expanded
            ? { maxHeight: `${category.items.length * 56 + 32}px` }
            : { maxHeight: '0px' }
        }
      >
        <div className="accordion-inner">
          {category.items.length === 0 ? (
            <p className="empty-hint">该类别暂无物品</p>
          ) : (
            category.items.map((item) => (
              <PackingItemRow
                key={item.id}
                item={item}
                onToggle={() => onToggleItem(item.id)}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export const PackingList: React.FC<PackingListProps> = ({
  list,
  onToggleItem,
  onDeleteItem,
  onExport,
  onImport,
  onRegenerate
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(list.categories.map((c) => c.id))
  )
  const [importFile, setImportFile] = useState<HTMLInputElement | null>(null)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const totalItems = list.categories.reduce((sum, c) => sum + c.items.length, 0)
  const checkedItems = list.categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.checked).length,
    0
  )
  const overallPercentage = totalItems === 0 ? 0 : (checkedItems / totalItems) * 100

  const handleImportClick = () => {
    importFile?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
    }
    e.target.value = ''
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <div>
          <h2 className="list-title">
            📋 {list.formData.destination} · {list.formData.days} 天
          </h2>
          <p className="list-subtitle">
            {new Date(list.generatedAt).toLocaleString('zh-CN')} 生成 · 共 {totalItems} 项
          </p>
        </div>
        <div className="header-progress">
          <ProgressRing percentage={overallPercentage} />
        </div>
      </div>

      <div className="list-actions">
        <button type="button" className="btn-secondary ripple" onClick={onRegenerate}>
          🔄 重新生成
        </button>
        <button type="button" className="btn-secondary ripple" onClick={handleImportClick}>
          📥 导入
        </button>
        <button type="button" className="btn-secondary ripple" onClick={onExport}>
          📤 导出
        </button>
        <input
          ref={(el) => setImportFile(el)}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="accordion-list">
        {list.categories.map((category) => (
          <AccordionCard
            key={category.id}
            category={category}
            expanded={expandedCategories.has(category.id)}
            onToggle={() => toggleCategory(category.id)}
            onToggleItem={(itemId) => onToggleItem(category.id, itemId)}
            onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
          />
        ))}
      </div>
    </div>
  )
}
