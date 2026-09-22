import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { companies, deals, interactions } from "@/db/schema";
import { canViewOwner } from "@/lib/permissions";

function scopeFilter(scope: string[] | "all", column: typeof companies.ownerId) {
  return scope === "all" ? undefined : inArray(column, scope);
}

export async function listCompanies(status: "prospect" | "client", scope: string[] | "all") {
  const rows = await db.query.companies.findMany({
    where: and(eq(companies.status, status), scopeFilter(scope, companies.ownerId)),
    with: {
      owner: true,
      deals: { with: { stage: true }, orderBy: (d, { desc: d2 }) => d2(d.createdAt) },
      scores: { orderBy: (s, { desc: d2 }) => d2(s.computedAt), limit: 1 },
      productUsageSnapshots: {
        orderBy: (u, { desc: d2 }) => d2(u.snapshotAt),
        limit: 1,
      },
      interactions: {
        columns: { occurredAt: true },
        orderBy: (i, { desc: d2 }) => d2(i.occurredAt),
        limit: 1,
      },
    },
    orderBy: (c, { desc: d2 }) => d2(c.updatedAt),
  });

  return rows;
}

export async function getCompanyDetail(companyId: string, scope: string[] | "all") {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: {
      owner: true,
      contacts: { orderBy: (c, { desc: d2 }) => d2(c.isPrimary) },
      deals: { with: { stage: true }, orderBy: (d, { desc: d2 }) => d2(d.createdAt) },
      tasks: { orderBy: (t, { asc }) => asc(t.dueDate) },
      notes: { with: { author: true }, orderBy: (n, { desc: d2 }) => d2(n.createdAt) },
      productUsageSnapshots: { orderBy: (u, { desc: d2 }) => d2(u.snapshotAt) },
      billingEvents: { orderBy: (b, { desc: d2 }) => d2(b.occurredAt) },
      supportTickets: { orderBy: (s2, { desc: d2 }) => d2(s2.openedAt) },
      scores: { orderBy: (s2, { desc: d2 }) => d2(s2.computedAt) },
    },
  });

  if (!company) return null;
  if (!canViewOwner(scope, company.ownerId)) return "forbidden" as const;

  const companyInteractions = await db.query.interactions.findMany({
    where: eq(interactions.companyId, companyId),
    with: { contact: true, deal: true },
    orderBy: (i, { desc: d2 }) => d2(i.occurredAt),
  });

  const contactIds = company.contacts.map((c) => c.id);
  const companyEmails = contactIds.length
    ? await db.query.emails.findMany({
        where: (e, { inArray: ia }) => ia(e.contactId, contactIds),
        with: { contact: true, sequenceStep: { with: { sequence: true } } },
        orderBy: (e, { desc: d2 }) => d2(e.createdAt),
      })
    : [];

  return { ...company, interactions: companyInteractions, emails: companyEmails };
}

export async function getPipelineDeals(scope: string[] | "all") {
  return db.query.deals.findMany({
    where: scope === "all" ? undefined : inArray(deals.ownerId, scope),
    with: {
      company: true,
      stage: true,
      owner: true,
    },
    orderBy: (d, { desc: d2 }) => d2(d.createdAt),
  });
}
