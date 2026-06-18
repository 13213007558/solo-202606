import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CreateActivity() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || !deadline || !description.trim()) {
      alert('请填写所有必填项');
      return;
    }
    const amount = Number(targetAmount);
    if (amount <= 0) {
      alert('目标金额必须大于0');
      return;
    }
    if (new Date(deadline) <= new Date()) {
      alert('截止日期必须晚于当前时间');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/activity', {
        name: name.trim(),
        targetAmount: amount,
        deadline: new Date(deadline).toISOString(),
        description: description.trim(),
        creatorName: creatorName.trim() || '匿名组织者',
      });
      navigate(`/activity/${res.data.id}`);
    } catch {
      alert('创建活动失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="create-page">
      <Link to="/list" className="back-link">← 返回活动广场</Link>
      <h1 className="page-title">🌟 发起捐赠活动</h1>
      <p className="page-subtitle">让更多人看到你的爱心行动</p>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">活动名称 *</label>
          <input
            type="text"
            className="form-input"
            placeholder="例如：山区儿童温暖冬衣计划"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label className="form-label">组织者名称</label>
          <input
            type="text"
            className="form-input"
            placeholder="您的组织或团队名称（选填）"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="form-group">
          <label className="form-label">目标金额（元）*</label>
          <input
            type="number"
            className="form-input"
            placeholder="例如：50000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            min="1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">截止日期 *</label>
          <input
            type="datetime-local"
            className="form-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={getMinDateTime()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">活动介绍 *</label>
          <textarea
            className="form-textarea"
            placeholder="请详细描述您的活动背景、目的和资金用途..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/list" className="btn btn-secondary" style={{ flex: 1 }}>
            取消
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={submitting}
          >
            {submitting ? '创建中...' : '创建活动'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateActivity;
