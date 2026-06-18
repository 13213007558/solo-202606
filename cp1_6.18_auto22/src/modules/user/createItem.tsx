import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const CreateItem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [images, setImages] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const imageUrls = useMemo(() => {
    return images.split('\n').map(u => u.trim()).filter(Boolean);
  }, [images]);

  const validate = (): string | null => {
    if (!name.trim()) return '请填写拍卖品名称';
    if (!description.trim()) return '请填写拍卖品描述';
    if (!startPrice || Number(startPrice) <= 0) return '请填写有效的起拍价';
    if (!endTime) return '请选择截止时间';
    if (new Date(endTime).getTime() <= Date.now()) return '截止时间必须晚于当前时间';
    if (imageUrls.length === 0) return '请填写至少一个图片URL';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/items', {
        name: name.trim(),
        description: description.trim(),
        startPrice: Number(startPrice),
        endTime: new Date(endTime).getTime(),
        images: imageUrls,
        status: 'pending',
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
        请先登录后再创建拍卖品
      </div>
    );
  }

  const inputStyle = {
    width: '100%' as const,
    padding: '10px 12px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--bg-tertiary)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    fontSize: 15,
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: 'var(--bg-secondary)', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>创建拍卖品</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>名称 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="拍卖品名称" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>描述 *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="拍卖品描述" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>起拍价 (元) *</label>
          <input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>截止时间 *</label>
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>图片URL（每行一个）*</label>
          <textarea value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        {imageUrls.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>图片预览</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {imageUrls.map((url, i) => (
                <img key={i} src={url} alt={`预览 ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--bg-tertiary)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(245,101,101,0.15)', border: '1px solid var(--error)', borderRadius: 6, color: 'var(--error)', fontSize: 14 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 0', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 8, background: loading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))', color: loading ? 'var(--text-muted)' : 'var(--bg-primary)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading && <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid var(--blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
          {loading ? '提交中...' : '提交审核'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
        提交后将进入审核状态，审核通过后方可上架拍卖
      </p>
    </div>
  );
};

export default CreateItem;
