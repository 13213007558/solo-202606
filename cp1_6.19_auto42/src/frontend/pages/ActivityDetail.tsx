import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Activity, ActivityStats, Donation } from '../types'
import { activityApi } from '../utils/api'
import { initSocket, joinActivity, leaveActivity, onNewDonation, onStatsUpdate, offNewDonation, offStatsUpdate } from '../utils/socket'
import { formatCurrency, getProgressColor } from '../utils/helpers'
import DonationWall from '../components/DonationWall'
import DonatePanel from '../components/DonatePanel'
import NumberCounter from '../components/NumberCounter'

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [stats, setStats] = useState<{ donorCount: number; totalAmount: number }>({ donorCount: 0, totalAmount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initSocket()
  }, [])

  useEffect(() => {
    if (!id) return

    const fetchActivity = async () => {
      try {
        const data = await activityApi.getActivity(id)
        setActivity(data)
        setStats({
          donorCount: data.donorCount,
          totalAmount: data.currentAmount
        })
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [id])

  const handleStatsUpdate = useCallback((newStats: ActivityStats) => {
    if (newStats.activityId === id) {
      setStats({
        donorCount: newStats.donorCount,
        totalAmount: newStats.totalAmount
      })
      setActivity(prev => prev ? { ...prev, currentAmount: newStats.totalAmount, donorCount: newStats.donorCount } : null)
    }
  }, [id])

  useEffect(() => {
    if (!id) return

    joinActivity(id)
    onStatsUpdate(handleStatsUpdate)

    return () => {
      leaveActivity(id)
      offStatsUpdate(handleStatsUpdate)
    }
  }, [id, handleStatsUpdate])

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  if (!activity) {
    return <div className="error">活动不存在</div>
  }

  const progress = Math.min(100, (stats.totalAmount / activity.targetAmount) * 100)
  const achievementRate = Math.round(progress * 10) / 10

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <Link to="/list" className="back-link">
            ← 返回活动广场
          </Link>
          <h1 className="logo">🎁 虚拟捐赠墙</h1>
          <div style={{ width: '120px' }}></div>
        </div>
      </header>

      <main className="main-content">
        <div className="activity-header">
          <h2>{activity.name}</h2>
          <p className="activity-creator">由 {activity.creatorName} 发起</p>
          <p className="activity-description">{activity.description}</p>
        </div>

        <div className="stats-panel">
          <div className="stat-card">
            <span className="stat-label">捐赠人数</span>
            <NumberCounter value={stats.donorCount} suffix="人" />
          </div>
          <div className="stat-card">
            <span className="stat-label">已筹金额</span>
            <NumberCounter value={stats.totalAmount} prefix="¥" decimals={0} />
          </div>
          <div className="stat-card">
            <span className="stat-label">达成率</span>
            <NumberCounter value={achievementRate} suffix="%" decimals={1} />
          </div>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, #FF6B6B 0%, ${getProgressColor(progress / 100)} 100%)`
            }}
          />
          <div className="progress-info">
            <span>{formatCurrency(stats.totalAmount)} / {formatCurrency(activity.targetAmount)}</span>
            <span>{achievementRate}%</span>
          </div>
        </div>

        <DonatePanel activityId={activity.id} />

        <DonationWall activityId={activity.id} />
      </main>
    </div>
  )
}

export default ActivityDetail
