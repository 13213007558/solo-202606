import { useState } from 'react'
import { donationApi } from '../utils/api'
import MessageModal from './MessageModal'

interface DonatePanelProps {
  activityId: string
}

const presetAmounts = [10, 50, 100]

const DonatePanel = ({ activityId }: DonatePanelProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [donationAmount, setDonationAmount] = useState(0)
  const [donorName, setDonorName] = useState('')

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setCustomAmount(value)
      setSelectedAmount(null)
    }
  }

  const handleDonateClick = () => {
    const amount = selectedAmount || parseInt(customAmount) || 0
    if (amount <= 0) return

    setDonationAmount(amount)
    setShowModal(true)
  }

  const handleSubmitMessage = async (message: string) => {
    const randomColor = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
    const name = donorName.trim() || '爱心人士'

    try {
      await donationApi.donate(activityId, {
        userName: name,
        userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor.replace('#', '')}&color=fff&size=128`,
        amount: donationAmount,
        message
      })

      setShowModal(false)
      setSelectedAmount(null)
      setCustomAmount('')
      setDonorName('')
    } catch (error) {
      console.error('Donation failed:', error)
      alert('捐赠失败，请稍后重试')
    }
  }

  const finalAmount = selectedAmount || parseInt(customAmount) || 0

  return (
    <div className="donate-panel">
      <h3 className="panel-title">献出您的爱心</h3>

      <div className="donor-name-input">
        <label htmlFor="donorName">您的昵称</label>
        <input
          type="text"
          id="donorName"
          value={donorName}
          onChange={e => setDonorName(e.target.value)}
          placeholder="请输入您的昵称（选填）"
          maxLength={20}
        />
      </div>

      <div className="amount-selector">
        <label>选择金额</label>
        <div className="preset-buttons">
          {presetAmounts.map(amount => (
            <button
              key={amount}
              className={`preset-btn ${selectedAmount === amount ? 'active' : ''}`}
              onClick={() => handlePresetClick(amount)}
            >
              ¥{amount}
            </button>
          ))}
          <div className={`custom-amount-wrapper ${customAmount ? 'active' : ''}`}>
            <span className="currency-symbol">¥</span>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="自定义"
              className="custom-amount-input"
            />
          </div>
        </div>
      </div>

      <button
        className="btn-primary btn-large donate-btn"
        onClick={handleDonateClick}
        disabled={finalAmount <= 0}
      >
        {finalAmount > 0 ? `立即捐赠 ¥${finalAmount}` : '请选择捐赠金额'}
      </button>

      <MessageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitMessage}
        amount={donationAmount}
      />
    </div>
  )
}

export default DonatePanel
