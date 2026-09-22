import { Building2 } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function ClientsPage() {
  return (
    <ComingSoon
      icon={Building2}
      title="Clients"
      description="Liste des comptes clients avec health score, MRR et usage produit."
      phase="phase 2 (Fiches + Pipeline)"
    />
  );
}
