import { Users } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function ProspectsPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Prospects"
      description="Liste des entreprises prospects avec fiche détaillée, timeline et synthèse IA."
      phase="phase 2 (Fiches + Pipeline)"
    />
  );
}
