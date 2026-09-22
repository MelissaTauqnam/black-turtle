import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function AdminIntegrationsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Intégrations"
      description="Statut de chaque source de données (CRM, appels, visios, facturation…)."
      phase="phase 7 (Administration)"
    />
  );
}
