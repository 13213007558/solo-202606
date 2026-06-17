import type { ColumnType, DataFrame } from './parser';

export interface OutlierRow {
  rowIndex: number;
  value: unknown;
}

export interface ColumnReport {
  name: string;
  type: ColumnType;
  totalCount: number;
  nonNullCount: number;
  missingCount: number;
  missingRate: number;
  uniqueCount: number;
  outlierCount: number;
  outlierRate: number;
  anomalyCount: number;
  anomalyRatio: number;
  outliers: OutlierRow[];
  valueDistribution: { value: string; count: number }[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
}

function isNullish(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function isNumberString(v: string): boolean {
  if (v === '' || v === null || v === undefined) return false;
  const n = Number(v);
  return !Number.isNaN(n) && Number.isFinite(n);
}

function isBooleanString(v: string): boolean {
  const low = v.toLowerCase().trim();
  return ['true', 'false', 'yes', 'no', '1', '0', '是', '否'].includes(low);
}

function isDateString(v: string): boolean {
  if (v === '' || v === null || v === undefined) return false;
  if (isNumberString(v)) return false;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return false;
  const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/;
  const slashPattern = /^\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}/;
  return isoPattern.test(v) || slashPattern.test(v);
}

function inferType(values: (unknown)[]): ColumnType {
  const nonNull = values.filter(v => !isNullish(v)) as string[];
  if (nonNull.length === 0) return 'text';

  let numCount = 0;
  let boolCount = 0;
  let dateCount = 0;
  const total = nonNull.length;

  const sampleSize = Math.min(total, 100);
  const sample = nonNull.slice(0, sampleSize);

  for (const v of sample) {
    if (typeof v !== 'string') continue;
    if (isBooleanString(v)) boolCount++;
    else if (isNumberString(v)) numCount++;
    else if (isDateString(v)) dateCount++;
  }

  const threshold = sampleSize * 0.6;

  if (boolCount >= threshold && boolCount > 0) return 'boolean';
  if (numCount >= threshold && numCount > 0) return 'number';
  if (dateCount >= threshold && dateCount > 0) return 'date';
  return 'text';
}

function detectOutliers(
  values: unknown[],
  type: ColumnType
): OutlierRow[] {
  const outliers: OutlierRow[] = [];

  if (type === 'number') {
    const nums: { idx: number; val: number }[] = [];
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (isNullish(v)) continue;
      const n = Number(v);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        nums.push({ idx: i, val: n });
      } else {
        outliers.push({ rowIndex: i, value: v });
      }
    }

    if (nums.length >= 4) {
      const sorted = nums.map(n => n.val).sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      for (const { idx, val } of nums) {
        if (val < lower || val > upper) {
          outliers.push({ rowIndex: idx, value: val });
        }
      }
    }
  } else if (type === 'date') {
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (isNullish(v)) continue;
      if (typeof v !== 'string' || !isDateString(v)) {
        outliers.push({ rowIndex: i, value: v });
      }
    }
  } else if (type === 'boolean') {
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (isNullish(v)) continue;
      if (typeof v !== 'string' || !isBooleanString(v)) {
        outliers.push({ rowIndex: i, value: v });
      }
    }
  } else {
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (isNullish(v)) continue;
      if (typeof v === 'string' && v.length > 1000) {
        outliers.push({ rowIndex: i, value: v });
      }
    }
  }

  return outliers;
}

function detectAnomaliesZScore(
  values: unknown[],
  type: ColumnType,
  threshold = 2.5
): OutlierRow[] {
  if (type !== 'number') return [];

  const nums: { idx: number; val: number }[] = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (isNullish(v)) continue;
    const n = Number(v);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      nums.push({ idx: i, val: n });
    }
  }

  if (nums.length < 3) return [];

  const firstVal = nums[0].val;
  const allSame = nums.every(n => n.val === firstVal);
  if (allSame) return [];

  const sum = nums.reduce((acc, n) => acc + n.val, 0);
  const mean = sum / nums.length;
  const variance = nums.reduce((acc, n) => acc + (n.val - mean) ** 2, 0) / nums.length;
  const stdDev = Math.sqrt(variance);

  if (!Number.isFinite(stdDev) || stdDev <= Number.EPSILON) return [];

  const anomalies: OutlierRow[] = [];
  for (const { idx, val } of nums) {
    const z = Math.abs((val - mean) / stdDev);
    if (Number.isFinite(z) && z > threshold) {
      anomalies.push({ rowIndex: idx, value: val });
    }
  }

  return anomalies;
}

function computeNumericStats(values: unknown[]): {
  min?: number; max?: number; mean?: number; median?: number; stdDev?: number;
} {
  const nums: number[] = [];
  for (const v of values) {
    if (isNullish(v)) continue;
    const n = Number(v);
    if (!Number.isNaN(n) && Number.isFinite(n)) nums.push(n);
  }
  if (nums.length === 0) return {};

  const sorted = [...nums].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const variance = nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
  const stdDev = Math.sqrt(variance);

  return { min, max, mean, median, stdDev };
}

function buildDistribution(
  values: unknown[],
  type: ColumnType
): { value: string; count: number }[] {
  const map = new Map<string, number>();
  const maxBuckets = 20;

  if (type === 'number') {
    const nums: number[] = [];
    for (const v of values) {
      if (isNullish(v)) continue;
      const n = Number(v);
      if (!Number.isNaN(n) && Number.isFinite(n)) nums.push(n);
    }
    if (nums.length === 0) return [];

    const min = Math.min(...nums);
    const max = Math.max(...nums);
    if (min === max) {
      return [{ value: String(min), count: nums.length }];
    }

    const bucketSize = (max - min) / maxBuckets;
    for (const n of nums) {
      const bucketIdx = Math.min(Math.floor((n - min) / bucketSize), maxBuckets - 1);
      const bucketStart = min + bucketIdx * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const key = `${bucketStart.toFixed(1)}~${bucketEnd.toFixed(1)}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  } else {
    for (const v of values) {
      if (isNullish(v)) continue;
      const key = String(v);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  const entries = [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  if (entries.length > maxBuckets) {
    const top = entries.slice(0, maxBuckets - 1);
    const other = entries.slice(maxBuckets - 1).reduce((sum, e) => sum + e.count, 0);
    top.push({ value: '其他', count: other });
    return top;
  }

  return entries;
}

export function analyze(df: DataFrame): ColumnReport[] {
  return df.columns.map(colName => {
    const values = df.rows.map(r => r[colName]);
    const type = inferType(values);

    const missingCount = values.filter(isNullish).length;
    const totalCount = values.length;
    const nonNullCount = totalCount - missingCount;
    const missingRate = totalCount > 0 ? missingCount / totalCount : 0;

    const uniqueSet = new Set(
      values.filter(v => !isNullish(v)).map(v => String(v))
    );
    const uniqueCount = uniqueSet.size;

    const outliers = detectOutliers(values, type);
    const outlierCount = outliers.length;
    const outlierRate = totalCount > 0 ? outlierCount / totalCount : 0;

    const anomalyRows = detectAnomaliesZScore(values, type, 2.5);
    const outlierIndexSet = new Set(outliers.map(o => o.rowIndex));
    const uniqueAnomalies = anomalyRows.filter(a => !outlierIndexSet.has(a.rowIndex));
    const allAnomalies = [...outliers, ...uniqueAnomalies];
    const anomalyCount = allAnomalies.length;
    const anomalyRatio = totalCount > 0 ? anomalyCount / totalCount : 0;

    const valueDistribution = buildDistribution(values, type);

    const stats: Partial<ColumnReport> = {};
    if (type === 'number') {
      Object.assign(stats, computeNumericStats(values));
    }

    return {
      name: colName,
      type,
      totalCount,
      nonNullCount,
      missingCount,
      missingRate,
      uniqueCount,
      outlierCount,
      outlierRate,
      anomalyCount,
      anomalyRatio,
      outliers: allAnomalies.slice(0, 100),
      valueDistribution,
      ...stats
    };
  });
}
