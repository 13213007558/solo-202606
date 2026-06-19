import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity } from '../types'
import { formatCurrency, getTimeRemaining, getProgressColor } from '../utils/helpers'

interface ActivityCardProps {
  activity: Activity
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(activity.deadline))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(activity.deadline))
    }, 1000)

    return () => clearInterval(timer)
  }, [activity.deadline])

  const progress = Math.min(100, (activity.currentAmount / activity.targetAmount) * 100)
  const isExpired = timeLeft.total <= 0

  return (
    <Link to={`/activity/${activity.id}`} className="activity-card-link">
      <div className="activity-card">
        <div className="activity-card-header">
          <h3 className="activity-card-title">{activity.name}</h3>
          <span className="activity-creator-tag">由 {activity.creatorName}</span>
        </div>

        <p className="activity-card-desc">
          {activity.description.length > 80
            ? activity.description.substring(0, 80) + '...'
            : activity.description}
        </p>

        <div className="progress-section">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #FF6B6B 0%, ${getProgressColor(progress / 100)} 100%)`
              }}
            />
          </div>
          <div className="progress-stats">
            <span className="progress-percent">{Math.round(progress * 10) / 10}%</span>
            <span className="progress-amount">
              {formatCurrency(activity.currentAmount)} / {formatCurrency(activity.targetAmount)}
            </span>
          </div>
        </div>

        <div className="activity-card-footer">
          <div className="donor-count">
            <span className="count-icon">👥</span>
            <span>{activity.donorCount} 人参与</span>
          </div>
          <div className={`countdown ${isExpired ? 'expired' : ''}`}>
            {isExpired ? (
              <span>已结束</span>
            ) : (
              <>
                <span className="countdown-label">剩余</span>
                <span className="countdown-time">
                  {timeLeft.days > 0 && `${timeLeft.days}天`}
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ActivityCard
