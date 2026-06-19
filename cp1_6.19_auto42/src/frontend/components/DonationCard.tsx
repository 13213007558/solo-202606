import { useEffect, useState } from 'react'
import { Donation, ViewMode } from '../types'
import { formatCurrency, getDonationCardColor, truncateText, formatDate } from '../utils/helpers'

interface DonationCardProps {
  donation: Donation
  viewMode: ViewMode
  index: number
}

const DonationCard = ({ donation, viewMode, index }: DonationCardProps) => {
  const [show, setShow] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    if (donation.isNew) {
      const timer = setTimeout(() => {
        setShow(true)
      }, index * 50)
      return () => clearTimeout(timer)
    } else {
      setShow(true)
    }
  }, [donation.isNew, index])

  useEffect(() => {
    if (show && donation.isNew) {
      const timer = setTimeout(() => {
        setIsAnimated(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [show, donation.isNew])

  const cardStyle: React.CSSProperties = {
    backgroundColor: getDonationCardColor(donation.amount),
    transform: show ? 'translateX(0) rotate(0deg) scale(1)' : 'translateX(100px) rotate(-10deg) scale(0.8)',
    opacity: show ? 1 : 0,
    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: 'transform, opacity'
  }

  const displayMessage = viewMode === 'grid'
    ? truncateText(donation.message, 30)
    : donation.message

  return (
    <div
      className={`donation-card ${viewMode} ${isAnimated ? 'animation-done' : ''}`}
      style={cardStyle}
    >
      <div className="donation-card-header">
        <img
          src={donation.userAvatar}
          alt={donation.userName}
          className="donation-avatar"
          loading="lazy"
        />
        <div className="donation-user-info">
          <span className="donation-user-name">{donation.userName}</span>
          <span className="donation-time">{formatDate(donation.createdAt)}</span>
        </div>
        <span className="donation-amount">{formatCurrency(donation.amount)}</span>
      </div>
      <p className={`donation-message ${viewMode}`}>
        {displayMessage}
      </p>
    </div>
  )
}

export default DonationCard
