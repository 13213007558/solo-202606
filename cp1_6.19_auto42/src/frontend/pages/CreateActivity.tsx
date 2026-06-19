import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { activityApi } from '../utils/api'

const CreateActivity = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    description: '',
    creatorName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const newActivity = await activityApi.createActivity({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        deadline: new Date(formData.deadline).toISOString(),
        description: formData.description,
        creatorName: formData.creatorName || '匿名组织者'
      })
      navigate(`/activity/${newActivity.id}`)
    } catch (err) {
      setError('创建活动失败，请检查输入信息')
      console.error('Failed to create activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

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
        <div className="form-container">
          <h2>发起新的捐赠活动</h2>
          <p className="subtitle">填写活动信息，开启你的爱心之旅</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="activity-form">
            <div className="form-group">
              <label htmlFor="name">活动名称 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入活动名称"
                required
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="creatorName">组织名称</label>
              <input
                type="text"
                id="creatorName"
                name="creatorName"
                value={formData.creatorName}
                onChange={handleChange}
                placeholder="请输入组织或个人名称"
                maxLength={30}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetAmount">目标金额 (元) *</label>
                <input
                  type="number"
                  id="targetAmount"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="请输入目标金额"
                  required
                  min={1}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">截止日期 *</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  min={getMinDate()}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">活动介绍 *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="请详细描述活动目的、用途等信息..."
                required
                rows={5}
                maxLength={500}
              />
              <div className="char-count">
                {formData.description.length}/500
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={loading}
            >
              {loading ? '创建中...' : '发起捐赠活动'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default CreateActivity
