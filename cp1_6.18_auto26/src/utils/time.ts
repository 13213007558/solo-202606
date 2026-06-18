export function formatRelativeTime(timestamp: number | string | Date): string {
  const date =
    timestamp instanceof Date ? timestamp : new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return '刚刚'
  }
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 30) {
    return `${days}天前`
  }

  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}个月前`
  }

  const years = Math.floor(months / 12)
  return `${years}年前`
}
