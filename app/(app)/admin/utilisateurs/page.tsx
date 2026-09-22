import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function AdminUsersPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Utilisateurs & objectifs"
      description="Gestion des utilisateurs, des rôles et des objectifs par commercial."
      phase="phase 7 (Administration)"
    />
  );
}
