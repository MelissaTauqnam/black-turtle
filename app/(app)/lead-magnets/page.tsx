import { Gift } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function LeadMagnetsPage() {
  return (
    <ComingSoon
      icon={Gift}
      title="Lead magnets"
      description="Catalogue, génération IA de copy et statistiques de conversion."
      phase="phase 5 (Lead magnets)"
    />
  );
}
