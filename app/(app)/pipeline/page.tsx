import { Kanban } from "lucide-react";

import { ComingSoon } from "@/components/layout/coming-soon";

export default function PipelinePage() {
  return (
    <ComingSoon
      icon={Kanban}
      title="Pipeline"
      description="Vue Kanban et vue tableau des deals, avec filtres et alertes d'inactivité."
      phase="phase 2 (Fiches + Pipeline)"
    />
  );
}
