// Scoring configuration with weights (adjustable)
export interface ScoringWeights {
  foundersExperience: number;
  teamSize: number;
  marketSize: number;
  fundingStage: number;
  monthlyRevenue: number;
  productStage: number;
  pitchQuality: number;
  competitiveAdvantage: number;
}

export interface ScoringInputs {
  foundersExperience: number; // Years of experience
  foundersStartups: number; // Number of previous startups
  foundersExits: number; // Number of successful exits
  teamSize: number;
  marketSize: number; // TAM in USD
  fundingStage: string;
  monthlyRevenue: number;
  productStage: string;
  pitchQuality: number; // Score 1-10
  competitiveAdvantage: string;
}

export interface ScoreResult {
  finalScore: number;
  breakdown: Record<string, number>;
}

export const defaultWeights: ScoringWeights = {
  foundersExperience: 20,
  teamSize: 10,
  marketSize: 15,
  fundingStage: 15,
  monthlyRevenue: 15,
  productStage: 10,
  pitchQuality: 10,
  competitiveAdvantage: 5,
};

export const defaultInputs: ScoringInputs = {
  foundersExperience: 0,
  foundersStartups: 0,
  foundersExits: 0,
  teamSize: 1,
  marketSize: 0,
  fundingStage: "",
  monthlyRevenue: 0,
  productStage: "",
  pitchQuality: 5,
  competitiveAdvantage: "",
};

/**
 * Maps funding instrument to standardized funding stage
 */
export const mapFundingStage = (instrument?: string): string => {
  if (!instrument) return "";
  const lowerInstrument = instrument.toLowerCase();
  if (lowerInstrument.includes("equity")) return "seed";
  if (lowerInstrument.includes("safe")) return "pre-seed";
  if (lowerInstrument.includes("convertible")) return "seed";
  return "pre-seed";
};

/**
 * Maps product stage to standardized product stage
 */
export const mapProductStage = (stage?: string): string => {
  if (!stage) return "";
  const lowerStage = stage.toLowerCase();
  if (lowerStage.includes("idea")) return "idea";
  if (lowerStage.includes("mvp")) return "mvp";
  if (lowerStage.includes("scaling")) return "launched";
  return "prototype";
};

/**
 * Calculate startup investment score based on weighted inputs
 */
export const calculateStartupScore = (
  inputs: ScoringInputs,
  weights: ScoringWeights
): ScoreResult => {
  const scores: Record<string, number> = {};

  // Founders Experience (0-100 based on years, startups, exits)
  const expScore = Math.min(
    100,
    inputs.foundersExperience * 3 +
      inputs.foundersStartups * 15 +
      inputs.foundersExits * 25
  );
  scores.foundersExperience = expScore;

  // Team Size (optimal around 3-7 people)
  const teamOptimal =
    inputs.teamSize >= 3 && inputs.teamSize <= 7
      ? 100
      : inputs.teamSize < 3
      ? (inputs.teamSize / 3) * 70
      : Math.max(30, 100 - (inputs.teamSize - 7) * 8);
  scores.teamSize = teamOptimal;

  // Market Size (logarithmic scale, $1B+ = 100)
  const marketScore =
    inputs.marketSize > 0
      ? Math.min(100, (Math.log10(inputs.marketSize) - 6) * 25)
      : 0;
  scores.marketSize = Math.max(0, marketScore);

  // Funding Stage
  const stageScores: Record<string, number> = {
    "pre-seed": 60,
    seed: 75,
    "series-a": 85,
    "series-b": 90,
    "series-c": 95,
  };
  scores.fundingStage = stageScores[inputs.fundingStage] || 50;

  // Monthly Revenue (logarithmic scale)
  const revenueScore =
    inputs.monthlyRevenue > 0
      ? Math.min(100, (Math.log10(inputs.monthlyRevenue) - 2) * 20)
      : 0;
  scores.monthlyRevenue = Math.max(0, revenueScore);

  // Product Stage
  const productScores: Record<string, number> = {
    idea: 30,
    prototype: 50,
    mvp: 70,
    launched: 100,
  };
  scores.productStage = productScores[inputs.productStage] || 0;

  // Pitch Quality (direct mapping 1-10 to 10-100)
  scores.pitchQuality = (inputs.pitchQuality / 10) * 100;

  // Competitive Advantage (simple text length heuristic for now)
  const advantageScore = Math.min(
    100,
    (inputs.competitiveAdvantage.length / 200) * 100
  );
  scores.competitiveAdvantage = advantageScore;

  // Calculate weighted final score
  let finalScore = 0;
  Object.keys(scores).forEach((key) => {
    const weight = weights[key as keyof ScoringWeights] / 100;
    finalScore += scores[key] * weight;
  });

  return {
    finalScore: Math.round(finalScore),
    breakdown: scores,
  };
};

/**
 * Get color class for score visualization
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

/**
 * Get human-readable score label
 */
export const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent Investment Potential";
  if (score >= 60) return "Good Investment Potential";
  if (score >= 40) return "Moderate Investment Potential";
  return "Limited Investment Potential";
};

/**
 * Validate that weights total 100%
 */
export const validateWeights = (weights: ScoringWeights): boolean => {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  return total === 100;
};

/**
 * Get total weight percentage
 */
export const getTotalWeight = (weights: ScoringWeights): number => {
  return Object.values(weights).reduce((a, b) => a + b, 0);
};

/**
 * Format weight key for display (camelCase to Title Case)
 */
export const formatWeightKey = (key: string): string => {
  return key.replace(/([A-Z])/g, " $1").trim();
};
