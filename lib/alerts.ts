import { daysSince } from "@/lib/format";
import { CHURN_RISK_LOGIN_DAYS, INACTIVITY_ALERT_DAYS } from "@/lib/pipeline";

export type DealAlert = "inactive" | "overdue";

export function getDealAlerts(deal: {
  status: string;
  expectedCloseDate: Date | string | null;
  lastActivityAt: Date | string | null;
}): DealAlert[] {
  if (deal.status !== "open") return [];
  const alerts: DealAlert[] = [];

  const inactiveDays = daysSince(deal.lastActivityAt);
  if (inactiveDays === null || inactiveDays >= INACTIVITY_ALERT_DAYS) {
    alerts.push("inactive");
  }

  if (deal.expectedCloseDate) {
    const closeDate = new Date(deal.expectedCloseDate);
    if (closeDate.getTime() < Date.now()) {
      alerts.push("overdue");
    }
  }

  return alerts;
}

export function isChurnRisk(lastLoginAt: Date | string | null) {
  const days = daysSince(lastLoginAt);
  return days === null || days >= CHURN_RISK_LOGIN_DAYS;
}
