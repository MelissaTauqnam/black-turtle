import { BarChart3 } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function PerformancePage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Performance commerciale"
      description="KPIs d'activité, de résultats et de qualité, par commercial et par équipe."
      phase="phase 6 (Performance commerciale)"
    />
  );
}
