"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";

import type { PipelineDeal, PipelineStage } from "@/lib/queries/pipeline";
import { getDealAlerts } from "@/lib/alerts";
import { formatCurrency, formatDate, formatRelative, initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DealCard } from "@/components/pipeline/deal-card";
import { DealStageControl } from "@/components/pipeline/deal-stage-control";

type Owner = { id: string; name: string };

export function PipelineView({
  stages,
  deals,
  owners,
}: {
  stages: PipelineStage[];
  deals: PipelineDeal[];
  owners: Owner[];
}) {
  const [view, setView] = React.useState<"kanban" | "table">("kanban");
  const [ownerId, setOwnerId] = React.useState<string>("all");
  const [minAmount, setMinAmount] = React.useState("");
  const [onlyInactive, setOnlyInactive] = React.useState(false);
  const [onlyOverdue, setOnlyOverdue] = React.useState(false);

  const filtered = deals.filter((deal) => {
    if (ownerId !== "all" && deal.ownerId !== ownerId) return false;
    if (minAmount && Number(deal.amount) < Number(minAmount)) return false;
    const alerts = getDealAlerts(deal);
    if (onlyInactive && !alerts.includes("inactive")) return false;
    if (onlyOverdue && !alerts.includes("overdue")) return false;
    return true;
  });

  const dealsByStage = new Map<string, PipelineDeal[]>();
  for (const deal of filtered) {
    const arr = dealsByStage.get(deal.stageId) ?? [];
    arr.push(deal);
    dealsByStage.set(deal.stageId, arr);
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b p-4">
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="Commercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les commerciaux</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Montant min. (€)"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="h-8 w-36"
        />

        <Button
          variant={onlyInactive ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyInactive((v) => !v)}
        >
          Inactifs
        </Button>
        <Button
          variant={onlyOverdue ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyOverdue((v) => !v)}
        >
          Clôture dépassée
        </Button>

        <div className="ml-auto flex items-center gap-1 rounded-md border p-0.5">
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            <LayoutGrid className="size-4" /> Kanban
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
          >
            <Table2 className="size-4" /> Tableau
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {sortedStages.map((stage) => {
            const stageDeals = dealsByStage.get(stage.id) ?? [];
            const total = stageDeals.reduce((sum, d) => sum + Number(d.amount), 0);
            return (
              <div key={stage.id} className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/40">
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stageDeals.length} deal{stageDeals.length > 1 ? "s" : ""} ·{" "}
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-3">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} stages={stages} />
                  ))}
                  {stageDeals.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                      Aucun deal
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Étape</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Probabilité</TableHead>
                <TableHead>Commercial</TableHead>
                <TableHead>Clôture prévue</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead>Alertes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((deal) => {
                const alerts = getDealAlerts(deal);
                const href =
                  deal.company.status === "client" ? `/clients/${deal.companyId}` : `/prospects/${deal.companyId}`;
                return (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Link href={href} className="font-medium hover:underline">
                        {deal.company.name}
                      </Link>
                    </TableCell>
                    <TableCell className="w-44">
                      <DealStageControl dealId={deal.id} currentStageId={deal.stageId} stages={stages} size="sm" />
                    </TableCell>
                    <TableCell>{formatCurrency(deal.amount)}</TableCell>
                    <TableCell>{deal.probability}%</TableCell>
                    <TableCell>
                      {deal.owner && (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">{initials(deal.owner.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{deal.owner.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(deal.expectedCloseDate)}</TableCell>
                    <TableCell>{formatRelative(deal.lastActivityAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {alerts.includes("inactive") && <Badge variant="warning">Inactif</Badge>}
                        {alerts.includes("overdue") && <Badge variant="destructive">Retard</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Aucun deal ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
