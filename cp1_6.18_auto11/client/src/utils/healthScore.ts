export type HealthStatus = 'healthy' | 'warning' | 'alert';

export interface TrendPoint {
  date: string;
  weight: number;
  exerciseMinutes: number;
  foodAmount: number;
}

const WEIGHT_WEIGHT = 0.4;
const EXERCISE_WEIGHT = 0.35;
const FOOD_WEIGHT = 0.25;

export function calculateHealthScore(trends: TrendPoint[]): HealthStatus {
  if (!trends || trends.length === 0) {
    return 'warning';
  }

  const validDays = trends.length;
  const avgExercise = trends.reduce((sum, t) => sum + t.exerciseMinutes, 0) / validDays;
  const avgFood = trends.reduce((sum, t) => sum + t.foodAmount, 0) / validDays;
  const weights = trends.map((t) => t.weight);
  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / validDays;

  const weightFirst = weights[0];
  const weightLast = weights[weights.length - 1];
  const weightChangePercent = avgWeight > 0 ? ((weightLast - weightFirst) / avgWeight) * 100 : 0;

  let weightScore = 100;
  const weightChangeAbs = Math.abs(weightChangePercent);
  if (weightChangeAbs > 10) {
    weightScore = 0;
  } else if (weightChangeAbs > 5) {
    weightScore = 40;
  } else if (weightChangeAbs > 2) {
    weightScore = 70;
  }

  let exerciseScore = 100;
  if (avgExercise < 5) {
    exerciseScore = 20;
  } else if (avgExercise < 15) {
    exerciseScore = 50;
  } else if (avgExercise < 25) {
    exerciseScore = 80;
  }

  const exerciseDays = trends.filter((t) => t.exerciseMinutes > 0).length;
  const exerciseConsistency = exerciseDays / validDays;
  if (exerciseConsistency < 0.4) {
    exerciseScore = Math.min(exerciseScore, 40);
  } else if (exerciseConsistency < 0.7) {
    exerciseScore = Math.min(exerciseScore, 70);
  }

  let foodScore = 100;
  if (avgFood < 1) {
    foodScore = 20;
  } else if (avgFood < 2) {
    foodScore = 60;
  } else if (avgFood > 5) {
    foodScore = 50;
  }

  const foodDays = trends.filter((t) => t.foodAmount > 0).length;
  const foodConsistency = foodDays / validDays;
  if (foodConsistency < 0.5) {
    foodScore = Math.min(foodScore, 40);
  }

  const totalScore =
    weightScore * WEIGHT_WEIGHT +
    exerciseScore * EXERCISE_WEIGHT +
    foodScore * FOOD_WEIGHT;

  if (totalScore >= 75) {
    return 'healthy';
  } else if (totalScore >= 45) {
    return 'warning';
  } else {
    return 'alert';
  }
}
