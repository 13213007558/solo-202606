import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, FileText, Tag, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { createActivity } from '@/api/events';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/helpers';

const CreateActivityPage = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    description: '',
    maxParticipants: 20,
    type: 'cleanup' as 'cleanup' | 'planting' | 'education' | 'other',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.location || !formData.date || !formData.time || !formData.description) {
      setError('请填写所有必填项');
      return;
    }
    
    if (!user) {
      setError('请先登录');
      return;
    }
    
    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    
    try {
      setLoading(true);
      const event = await createActivity({
        name: formData.name,
        location: formData.location,
        dateTime,
        description: formData.description,
        maxParticipants: Number(formData.maxParticipants),
        type: formData.type,
        creatorId: user.id,
      });
      navigate(`/events/${event.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '创建失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  const typeOptions = [
    { value: 'cleanup', label: '清洁活动' },
    { value: 'planting', label: '植树活动' },
    { value: 'education', label: '宣传教育' },
    { value: 'other', label: '其他活动' },
  ];
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-forest-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-forest-600 to-forest-500 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold font-serif">发布新活动</h1>
          <p className="text-forest-100 text-sm mt-1">
            让更多志愿者加入你的环保行动
          </p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-forest-500" />
                活动名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例如：城市公园植树活动"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-500" />
                活动地点 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="例如：朝阳公园北门"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest-500" />
                  活动日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-forest-500" />
                  活动时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-forest-500" />
                招募人数上限
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={1}
                max={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-forest-500" />
                活动类型
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all bg-white"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-forest-500" />
                活动描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="请详细描述活动内容、注意事项、所需装备等..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex-1 py-3 text-white font-medium rounded-xl transition-all',
                  loading
                    ? 'bg-gray-400 cursor-wait'
                    : 'bg-forest-500 hover:bg-forest-600 shadow-md hover:shadow-lg'
                )}
              >
                {loading ? '发布中...' : '发布活动'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityPage;
