export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface TrendPoint {
  date: string;
  weight: number;
  exerciseMinutes: number;
  foodAmount: number;
}

const WEIGHT_WEIGHT = 0.4;
const EXERCISE_WEIGHT = 0.35;
const FOOD_WEIGHT = 0.25;

function isValidNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && !Number.isNaN(v);
}

function sanitizeTrends(trends: TrendPoint[]): TrendPoint[] {
  if (!Array.isArray(trends)) return [];
  return trends
    .filter((t) => !!t)
    .map((t) => ({
      date: typeof t.date === 'string' ? t.date : '',
      weight: isValidNumber(t.weight) && t.weight >= 0 && t.weight < 200 ? t.weight : NaN,
      exerciseMinutes: isValidNumber(t.exerciseMinutes) && t.exerciseMinutes >= 0 && t.exerciseMinutes < 1440 ? t.exerciseMinutes : NaN,
      foodAmount: isValidNumber(t.foodAmount) && t.foodAmount >= 0 && t.foodAmount < 50 ? t.foodAmount : NaN,
    }))
    .filter((t) => isValidNumber(t.weight) || isValidNumber(t.exerciseMinutes) || isValidNumber(t.foodAmount));
}

export function calculateHealthScore(trends: TrendPoint[]): HealthStatus {
  const sanitized = sanitizeTrends(trends);

  if (sanitized.length === 0) {
    return 'unknown';
  }

  const validDays = sanitized.length;

  const validWeights = sanitized.map((t) => t.weight).filter(isValidNumber);
  const validExercises = sanitized.map((t) => t.exerciseMinutes).filter(isValidNumber);
  const validFoods = sanitized.map((t) => t.foodAmount).filter(isValidNumber);

  const hasEnoughWeight = validWeights.length >= Math.max(2, Math.floor(validDays * 0.4));
  const hasEnoughExercise = validExercises.length >= Math.max(2, Math.floor(validDays * 0.4));
  const hasEnoughFood = validFoods.length >= Math.max(2, Math.floor(validDays * 0.4));

  if (!hasEnoughWeight && !hasEnoughExercise && !hasEnoughFood) {
    return 'unknown';
  }

  let weightScore = hasEnoughWeight ? 100 : 60;
  if (hasEnoughWeight) {
    const avgWeight = validWeights.reduce((s, w) => s + w, 0) / validWeights.length;
    const weightFirst = validWeights[0];
    const weightLast = validWeights[validWeights.length - 1];
    const weightChangePercent = avgWeight > 0 ? ((weightLast - weightFirst) / avgWeight) * 100 : 0;
    const weightChangeAbs = Math.abs(weightChangePercent);
    if (weightChangeAbs > 10) {
      weightScore = 10;
    } else if (weightChangeAbs > 7) {
      weightScore = 30;
    } else if (weightChangeAbs > 4) {
      weightScore = 55;
    } else if (weightChangeAbs > 2) {
      weightScore = 75;
    } else if (weightChangeAbs > 0.5) {
      weightScore = 90;
    }
  }

  let exerciseScore = hasEnoughExercise ? 100 : 50;
  if (hasEnoughExercise) {
    const avgExercise = validExercises.reduce((s, e) => s + e, 0) / validExercises.length;
    if (avgExercise < 5) {
      exerciseScore = 15;
    } else if (avgExercise < 12) {
      exerciseScore = 40;
    } else if (avgExercise < 20) {
      exerciseScore = 65;
    } else if (avgExercise < 30) {
      exerciseScore = 85;
    }

    const exerciseDays = sanitized.filter((t) => isValidNumber(t.exerciseMinutes) && t.exerciseMinutes > 0).length;
    const exerciseConsistency = exerciseDays / validDays;
    if (exerciseConsistency < 0.3) {
      exerciseScore = Math.min(exerciseScore, 30);
    } else if (exerciseConsistency < 0.5) {
      exerciseScore = Math.min(exerciseScore, 55);
    } else if (exerciseConsistency < 0.7) {
      exerciseScore = Math.min(exerciseScore, 75);
    }
  }

  let foodScore = hasEnoughFood ? 100 : 50;
  if (hasEnoughFood) {
    const avgFood = validFoods.reduce((s, f) => s + f, 0) / validFoods.length;
    if (avgFood < 1) {
      foodScore = 20;
    } else if (avgFood < 2) {
      foodScore = 50;
    } else if (avgFood > 6) {
      foodScore = 40;
    } else if (avgFood > 4) {
      foodScore = 70;
    }

    const foodDays = sanitized.filter((t) => isValidNumber(t.foodAmount) && t.foodAmount > 0).length;
    const foodConsistency = foodDays / validDays;
    if (foodConsistency < 0.4) {
      foodScore = Math.min(foodScore, 35);
    } else if (foodConsistency < 0.6) {
      foodScore = Math.min(foodScore, 60);
    }
  }

  const totalScore =
    weightScore * WEIGHT_WEIGHT +
    exerciseScore * EXERCISE_WEIGHT +
    foodScore * FOOD_WEIGHT;

  if (totalScore >= 85) {
    return 'excellent';
  } else if (totalScore >= 65) {
    return 'good';
  } else if (totalScore >= 40) {
    return 'fair';
  } else {
    return 'poor';
  }
}
