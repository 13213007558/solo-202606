export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysRemaining = (dateString: string): number => {
  const now = new Date();
  const eventDate = new Date(dateString);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isEventEnded = (dateString: string): boolean => {
  return getDaysRemaining(dateString) < 0;
};

export const isEventFull = (current: number, max: number): boolean => {
  return current >= max;
};

export const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    cleanup: '清洁活动',
    planting: '植树活动',
    education: '宣传教育',
    other: '其他活动',
  };
  return labels[type] || type;
};

export const getEventStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束',
  };
  return labels[status] || status;
};

export const getGradientColor = (days: number): string => {
  if (days <= 0) return '#ef4444';
  if (days <= 3) return '#f97316';
  if (days <= 7) return '#eab308';
  return '#22c55e';
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
