import { useState, useEffect, useCallback, useRef } from 'react'
import { Donation, ViewMode } from '../types'
import { donationApi } from '../utils/api'
import { onNewDonation, offNewDonation, initSocket } from '../utils/socket'
import DonationCard from './DonationCard'

interface DonationWallProps {
  activityId: string
}

const DonationWall = ({ activityId }: DonationWallProps) => {
  const [donations, setDonations] = useState<Donation[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNewDonation = useCallback((donation: Donation) => {
    if (donation.activityId === activityId) {
      setDonations(prev => [{ ...donation, isNew: true }, ...prev])
    }
  }, [activityId])

  useEffect(() => {
    initSocket()
  }, [])

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await donationApi.getDonations(activityId)
        setDonations(data)
      } catch (error) {
        console.error('Failed to fetch donations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDonations()
  }, [activityId])

  useEffect(() => {
    onNewDonation(handleNewDonation)
    return () => {
      offNewDonation(handleNewDonation)
    }
  }, [handleNewDonation])

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'masonry' : 'grid')
  }

  if (loading) {
    return <div className="loading">加载捐赠记录中...</div>
  }

  return (
    <div className="donation-wall-container" ref={containerRef}>
      <div className="wall-header">
        <h3 className="wall-title">
          爱心捐赠墙
          <span className="donation-count">({donations.length} 条记录)</span>
        </h3>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={toggleViewMode}
            title="网格视图"
          >
            网格
          </button>
          <button
            className={`toggle-btn ${viewMode === 'masonry' ? 'active' : ''}`}
            onClick={toggleViewMode}
            title="瀑布流视图"
          >
            瀑布流
          </button>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">💝</p>
          <p>还没有捐赠记录，成为第一个献爱心的人吧！</p>
        </div>
      ) : (
        <div className={`donation-wall ${viewMode}`}>
          {donations.map((donation, index) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              viewMode={viewMode}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DonationWall
