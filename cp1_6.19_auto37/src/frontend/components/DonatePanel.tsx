import { useState } from 'react';
import axios from 'axios';
import type { Donation, ActivityStats } from '../types';

interface Props {
  activityId: string;
  onDonationSuccess: (donation: Donation, stats: ActivityStats) => void;
}

const PRESET_AMOUNTS = [10, 50, 100];

function DonatePanel({ activityId, onDonationSuccess }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const handleDonate = () => {
    if (!effectiveAmount || effectiveAmount <= 0) {
      alert('请选择或输入捐赠金额');
      return;
    }
    if (!userName.trim()) {
      alert('请输入您的昵称');
      return;
    }
    setShowMessageModal(true);
  };

  const handleSubmitMessage = async () => {
    if (message.length > 140) {
      alert('祝福语不能超过140字');
      return;
    }
    setIsSubmitting(true);
    try {
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
      const response = await axios.post(`/api/activity/${activityId}/donate`, {
        userName: userName.trim(),
        avatar,
        amount: effectiveAmount,
        message: message.trim(),
      });
      const { donation, stats } = response.data;
      onDonationSuccess(donation, stats);
      setShowMessageModal(false);
      setMessage('');
      setUserName('');
      setSelectedAmount(10);
      setCustomAmount('');
    } catch (err) {
      alert('捐赠失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="donation-section">
      <h3 className="section-title">💝 立即捐赠</h3>
      <div className="preset-amounts">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            className={`amount-btn ${selectedAmount === amount ? 'active' : ''}`}
            onClick={() => handleAmountClick(amount)}
          >
            ¥{amount}
          </button>
        ))}
      </div>
      <div className="custom-amount">
        <input
          type="text"
          className="custom-amount-input"
          placeholder="自定义金额（元）"
          value={customAmount}
          onChange={handleCustomAmountChange}
        />
      </div>
      <div className="donor-info">
        <label className="form-label">您的昵称</label>
        <input
          type="text"
          className="form-input"
          placeholder="请输入昵称"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          maxLength={20}
        />
      </div>
      <button className="btn btn-primary btn-block" onClick={handleDonate}>
        确认捐赠 {effectiveAmount > 0 ? `¥${effectiveAmount}` : ''}
      </button>

      {showMessageModal && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowMessageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">感谢您的爱心 💖</h3>
            <p className="modal-subtitle">
              写一句祝福语吧，它将出现在捐赠墙上温暖更多人
            </p>
            <textarea
              className="message-textarea"
              placeholder="请输入您的祝福语..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 140))}
              autoFocus
            />
            <div className={`char-counter ${message.length > 120 ? 'warning' : ''}`}>
              {message.length}/140
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowMessageModal(false)}
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitMessage}
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '提交'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonatePanel;
