export function getPhoenixStageImage(scorePercentage: number): string {
  if (scorePercentage < 25) return '/images/phoenix-stage-0.jpg'; // Cold Ashes (0-24%)
  if (scorePercentage < 75) return '/images/phoenix-stage-1.jpg'; // Awakening Sparks (25-74%)
  if (scorePercentage < 91) return '/images/phoenix-stage-2.jpg'; // Full Phoenix (75-90%)
  return '/images/phoenix-stage-3.jpg';                         // Supernova Samurai (91-100%)
}
