import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { Comment, CommentWithChildren } from '../types';
import { commentApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { emojiList } from '../emojiList';
import { wsClient } from '../websocket';

interface CommentSectionProps {
  recipeId: string;
}

const SectionContainer = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  padding: 24px;
  box-shadow: ${theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${theme.colors.text};
`;

const InputContainer = styled.div`
  margin-bottom: 24px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const InputArea = styled.div`
  flex: 1;
  position: relative;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  resize: vertical;
  transition: border-color ${theme.transitions.normal};
  background: #fff;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const InputActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const EmojiButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.sm};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background};
  }
`;

const EmojiPicker = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  z-index: 10;
  box-shadow: ${theme.shadows.md};
  max-height: 200px;
  overflow-y: auto;
`;

const EmojiItem = styled.button`
  font-size: 18px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background};
  }
`;

const SubmitButton = styled.button`
  padding: 8px 24px;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background ${theme.transitions.fast};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div<{ isNew?: boolean }>`
  display: flex;
  gap: 12px;
  animation: ${(props) => (props.isNew ? 'fadeIn 0.3s ease' : 'none')};
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CommentUsername = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text};
`;

const CommentTime = styled.span`
  font-size: 12px;
  color: ${theme.colors.textLight};
`;

const CommentText = styled.p`
  font-size: 14px;
  color: ${theme.colors.text};
  line-height: 1.6;
  margin-bottom: 8px;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: ${theme.colors.textLight};
  cursor: pointer;
  padding: 0;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const RepliesContainer = styled.div`
  margin-top: 12px;
  margin-left: 52px;
  padding-left: 12px;
  border-left: 2px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReplyInputWrapper = styled.div`
  margin-left: 52px;
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

const ReplyInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: 13px;
  transition: border-color ${theme.transitions.normal};

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const ReplyButton = styled.button`
  padding: 8px 16px;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 13px;
  cursor: pointer;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.textLight};
  font-size: 14px;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  margin-top: 16px;

  &:hover {
    background: ${theme.colors.background};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 24px;
  color: ${theme.colors.textLight};
`;

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
};

const buildCommentTree = (comments: Comment[]): CommentWithChildren[] => {
  const commentMap = new Map<string, CommentWithChildren>();
  const roots: CommentWithChildren[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    const commentWithChildren = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.children.push(commentWithChildren);
    } else {
      roots.push(commentWithChildren);
    }
  });

  return roots.sort((a, b) => a.createdAt - b.createdAt);
};

const CommentSection: React.FC<CommentSectionProps> = ({ recipeId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments(1);
  }, [recipeId]);

  useEffect(() => {
    const handleNewComment = (data: any) => {
      if (data.recipeId === recipeId && data.comment) {
        setComments((prev) => {
          if (prev.find((c) => c.id === data.comment.id)) {
            return prev;
          }
          const updated = [...prev, data.comment];
          return updated;
        });
        setNewCommentIds((prev) => new Set([...prev, data.comment.id]));
        setTimeout(() => {
          setNewCommentIds((prev) => {
            const next = new Set(prev);
            next.delete(data.comment.id);
            return next;
          });
        }, 1000);
      }
    };

    wsClient.on('new_comment', handleNewComment);
    return () => wsClient.off('new_comment', handleNewComment);
  }, [recipeId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadComments = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await commentApi.getByRecipeId(recipeId, pageNum);
      const { comments: newComments, hasMore: more } = response.data;

      if (pageNum === 1) {
        setComments(newComments);
      } else {
        setComments((prev) => [...prev, ...newComments]);
      }
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const response = await commentApi.create(recipeId, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, response.data]);
      setNewCommentIds((prev) => new Set([...prev, response.data.id]));
      setTimeout(() => {
        setNewCommentIds((prev) => {
          const next = new Set(prev);
          next.delete(response.data.id);
          return next;
        });
      }, 1000);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, replyToId: string, replyToUsername: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await commentApi.create(recipeId, {
        content: replyContent.trim(),
        parentId,
        replyToId,
        replyToUsername,
      });
      setComments((prev) => [...prev, response.data]);
      setNewCommentIds((prev) => new Set([...prev, response.data.id]));
      setTimeout(() => {
        setNewCommentIds((prev) => {
          const next = new Set(prev);
          next.delete(response.data.id);
          return next;
        });
      }, 1000);
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    if (replyingTo) {
      setReplyContent((prev) => prev + emoji);
    } else {
      setNewComment((prev) => prev + emoji);
    }
  };

  const commentTree = buildCommentTree(comments);

  const renderComment = (comment: CommentWithChildren, isReply: boolean = false) => (
    <CommentItem key={comment.id} isNew={newCommentIds.has(comment.id)}>
      <UserAvatar src={comment.userAvatar} alt={comment.username} />
      <CommentContent>
        <CommentHeader>
          <CommentUsername>{comment.username}</CommentUsername>
          {comment.replyToUsername && (
            <span style={{ color: theme.colors.textLight, fontSize: '13px' }}>
              回复 @{comment.replyToUsername}
            </span>
          )}
          <CommentTime>{formatTime(comment.createdAt)}</CommentTime>
        </CommentHeader>
        <CommentText>{comment.content}</CommentText>
        <CommentActions>
          {isAuthenticated && !isReply && (
            <ActionButton onClick={() => setReplyingTo(comment.id)}>回复</ActionButton>
          )}
        </CommentActions>

        {replyingTo === comment.id && (
          <ReplyInputWrapper>
            <ReplyInput
              type="text"
              placeholder={`回复 @${comment.username}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              autoFocus
            />
            <ReplyButton onClick={() => handleReply(comment.id, comment.userId, comment.username)}>
              发送
            </ReplyButton>
            <ActionButton onClick={() => setReplyingTo(null)}>取消</ActionButton>
          </ReplyInputWrapper>
        )}

        {comment.children.length > 0 && (
          <RepliesContainer>
            {comment.children.map((child) => renderComment(child, true))}
          </RepliesContainer>
        )}
      </CommentContent>
    </CommentItem>
  );

  return (
    <SectionContainer>
      <SectionTitle>评论区 ({comments.length})</SectionTitle>

      {isAuthenticated ? (
        <InputContainer>
          <InputWrapper>
            <UserAvatar src={user?.avatar} alt={user?.username} />
            <InputArea ref={emojiRef}>
              <Textarea
                placeholder="分享你的看法..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              {showEmojiPicker && (
                <EmojiPicker>
                  {emojiList.map((emoji, index) => (
                    <EmojiItem key={index} onClick={() => handleEmojiClick(emoji)}>
                      {emoji}
                    </EmojiItem>
                  ))}
                </EmojiPicker>
              )}
              <InputActions>
                <EmojiButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  😊
                </EmojiButton>
                <SubmitButton
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  发表评论
                </SubmitButton>
              </InputActions>
            </InputArea>
          </InputWrapper>
        </InputContainer>
      ) : (
        <LoginPrompt>请先登录后发表评论</LoginPrompt>
      )}

      <CommentsList>
        {commentTree.map((comment) => renderComment(comment))}
      </CommentsList>

      {hasMore && (
        <LoadMoreButton onClick={() => loadComments(page + 1)} disabled={loading}>
          {loading ? '加载中...' : '加载更多评论'}
        </LoadMoreButton>
      )}
    </SectionContainer>
  );
};

export default CommentSection;
