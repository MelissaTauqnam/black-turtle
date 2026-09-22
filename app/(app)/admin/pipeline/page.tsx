import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function AdminPipelinePage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Pipeline & scoring"
      description="Paramétrage des étapes de pipeline, des critères de scoring et des délais d'alerte."
      phase="phase 7 (Administration)"
    />
  );
}
