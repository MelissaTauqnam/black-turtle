"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

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

export type ProspectRow = {
  id: string;
  name: string;
  industry: string | null;
  sizeLabel: string | null;
  owner: { id: string; name: string } | null;
  stageName: string | null;
  amount: string | null;
  leadScore: number | null;
  lastActivityAt: Date | null;
};

export function ProspectsTable({ rows }: { rows: ProspectRow[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une entreprise…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entreprise</TableHead>
            <TableHead>Secteur</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Commercial</TableHead>
            <TableHead>Étape</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Lead score</TableHead>
            <TableHead>Dernière activité</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link href={`/prospects/${row.id}`} className="font-medium hover:underline">
                  {row.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.industry ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{row.sizeLabel ?? "—"}</TableCell>
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
              <TableCell>{row.stageName ? <Badge variant="secondary">{row.stageName}</Badge> : "—"}</TableCell>
              <TableCell>{formatCurrency(row.amount)}</TableCell>
              <TableCell>
                {row.leadScore !== null ? (
                  <Badge variant={row.leadScore >= 60 ? "success" : row.leadScore >= 30 ? "warning" : "outline"}>
                    {row.leadScore}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatRelative(row.lastActivityAt)}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                Aucune entreprise ne correspond à votre recherche.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
