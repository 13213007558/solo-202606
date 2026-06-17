import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { theme } from '../theme';
import { Recipe } from '../types';
import { recipeApi } from '../api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../CommentModule/CommentSection';

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 24px;
  position: relative;

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  background: ${theme.colors.card};
  box-shadow: ${theme.shadows.md};

  @media (max-width: ${theme.breakpoints.mobile}) {
    height: 250px;
  }
`;

const CarouselImage = styled.div<{ imageUrl: string; active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
  opacity: ${(props) => (props.active ? 1 : 0)};
  transition: opacity ${theme.transitions.slow};
`;

const CarouselDots = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
`;

const CarouselDot = styled.button<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${(props) => (props.active ? '#fff' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: #fff;
  }
`;

const RecipeInfo = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  padding: 24px;
  box-shadow: ${theme.shadows.sm};
`;

const RecipeTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 16px;
`;

const RecipeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${theme.colors.textLight};
`;

const LikeButton = styled.button<{ liked: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${(props) => (props.liked ? theme.colors.primary : theme.colors.background)};
  color: ${(props) => (props.liked ? '#fff' : theme.colors.primary)};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: ${theme.colors.star};
`;

const Section = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  padding: 24px;
  box-shadow: ${theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 16px;
`;

const IngredientsList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const IngredientItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primary}15;
  }
`;

const IngredientName = styled.span`
  color: ${theme.colors.text};
  font-weight: 500;
`;

const IngredientAmount = styled.span`
  color: ${theme.colors.textLight};
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const StepItem = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  scroll-margin-top: 80px;

  &:hover {
    background: ${theme.colors.primary}10;
    transform: scale(1.01);
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: ${theme.colors.primary};
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const StepDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.text};
  line-height: 1.8;
  margin-bottom: 12px;
`;

const StepImage = styled.img`
  width: 100%;
  max-width: 300px;
  border-radius: ${theme.borderRadius.sm};
  object-fit: cover;
  margin-top: 12px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    max-width: 100%;
  }
`;

const Sidebar = styled.div`
  position: sticky;
  top: 88px;
  align-self: flex-start;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  padding: 20px;
  box-shadow: ${theme.shadows.sm};

  @media (max-width: ${theme.breakpoints.mobile}) {
    position: fixed;
    right: 16px;
    bottom: 16px;
    top: auto;
    padding: 0;
    background: transparent;
    box-shadow: none;
    z-index: 50;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 16px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: none;
  }
`;

const TocList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: none;
  }
`;

const TocItem = styled.li<{ active: boolean }>`
  a {
    display: block;
    padding: 8px 12px;
    font-size: 13px;
    color: ${(props) => (props.active ? theme.colors.primary : theme.colors.textLight)};
    background: ${(props) => (props.active ? `${theme.colors.primary}15` : 'transparent')};
    border-radius: ${theme.borderRadius.sm};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    border-left: ${(props) =>
      props.active ? `3px solid ${theme.colors.primary}` : '3px solid transparent'};
    padding-left: ${(props) => (props.active ? '9px' : '12px')};

    &:hover {
      color: ${theme.colors.primary};
      background: ${theme.colors.primary}10;
    }
  }
`;

const MobileTocButton = styled.button`
  display: none;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  box-shadow: ${theme.shadows.lg};
  font-size: 24px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: transform ${theme.transitions.fast};

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: flex;
  }
`;

const MobileTocDrawer = styled.div<{ open: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  opacity: ${(props) => (props.open ? 1 : 0)};
  pointer-events: ${(props) => (props.open ? 'auto' : 'none')};
  transition: opacity ${theme.transitions.fast};

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: block;
  }
`;

const MobileTocContent = styled.div<{ open: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: ${theme.colors.card};
  padding: 24px;
  transform: translateX(${(props) => (props.open ? '0' : '100%')});
  transition: transform ${theme.transitions.fast};
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
  font-size: 16px;
  color: ${theme.colors.textLight};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 60px 0;
  color: ${theme.colors.error};
`;

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!id) return;
    loadRecipe(id);
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && recipe && user) {
      setLiked(recipe.likedBy.includes(user.id));
    }
  }, [recipe, user, isAuthenticated]);

  useEffect(() => {
    if (recipe && recipe.steps) {
      const images = [
        recipe.coverUrl,
        ...recipe.steps.filter((s) => s.imageUrl).map((s) => s.imageUrl!),
      ];

      if (images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
      }
    }
  }, [recipe]);

  useEffect(() => {
    const handleScroll = () => {
      if (!recipe?.steps) return;

      const scrollPosition = window.scrollY + 150;

      for (let i = recipe.steps.length - 1; i >= 0; i--) {
        const stepRef = stepRefs.current[i];
        if (stepRef && stepRef.offsetTop <= scrollPosition) {
          setActiveStep(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [recipe]);

  const loadRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const response = await recipeApi.getById(recipeId);
      setRecipe(response.data);
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Failed to load recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !id) {
      navigate('/login');
      return;
    }

    try {
      const response = await recipeApi.like(id);
      setLiked(response.data.liked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Failed to like recipe:', error);
    }
  };

  const scrollToStep = (index: number) => {
    const stepRef = stepRefs.current[index];
    if (stepRef) {
      stepRef.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileTocOpen(false);
  };

  if (loading) {
    return <LoadingContainer>加载中...</LoadingContainer>;
  }

  if (!recipe) {
    return <ErrorContainer>食谱不存在或已被删除</ErrorContainer>;
  }

  const carouselImages = [
    recipe.coverUrl,
    ...recipe.steps.filter((s) => s.imageUrl).map((s) => s.imageUrl!),
  ];

  return (
    <div>
      <PageContainer>
        <MainContent>
          <CarouselContainer>
            {carouselImages.map((imageUrl, index) => (
              <CarouselImage
                key={index}
                imageUrl={imageUrl}
                active={index === currentImageIndex}
              />
            ))}
            {carouselImages.length > 1 && (
              <CarouselDots>
                {carouselImages.map((_, index) => (
                  <CarouselDot
                    key={index}
                    active={index === currentImageIndex}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </CarouselDots>
            )}
          </CarouselContainer>

          <RecipeInfo>
            <RecipeTitle>{recipe.title}</RecipeTitle>
            <RecipeMeta>
              <AuthorInfo>
                <Avatar src={recipe.authorAvatar} alt={recipe.authorName} />
                <AuthorName>{recipe.authorName}</AuthorName>
              </AuthorInfo>
              <MetaItem>
                <span>⏱️</span>
                <span>{recipe.totalTime} 分钟</span>
              </MetaItem>
              <MetaItem>
                <span>⭐</span>
                <RatingDisplay>
                  <span>{recipe.rating.toFixed(1)}</span>
                  <span style={{ color: theme.colors.textLight, fontSize: '12px' }}>
                    ({recipe.ratingCount} 评价)
                  </span>
                </RatingDisplay>
              </MetaItem>
              <LikeButton liked={liked} onClick={handleLike}>
                <span>{liked ? '❤️' : '🤍'}</span>
                <span>{likes}</span>
              </LikeButton>
            </RecipeMeta>
          </RecipeInfo>

          <Section>
            <SectionTitle>🥗 食材清单</SectionTitle>
            <IngredientsList>
              {recipe.ingredients.map((ingredient, index) => (
                <IngredientItem key={index}>
                  <IngredientName>{ingredient.name}</IngredientName>
                  <IngredientAmount>{ingredient.amount}</IngredientAmount>
                </IngredientItem>
              ))}
            </IngredientsList>
          </Section>

          <Section>
            <SectionTitle>👨‍🍳 烹饪步骤</SectionTitle>
            <StepsList>
              {recipe.steps.map((step, index) => (
                <StepItem
                  key={step.id}
                  ref={(el) => (stepRefs.current[index] = el)}
                  id={`step-${index}`}
                >
                  <StepNumber>{index + 1}</StepNumber>
                  <StepContent>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                    {step.imageUrl && <StepImage src={step.imageUrl} alt={step.title} loading="lazy" />}
                  </StepContent>
                </StepItem>
              ))}
            </StepsList>
          </Section>

          <CommentSection recipeId={recipe.id} />
        </MainContent>

        <Sidebar>
          <SidebarTitle>📋 步骤目录</SidebarTitle>
          <TocList>
            {recipe.steps.map((step, index) => (
              <TocItem key={step.id} active={index === activeStep}>
                <a onClick={() => scrollToStep(index)}>
                  步骤 {index + 1}: {step.title}
                </a>
              </TocItem>
            ))}
          </TocList>

          <MobileTocButton onClick={() => setMobileTocOpen(true)}>📋</MobileTocButton>
        </Sidebar>
      </PageContainer>

      <MobileTocDrawer open={mobileTocOpen} onClick={() => setMobileTocOpen(false)}>
        <MobileTocContent open={mobileTocOpen} onClick={(e) => e.stopPropagation()}>
          <SidebarTitle>📋 步骤目录</SidebarTitle>
          <TocList style={{ display: 'flex' }}>
            {recipe.steps.map((step, index) => (
              <TocItem key={step.id} active={index === activeStep}>
                <a onClick={() => scrollToStep(index)}>
                  步骤 {index + 1}: {step.title}
                </a>
              </TocItem>
            ))}
          </TocList>
        </MobileTocContent>
      </MobileTocDrawer>
    </div>
  );
};

export default RecipeDetailPage;
