import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

import type { PipelineDeal, PipelineStage } from "@/lib/queries/pipeline";
import { getDealAlerts } from "@/lib/alerts";
import { formatCurrency, formatRelative, initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DealStageControl } from "@/components/pipeline/deal-stage-control";

export function DealCard({ deal, stages }: { deal: PipelineDeal; stages: PipelineStage[] }) {
  const alerts = getDealAlerts(deal);
  const href = deal.company.status === "client" ? `/clients/${deal.companyId}` : `/prospects/${deal.companyId}`;

  return (
    <Card className="gap-2 py-3">
      <CardContent className="space-y-2 px-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="min-w-0 flex-1 text-sm font-medium hover:underline">
            <span className="line-clamp-2">{deal.company.name}</span>
          </Link>
          {deal.owner && (
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-[10px]">{initials(deal.owner.name)}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{formatCurrency(deal.amount)}</span>
          <span>{deal.probability}%</span>
        </div>

        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {alerts.includes("inactive") && (
              <Badge variant="warning" className="gap-1">
                <Clock className="size-3" /> Inactif
              </Badge>
            )}
            {alerts.includes("overdue") && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" /> Clôture dépassée
              </Badge>
            )}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Dernière activité {formatRelative(deal.lastActivityAt)}
        </p>

        <DealStageControl dealId={deal.id} currentStageId={deal.stageId} stages={stages} size="sm" />
      </CardContent>
    </Card>
  );
}
