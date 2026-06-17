import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { Recipe } from '../types';
import { recipeApi } from '../api';
import RecipeCard from '../RecipeModule/RecipeCard';

const PageHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.textLight};
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  font-size: 16px;
  color: ${theme.colors.textLight};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
  color: ${theme.colors.textLight};
`;

const HomePage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeApi.getAll();
      setRecipes(response.data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader>
        <PageTitle>🍳 食谱广场</PageTitle>
        <PageSubtitle>发现美食，分享快乐</PageSubtitle>
      </PageHeader>

      {loading ? (
        <LoadingContainer>加载中...</LoadingContainer>
      ) : recipes.length === 0 ? (
        <EmptyState>暂无食谱，快来发布第一个吧！</EmptyState>
      ) : (
        <RecipeGrid>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </RecipeGrid>
      )}
    </div>
  );
};

export default HomePage;
