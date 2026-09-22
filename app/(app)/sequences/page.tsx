import { Mail } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function SequencesPage() {
  return (
    <ComingSoon
      icon={Mail}
      title="Séquences email"
      description="Éditeur de séquences, personnalisation IA et statistiques d'envoi."
      phase="phase 4 (Séquences email)"
    />
  );
}
