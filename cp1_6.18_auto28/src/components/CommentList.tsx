import { useState } from 'react';
import axios from 'axios';
import type { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CommentListProps {
  comments: Comment[];
  workId: string;
  onCommentAdded?: (comment: Comment) => void;
}

export default function CommentList({ comments, workId, onCommentAdded }: CommentListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  const topLevelComments = localComments.filter((c) => c.parentId === null);
  const getReplies = (parentId: string) =>
    localComments.filter((c) => c.parentId === parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/works/${workId}/comments`, {
        userId: user.id,
        username: user.username,
        content: newComment.trim(),
      });
      setLocalComments([response.data, ...localComments]);
      setNewComment('');
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post(`/api/works/${workId}/comments`, {
        userId: user.id,
        username: user.username,
        content: replyContent.trim(),
        parentId,
      });
      setLocalComments([...localComments, response.data]);
      setReplyTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('回复失败:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      '#7c3aed',
      '#ea580c',
      '#16a34a',
      '#2563eb',
      '#db2777',
      '#0891b2',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="comments-section">
      <h3 className="section-title">评论 ({localComments.length})</h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-group">
          {user && (
            <div
              className="comment-avatar"
              style={{ background: getAvatarColor(user.username) }}
            >
              {user.username.charAt(0)}
            </div>
          )}
          <textarea
            className="comment-input"
            placeholder={user ? '写下你的评论...' : '登录后发表评论'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            readOnly={!user}
          />
          <button type="submit" className="btn btn-primary" disabled={!user}>
            发布
          </button>
        </div>
      </form>

      <div className="comment-list">
        {topLevelComments.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
            暂无评论，快来抢沙发吧~
          </p>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div
                className="comment-avatar"
                style={{ background: getAvatarColor(comment.username) }}
              >
                {comment.username.charAt(0)}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.username}</span>
                  <span className="comment-time">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
                <div className="comment-actions">
                  <button
                    className="comment-action-btn"
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      setReplyTo(replyTo === comment.id ? null : comment.id);
                      setReplyContent('');
                    }}
                  >
                    回复
                  </button>
                </div>

                {replyTo === comment.id && (
                  <div className="reply-form">
                    <div className="comment-input-group">
                      <textarea
                        className="comment-input"
                        placeholder={`回复 ${comment.username}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleReply(comment.id)}
                        >
                          发送
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setReplyTo(null)}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {getReplies(comment.id).length > 0 && (
                  <div className="comment-replies">
                    {getReplies(comment.id).map((reply) => (
                      <div key={reply.id} className="comment-item">
                        <div
                          className="comment-avatar"
                          style={{
                            background: getAvatarColor(reply.username),
                            width: '32px',
                            height: '32px',
                            fontSize: '0.8rem',
                          }}
                        >
                          {reply.username.charAt(0)}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author" style={{ fontSize: '0.85rem' }}>
                              {reply.username}
                            </span>
                            <span className="comment-time">{formatTime(reply.createdAt)}</span>
                          </div>
                          <p className="comment-text" style={{ fontSize: '0.9rem' }}>
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
