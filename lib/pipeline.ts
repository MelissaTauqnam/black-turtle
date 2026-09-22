// Probabilité par défaut associée à chaque étape "ouverte" du pipeline (index = stage.order - 1).
// Utilisé au seed et lors d'un changement d'étape manuel.
export const STAGE_DEFAULT_PROBABILITY = [10, 25, 45, 60, 75];

export function defaultProbabilityForStage(stage: { order: number; isWon: boolean; isLost: boolean }) {
  if (stage.isWon) return 100;
  if (stage.isLost) return 0;
  return STAGE_DEFAULT_PROBABILITY[stage.order - 1] ?? 50;
}

export const INACTIVITY_ALERT_DAYS = 10;
export const CHURN_RISK_LOGIN_DAYS = 14;
