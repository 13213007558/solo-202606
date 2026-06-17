import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { theme } from '../theme';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const Card = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: scale(1.02);
    background: ${theme.colors.background};
  }
`;

const CoverImage = styled.div<{ imageUrl: string }>`
  width: 100%;
  height: 180px;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const TimeBadge = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: ${theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Content = styled.div`
  padding: 16px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorName = styled.span`
  font-size: 13px;
  color: ${theme.colors.textLight};
`;

const LikesInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${theme.colors.textLight};
`;

const HeartIcon = styled.span<{ liked?: boolean }>`
  color: ${(props) => (props.liked ? theme.colors.primary : theme.colors.textLight)};
`;

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <Card onClick={handleClick}>
      <CoverImage imageUrl={recipe.coverUrl}>
        <TimeBadge>
          <span>⏱️</span>
          <span>{recipe.totalTime}分钟</span>
        </TimeBadge>
      </CoverImage>
      <Content>
        <Title>{recipe.title}</Title>
        <Footer>
          <AuthorInfo>
            <Avatar src={recipe.authorAvatar} alt={recipe.authorName} />
            <AuthorName>{recipe.authorName}</AuthorName>
          </AuthorInfo>
          <LikesInfo>
            <HeartIcon>❤️</HeartIcon>
            <span>{recipe.likes}</span>
          </LikesInfo>
        </Footer>
      </Content>
    </Card>
  );
};

export default RecipeCard;
