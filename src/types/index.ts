export interface RawSalesRow {
  date: string;
  sales: number;
  [key: string]: any;
}

export interface CleanedDailyRecord {
  date: string; // YYYY-MM-DD
  sales: number;
  day_of_week: string; // Monday, Tuesday...
  month: number; // 1-12
  sales_lag_7: number | null; // Sales 7 days ago
  is_filled_gap?: boolean; // Was missing date filled with 0
}

export interface ForecastPoint {
  date: string;
  yhat: number; // Predicted value
  yhat_lower: number; // Lower confidence bound
  yhat_upper: number; // Upper confidence bound
  trend: number;
  weekly_seasonality: number;
  yearly_seasonality: number;
  is_test_period?: boolean;
  actual?: number | null;
}

export interface AnomalyRecord {
  date: string;
  sales: number;
  rolling_mean: number;
  rolling_std: number;
  z_score: number;
  anomaly_type: 'spike' | 'drop';
  severity: 'moderate' | 'high' | 'extreme';
  expected_min: number;
  expected_max: number;
  notes?: string;
}

export interface ModelMetrics {
  MAE: number; // Mean Absolute Error
  RMSE: number; // Root Mean Squared Error
  MAPE: number; // Mean Absolute Percentage Error
  R2?: number; // R-squared correlation
  testDays: number;
  trainingDays: number;
}

export interface SeasonalityBreakdown {
  dayOfWeek: { day: string; impact: number; avgSales: number }[];
  monthly: { month: string; impact: number; avgSales: number }[];
  annualGrowthRate: number; // e.g. +4.2%
}

export type AgentStep = 'idle' | 'preprocessing' | 'forecasting' | 'anomaly' | 'explanation' | 'completed';

export interface AgentLog {
  timestamp: string;
  agent: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
}

export interface PipelineExecutionResult {
  cleanedData: CleanedDailyRecord[];
  forecastFuture: ForecastPoint[];
  forecastFull: ForecastPoint[];
  metrics: ModelMetrics;
  anomalies: AnomalyRecord[];
  templateExplanation: string;
  aiExplanation?: string;
  seasonality: SeasonalityBreakdown;
  logs: AgentLog[];
  executionTimeMs: number;
}

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  dateColumn: string;
  salesColumn: string;
  recordsCount: number;
  dateRange: string;
  tags: string[];
}
