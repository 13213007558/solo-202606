import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { recipeApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Ingredient, RecipeStep } from '../types';
import { v4 as uuidv4 } from 'uuid';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 24px;
`;

const FormCard = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  padding: 32px;
  box-shadow: ${theme.shadows.sm};
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  transition: border-color ${theme.transitions.normal};

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  resize: vertical;
  transition: border-color ${theme.transitions.normal};

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const IngredientRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
`;

const IngredientInput = styled(Input)`
  flex: 1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${(props) => {
    switch (props.variant) {
      case 'secondary':
        return theme.colors.background;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: ${(props) => (props.variant === 'secondary' ? theme.colors.primary : '#fff')};
  border: ${(props) =>
    props.variant === 'secondary' ? `1px solid ${theme.colors.primary}` : 'none'};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SmallButton = styled(Button)`
  padding: 8px 16px;
  font-size: 13px;
`;

const StepItem = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  padding: 20px;
  margin-bottom: 16px;
  cursor: move;
  transition: all ${theme.transitions.fast};
  border: 2px dashed transparent;

  &:hover {
    border-color: ${theme.colors.primary}40;
    background: ${theme.colors.primary}10;
  }

  &.dragging {
    opacity: 0.5;
    border-color: ${theme.colors.primary};
  }
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StepNumber = styled.span`
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const DragHandle = styled.span`
  cursor: grab;
  color: ${theme.colors.textLight};
  font-size: 20px;

  &:active {
    cursor: grabbing;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${theme.colors.border};
`;

const ErrorText = styled.p`
  color: ${theme.colors.error};
  font-size: 13px;
  margin-top: 8px;
`;

const SuccessText = styled.p`
  color: ${theme.colors.success};
  font-size: 13px;
  margin-top: 8px;
`;

const ImagePreview = styled.div`
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: ${theme.borderRadius.sm};
  margin-top: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CreateRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalTime, setTotalTime] = useState('30');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '' },
  ]);
  const [steps, setSteps] = useState<RecipeStep[]>([
    { id: uuidv4(), title: '', description: '', imageUrl: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, { id: uuidv4(), title: '', description: '', imageUrl: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (
    index: number,
    field: 'title' | 'description' | 'imageUrl',
    value: string
  ) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...steps];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setSteps(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入食谱名称');
      return;
    }

    if (!coverUrl.trim()) {
      setError('请输入封面图URL');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim() && i.amount.trim());
    if (validIngredients.length === 0) {
      setError('请至少添加一个食材');
      return;
    }

    const validSteps = steps.filter((s) => s.title.trim() && s.description.trim());
    if (validSteps.length === 0) {
      setError('请至少添加一个步骤');
      return;
    }

    try {
      setSubmitting(true);
      const response = await recipeApi.create({
        title: title.trim(),
        coverUrl: coverUrl.trim(),
        ingredients: validIngredients,
        steps: validSteps.map(({ id, ...rest }) => rest),
        totalTime: parseInt(totalTime) || 30,
      });
      navigate(`/recipe/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || '创建食谱失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>✨ 发布新食谱</PageTitle>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>食谱名称 *</Label>
            <Input
              type="text"
              placeholder="例如：家常红烧肉"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>封面图URL *</Label>
            <Input
              type="url"
              placeholder="https://example.com/cover.jpg"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
            {coverUrl && (
              <ImagePreview>
                <img src={coverUrl} alt="封面预览" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </ImagePreview>
            )}
          </FormGroup>

          <FormGroup>
            <Label>预计耗时（分钟）*</Label>
            <Input
              type="number"
              min="1"
              value={totalTime}
              onChange={(e) => setTotalTime(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>🥗 食材清单 *</Label>
            {ingredients.map((ingredient, index) => (
              <IngredientRow key={index}>
                <IngredientInput
                  type="text"
                  placeholder="食材名称"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                />
                <IngredientInput
                  type="text"
                  placeholder="用量"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                />
                <SmallButton
                  type="button"
                  variant="danger"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length <= 1}
                >
                  删除
                </SmallButton>
              </IngredientRow>
            ))}
            <SmallButton type="button" variant="secondary" onClick={handleAddIngredient}>
              + 添加食材
            </SmallButton>
          </FormGroup>

          <FormGroup>
            <Label>👨‍🍳 烹饪步骤 *（可拖拽排序）</Label>
            {steps.map((step, index) => (
              <StepItem
                key={step.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={draggedIndex === index ? 'dragging' : ''}
              >
                <StepHeader>
                  <StepNumber>步骤 {index + 1}</StepNumber>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <DragHandle>⋮⋮</DragHandle>
                    <SmallButton
                      type="button"
                      variant="danger"
                      onClick={() => handleRemoveStep(index)}
                      disabled={steps.length <= 1}
                    >
                      删除
                    </SmallButton>
                  </div>
                </StepHeader>
                <FormGroup style={{ marginBottom: '12px' }}>
                  <Input
                    type="text"
                    placeholder="步骤标题"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  />
                </FormGroup>
                <FormGroup style={{ marginBottom: '12px' }}>
                  <Textarea
                    placeholder="步骤描述"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  />
                </FormGroup>
                <FormGroup style={{ marginBottom: 0 }}>
                  <Input
                    type="url"
                    placeholder="过程图URL（可选）"
                    value={step.imageUrl}
                    onChange={(e) => handleStepChange(index, 'imageUrl', e.target.value)}
                  />
                  {step.imageUrl && (
                    <ImagePreview>
                      <img
                        src={step.imageUrl}
                        alt="步骤预览"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </ImagePreview>
                  )}
                </FormGroup>
              </StepItem>
            ))}
            <SmallButton type="button" variant="secondary" onClick={handleAddStep}>
              + 添加步骤
            </SmallButton>
          </FormGroup>

          {error && <ErrorText>{error}</ErrorText>}

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '发布中...' : '发布食谱'}
            </Button>
          </FormActions>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CreateRecipePage;
