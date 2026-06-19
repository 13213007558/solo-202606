import { useState, useEffect, useRef } from 'react'

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: string) => void
  amount: number
}

const MessageModal = ({ isOpen, onClose, onSubmit, amount }: MessageModalProps) => {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setMessage('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(message.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>感谢您的爱心捐赠</h3>
          <p className="modal-subtitle">捐赠金额：<strong>¥{amount}</strong></p>
        </div>

        <div className="modal-body">
          <label htmlFor="message">留下您的祝福语</label>
          <textarea
            ref={inputRef}
            id="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="写下您的祝福，传递爱心..."
            maxLength={140}
            rows={4}
          />
          <div className={`char-count ${message.length >= 140 ? 'max' : ''}`}>
            {message.length}/140
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交祝福'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageModal
