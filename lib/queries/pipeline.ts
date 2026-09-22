import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { interactions } from "@/db/schema";
import { getPipelineDeals } from "@/lib/queries/companies";

export async function getPipelineBoardData(scope: string[] | "all") {
  const [stages, dealRows] = await Promise.all([
    db.query.pipelineStages.findMany({ orderBy: (s, { asc }) => asc(s.order) }),
    getPipelineDeals(scope),
  ]);

  const companyIds = [...new Set(dealRows.map((d) => d.companyId))];
  const lastInteractionByCompany = new Map<string, Date>();

  if (companyIds.length) {
    const rows = await db.query.interactions.findMany({
      where: inArray(interactions.companyId, companyIds),
      columns: { companyId: true, occurredAt: true },
    });
    for (const row of rows) {
      const existing = lastInteractionByCompany.get(row.companyId);
      if (!existing || row.occurredAt > existing) {
        lastInteractionByCompany.set(row.companyId, row.occurredAt);
      }
    }
  }

  const deals = dealRows.map((deal) => ({
    ...deal,
    lastActivityAt: lastInteractionByCompany.get(deal.companyId) ?? null,
  }));

  return { stages, deals };
}

export type PipelineStage = Awaited<ReturnType<typeof getPipelineBoardData>>["stages"][number];
export type PipelineDeal = Awaited<ReturnType<typeof getPipelineBoardData>>["deals"][number];
