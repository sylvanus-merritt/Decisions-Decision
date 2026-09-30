export type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';

export type FactorCategory =
  | 'Financial'
  | 'Career'
  | 'Wellbeing'
  | 'Relationships'
  | 'Risk'
  | 'Time'
  | 'Strategic'
  | 'Other';

export interface ProConItem {
  id: string;
  text: string;
  detail: string;
  category: FactorCategory;
  weight: number; // 1 to 5
  counterpoint?: string;
  mitigation?: string;
  isActive: boolean;
  isUserAdded?: boolean;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OptionAnalysis {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  swot: SWOTAnalysis;
  baseScore: number;
}

export interface CriteriaRow {
  id: string;
  name: string;
  weight: number; // 1 to 5
  description: string;
  optionScores: Record<
    string,
    {
      score: number; // 1 to 10
      note: string;
    }
  >;
}

export interface TheTiebreakerVerdict {
  winnerOptionId: string;
  winnerTitle: string;
  confidencePercent: number;
  theDecisiveFactor: string;
  hardTruth: string;
  preMortem: string;
  contingencyPlan: string;
  actionPlan30Days: string[];
  reversibleDoorAnalysis: {
    type: 'Type 1 (One-Way Door)' | 'Type 2 (Two-Way Door)';
    reasoning: string;
  };
}

export interface ScenarioTestResult {
  scenario: string;
  timestamp: string;
  impactSummary: string;
  shiftInPower: string;
  winnerOptionId: string;
  winnerTitle: string;
  keyAdvice: string;
}

export interface DecisionAnalysis {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  summary?: string;
  context: string;
  riskTolerance: RiskTolerance;
  priorities: string[];
  options: OptionAnalysis[];
  comparisonMatrix: CriteriaRow[];
  verdict: TheTiebreakerVerdict;
  scenarioPrompts: string[];
  thinkingModeUsed: boolean;
  scenarioHistory?: ScenarioTestResult[];
  versionNumber?: number;
  versionLabel?: string;
  parentId?: string;
  rootDecisionId?: string;
}

export interface DecisionPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  context: string;
  options: string[];
  priorities: string[];
  riskTolerance: RiskTolerance;
}
