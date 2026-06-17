import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StarRating from './StarRating';
import type { StudentHighlight } from '../types';
import { TAGS } from '../types';

interface FeedbackFormProps {
  initialRating?: number;
  initialSummary?: string;
  initialHighlights?: StudentHighlight[];
  onSubmit: (data: {
    rating: number;
    summary: string;
    highlights: StudentHighlight[];
  }) => void;
  isSubmitting: boolean;
}

const MAX_SUMMARY_LENGTH = 500;

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  initialRating = 0,
  initialSummary = '',
  initialHighlights = [],
  onSubmit,
  isSubmitting,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [summary, setSummary] = useState(initialSummary);
  const [highlights, setHighlights] = useState<StudentHighlight[]>(initialHighlights);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRating(initialRating);
    setSummary(initialSummary);
    setHighlights(initialHighlights);
  }, [initialRating, initialSummary, initialHighlights]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_SUMMARY_LENGTH) {
      setSummary(value);
    }
  };

  const addHighlight = () => {
    const newHighlight: StudentHighlight = {
      id: uuidv4(),
      tag: TAGS[0],
      description: '',
    };
    setHighlights([...highlights, newHighlight]);
  };

  const removeHighlight = (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const updateHighlight = (
    id: string,
    field: keyof StudentHighlight,
    value: string
  ) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, summary, highlights });
  };

  const charCountClass =
    summary.length >= MAX_SUMMARY_LENGTH * 0.9 ? 'char-count--limit' : '';

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="form-section__title">整体评分</h3>
        <div className="rating-group">
          <StarRating rating={rating} onChange={setRating} />
          <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>
            {rating > 0 ? `${rating} 星` : '请选择评分'}
          </span>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section__title">课程总结</h3>
        <div className="textarea-wrapper">
          <textarea
            value={summary}
            onChange={handleSummaryChange}
            placeholder="请输入本节课的总结与反思..."
            maxLength={MAX_SUMMARY_LENGTH}
          />
          <div className={`char-count ${charCountClass}`}>
            {summary.length}/{MAX_SUMMARY_LENGTH}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section__title">学生表现亮点</h3>
        {highlights.length > 0 && (
          <div>
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className={`highlight-item ${
                  removingIds.has(highlight.id) ? 'highlight-item--removing' : ''
                }`}
              >
                <div className="highlight-item__tag">
                  <select
                    className="tag-selector"
                    value={highlight.tag}
                    onChange={(e) =>
                      updateHighlight(highlight.id, 'tag', e.target.value)
                    }
                  >
                    {TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="highlight-item__input">
                  <input
                    type="text"
                    value={highlight.description}
                    onChange={(e) =>
                      updateHighlight(highlight.id, 'description', e.target.value)
                    }
                    placeholder="请描述学生表现..."
                  />
                </div>
                <button
                  type="button"
                  className="highlight-item__delete"
                  onClick={() => removeHighlight(highlight.id)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="add-highlight-btn"
          onClick={addHighlight}
        >
          <span>+</span>
          <span>添加学生表现亮点</span>
        </button>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={isSubmitting || rating === 0 || !summary.trim()}
      >
        {isSubmitting ? '提交中...' : '提交反馈'}
      </button>
    </form>
  );
};

export default FeedbackForm;
