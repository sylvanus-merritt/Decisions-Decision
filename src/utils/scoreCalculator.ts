import { DecisionAnalysis, OptionAnalysis } from '../types/decision';

/**
 * Calculates a dynamic score (0-100) for an option based on:
 * - Active Pros (positive weight)
 * - Active Cons (negative weight)
 * - Criteria table weights
 */
export function calculateDynamicOptionScore(
  option: OptionAnalysis,
  decision: DecisionAnalysis
): number {
  // 1. Pros contribution
  const activePros = option.pros.filter((p) => p.isActive);
  const totalProsWeight = activePros.reduce((acc, p) => acc + (p.weight || 3), 0);

  // 2. Cons contribution
  const activeCons = option.cons.filter((c) => c.isActive);
  const totalConsWeight = activeCons.reduce((acc, c) => acc + (c.weight || 3), 0);

  // 3. Criteria table contribution
  let criteriaScoreTotal = 0;
  let totalCriteriaWeight = 0;

  if (decision.comparisonMatrix && decision.comparisonMatrix.length > 0) {
    for (const row of decision.comparisonMatrix) {
      const optScoreObj = row.optionScores[option.id];
      if (optScoreObj) {
        criteriaScoreTotal += optScoreObj.score * (row.weight || 3);
        totalCriteriaWeight += (row.weight || 3) * 10;
      }
    }
  }

  // Combine pros/cons ratio with criteria matrix score
  const netProsCons = totalProsWeight - totalConsWeight;
  // Baseline scale around 50
  const prosConsNormalized = Math.min(
    100,
    Math.max(10, 50 + netProsCons * 4)
  );

  const criteriaNormalized =
    totalCriteriaWeight > 0 ? (criteriaScoreTotal / totalCriteriaWeight) * 100 : 50;

  // Blended score (60% criteria matrix, 40% pros/cons balance)
  const blended = Math.round(criteriaNormalized * 0.6 + prosConsNormalized * 0.4);

  return Math.min(99, Math.max(12, blended));
}
