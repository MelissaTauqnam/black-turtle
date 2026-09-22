"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";

import { formatCurrency, formatRelative, initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ClientRow = {
  id: string;
  name: string;
  industry: string | null;
  owner: { id: string; name: string } | null;
  plan: string | null;
  mrr: string | null;
  healthScore: number | null;
  lastLoginAt: Date | null;
  churnRisk: boolean;
};

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()));
  const totalMrr = rows.reduce((sum, r) => sum + Number(r.mrr ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          MRR total : <span className="font-medium text-foreground">{formatCurrency(totalMrr)}</span>
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entreprise</TableHead>
            <TableHead>Secteur</TableHead>
            <TableHead>Commercial</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>MRR</TableHead>
            <TableHead>Health score</TableHead>
            <TableHead>Dernière connexion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link href={`/clients/${row.id}`} className="font-medium hover:underline">
                  {row.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.industry ?? "—"}</TableCell>
              <TableCell>
                {row.owner ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">{initials(row.owner.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{row.owner.name}</span>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{row.plan ? <Badge variant="outline">{row.plan}</Badge> : "—"}</TableCell>
              <TableCell>{formatCurrency(row.mrr)}</TableCell>
              <TableCell>
                {row.healthScore !== null ? (
                  <Badge
                    variant={row.healthScore >= 60 ? "success" : row.healthScore >= 30 ? "warning" : "destructive"}
                  >
                    {row.healthScore}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {row.churnRisk && <AlertTriangle className="size-3.5 text-destructive" />}
                  {formatRelative(row.lastLoginAt)}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Aucun client ne correspond à votre recherche.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
