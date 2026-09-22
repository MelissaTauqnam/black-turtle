import { Sparkles } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function MaJourneePage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="Ma journée"
      description="Suggestions IA et tâches du jour, priorisées pour le commercial connecté."
      phase="phase 3 (Suggestions IA + Ma journée)"
    />
  );
}
