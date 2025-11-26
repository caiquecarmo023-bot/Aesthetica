export interface ScoreMetric {
  name: string;
  score: number; // 0-100
  feedback: string;
}

export interface ScriptSuggestion {
  title: string;
  hook: string;
  body: string;
  cta: string;
  visual_cues: string;
}

export interface AnalysisResponse {
  overall_score: number;
  summary: string;
  metrics: {
    copywriting: ScoreMetric;
    visuals: ScoreMetric;
    pacing: ScoreMetric;
    branding: ScoreMetric;
    cta_effectiveness: ScoreMetric;
  };
  pros: string[];
  cons: string[];
  branding_analysis: string;
  suggested_scripts: ScriptSuggestion[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
