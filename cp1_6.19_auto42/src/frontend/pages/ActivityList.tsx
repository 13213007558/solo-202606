import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity } from '../types'
import { activityApi } from '../utils/api'
import ActivityCard from '../components/ActivityCard'

const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityApi.getActivities()
        setActivities(data)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🎁 虚拟捐赠墙</h1>
          <Link to="/create" className="btn-primary">
            + 发起捐赠活动
          </Link>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h2>活动广场</h2>
          <p className="subtitle">选择一个活动，献出你的爱心</p>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="activity-grid">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ActivityList
