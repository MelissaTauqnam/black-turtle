import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function AdminAuditPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Journal d'audit"
      description="Historique des actions effectuées dans l'application."
      phase="phase 7 (Administration)"
    />
  );
}
