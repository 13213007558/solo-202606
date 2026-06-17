import React, { useState, useEffect } from 'react'
import type { FormData, Season, ActivityType } from '../types'

interface LocationFormProps {
  initialData: FormData | null
  onSubmit: (data: FormData) => void
}

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: 'spring', label: '🌸 春季' },
  { value: 'summer', label: '☀️ 夏季' },
  { value: 'autumn', label: '🍂 秋季' },
  { value: 'winter', label: '❄️ 冬季' }
]

const ACTIVITY_OPTIONS: { value: ActivityType; label: string; icon: string }[] = [
  { value: 'beach', label: '海滩', icon: '🏖️' },
  { value: 'hiking', label: '徒步', icon: '🥾' },
  { value: 'skiing', label: '滑雪', icon: '⛷️' },
  { value: 'business', label: '商务', icon: '💼' },
  { value: 'cityTour', label: '城市观光', icon: '🏙️' }
]

export const LocationForm: React.FC<LocationFormProps> = ({ initialData, onSubmit }) => {
  const [destination, setDestination] = useState<string>(initialData?.destination ?? '')
  const [days, setDays] = useState<number>(initialData?.days ?? 3)
  const [season, setSeason] = useState<Season>(initialData?.season ?? 'spring')
  const [activities, setActivities] = useState<ActivityType[]>(initialData?.activities ?? [])
  const [errors, setErrors] = useState<{ destination?: string; days?: string }>({})

  useEffect(() => {
    if (initialData) {
      setDestination(initialData.destination)
      setDays(initialData.days)
      setSeason(initialData.season)
      setActivities(initialData.activities)
    }
  }, [initialData])

  const toggleActivity = (activity: ActivityType) => {
    setActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    )
  }

  const validate = (): boolean => {
    const newErrors: { destination?: string; days?: string } = {}
    if (!destination.trim()) {
      newErrors.destination = '请输入目的地'
    }
    if (days < 1 || days > 365) {
      newErrors.days = '天数应在 1-365 之间'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        destination: destination.trim(),
        days,
        season,
        activities
      })
    }
  }

  return (
    <form className="form-container" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">🎒 生成打包清单</h2>
      <p className="form-subtitle">填写你的旅行信息，智能生成清单</p>

      <div className="form-group">
        <label className="form-label" htmlFor="destination">
          目的地
        </label>
        <input
          id="destination"
          type="text"
          className={`form-input ${errors.destination ? 'form-input-error' : ''}`}
          placeholder="例如：东京、三亚、巴黎..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        {errors.destination && <p className="form-error">{errors.destination}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="days">
          旅行天数
        </label>
        <input
          id="days"
          type="number"
          min={1}
          max={365}
          className={`form-input ${errors.days ? 'form-input-error' : ''}`}
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value, 10) || 0)}
        />
        {errors.days && <p className="form-error">{errors.days}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="season">
          季节
        </label>
        <select
          id="season"
          className="form-input form-select"
          value={season}
          onChange={(e) => setSeason(e.target.value as Season)}
        >
          {SEASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">活动类型（可多选）</label>
        <div className="activity-tags">
          {ACTIVITY_OPTIONS.map((opt) => {
            const isActive = activities.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                className={`activity-tag ${isActive ? 'activity-tag-active' : ''}`}
                onClick={() => toggleActivity(opt.value)}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button type="submit" className="btn-primary ripple">
        ✨ 生成打包清单
      </button>
    </form>
  )
}
