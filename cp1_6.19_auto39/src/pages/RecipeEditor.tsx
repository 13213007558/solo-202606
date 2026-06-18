import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Recipe, Ingredient, Step } from '../types';

interface RecipeEditorProps {
  user: { id: string; username: string } | null;
}

function RecipeEditor({ user }: RecipeEditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '' },
  ]);
  const [steps, setSteps] = useState<Step[]>([{ order: 1, description: '' }]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit && id && user) {
      loadRecipe();
    }
  }, [id, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      const recipe: Recipe = response.data;
      if (recipe.userId !== user?.id) {
        navigate('/');
        return;
      }
      setTitle(recipe.title);
      setDescription(recipe.description);
      setIngredients(recipe.ingredients);
      setSteps(recipe.steps);
      setImageUrl(recipe.imageUrl);
    } catch (error) {
      console.error('加载菜谱失败:', error);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  }
  const updateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, description: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      order: i + 1,
    }));
    setSteps(newSteps);
  };

  const updateStep = (index: number, description: string) => {
    const newSteps = [...steps];
    newSteps[index].description = description;
    setSteps(newSteps);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSteps = [...steps];
    const [draggedItem] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedItem);

    const reindexed = newSteps.map((step, i) => ({ ...step, order: index + 1 }));
    setSteps(reindexed);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !imageUrl.trim()) {
      alert('请填写完整信息');
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim() && i.amount.trim());
    if (validIngredients.length === 0) {
      alert('请至少添加一种食材');
      return;
    }

    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length === 0) {
      alert('请至少添加一个步骤');
      return;
    }

    setLoading(true);

    const recipeData = {
      userId: user?.id,
      title,
      description,
      ingredients: validIngredients,
      steps: validSteps.map((s, i) => ({ ...s, order: i + 1 })),
      imageUrl,
    };

    try {
      if (isEdit) {
        await axios.put(`/api/recipes/${id}`, recipeData);
      } else {
        await axios.post('/api/recipes', recipeData);
      }
      navigate(`/profile/${user?.id}`);
    } catch (error) {
      console.error('保存菜谱失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="form-container" style={{ maxWidth: '700px' }}>
      <h2 className="form-title">{isEdit ? '编辑菜谱' : '添加新菜谱'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">菜名 *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例如：番茄炒蛋"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">简介 *</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="简单介绍一下这道菜..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">成品图URL *</label>
          <input
            type="url"
            className="form-input"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="预览"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginTop: '10px',
              }}
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">食材清单 *</label>
          {ingredients.map((ing, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                className="form-input"
                placeholder="食材名称"
                value={ing.name}
                onChange={e => updateIngredient(index, 'name', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="用量"
                value={ing.amount}
                onChange={e => updateIngredient(index, 'amount', e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="ingredient-delete-btn"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length <= 1}
                title="删除"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="ingredient-add-btn"
            onClick={addIngredient}
          >
            + 添加食材
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">
            制作步骤 * <span style={{ fontSize: '0.85rem', color: '#999', fontWeight: 'normal' }}>（拖拽可排序）</span>
          </label>
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-row"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: draggedIndex === index ? 0.5 : 1,
              }}
            >
              <div className="step-number">{index + 1}</div>
              <textarea
                className="form-textarea"
                value={step.description}
                onChange={e => updateStep(index, e.target.value)}
                placeholder="描述这个步骤..."
              />
              <button
                type="button"
                className="step-delete-btn"
                onClick={() => removeStep(index)}
                disabled={steps.length <= 1}
                title="删除"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="step-add-btn"
            onClick={addStep}
          >
            + 添加步骤
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          style={{ marginTop: '20px' }}
        >
          {loading ? '保存中...' : isEdit ? '保存修改' : '发布菜谱'}
        </button>
      </form>
    </div>
  );
}

export default RecipeEditor;
