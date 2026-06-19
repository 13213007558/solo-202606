export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const getTimeRemaining = (deadline: string) => {
  const now = new Date().getTime()
  const end = new Date(deadline).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, total: diff }
}

export const getProgressColor = (progress: number): string => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const hue = clampedProgress * 120
  return `hsl(${hue}, 70%, 55%)`
}

export const getDonationCardColor = (amount: number): string => {
  if (amount >= 100) return '#FFF3CD'
  if (amount >= 50) return '#D4EDDA'
  return '#CCE5FF'
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
