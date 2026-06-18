import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/commentList.css';

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

interface CommentListProps {
  comments: Comment[];
  workId: string;
  onCommentAdded?: () => void;
}

const CommentList = ({ comments, workId, onCommentAdded }: CommentListProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      await axios.post(`/api/works/${workId}/comments`, {
        userId: user.id,
        username: user.username,
        content: newComment.trim(),
      });
      setNewComment('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      await axios.post(`/api/works/${workId}/comments`, {
        userId: user.id,
        username: user.username,
        content: replyContent.trim(),
        parentId,
      });
      setReplyContent('');
      setReplyTo(null);
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`comment ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <div className="avatar avatar-sm">{comment.username.charAt(0).toUpperCase()}</div>
        <div className="comment-info">
          <span className="comment-author">{comment.username}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
      </div>
      <div className="comment-content">{comment.content}</div>
      {!isReply && user && (
        <button 
          className="reply-btn"
          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
        >
          回复
        </button>
      )}
      {replyTo === comment.id && (
        <div className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="写下你的回复..."
            rows={2}
          />
          <div className="reply-form-actions">
            <button 
              className="btn btn-ghost"
              onClick={() => setReplyTo(null)}
            >
              取消
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? '发送中...' : '回复'}
            </button>
          </div>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="comment-list">
      <h3 className="comment-section-title">评论 ({comments.length})</h3>
      
      {user ? (
        <div className="comment-input">
          <div className="avatar avatar-sm">{user.username.charAt(0).toUpperCase()}</div>
          <div className="input-wrapper">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="分享你的想法..."
              rows={3}
            />
            <div className="input-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? '发送中...' : '发表评论'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <p>登录后可以发表评论</p>
        </div>
      )}

      <div className="comments-container">
        {comments.length === 0 ? (
          <div className="empty-comments">
            <p>暂无评论，来发表第一条评论吧</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentList;
