import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/db/client";
import { companies, contacts, deals } from "@/db/schema";
import { getCurrentUser, getVisibleOwnerIds } from "@/lib/auth";
import { searchQuerySchema } from "@/lib/validations/search";

export async function GET(req: NextRequest) {
  const parsed = searchQuerySchema.safeParse({ q: req.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ companies: [], contacts: [], deals: [] });
  }
  const pattern = `%${parsed.data.q}%`;

  const currentUser = await getCurrentUser();
  const scope = await getVisibleOwnerIds(currentUser);
  const ownerCondition = (column: typeof companies.ownerId | typeof deals.ownerId) =>
    scope === "all" ? undefined : inArray(column, scope);

  const [companyResults, contactResults, dealResults] = await Promise.all([
    db
      .select({ id: companies.id, name: companies.name, status: companies.status })
      .from(companies)
      .where(and(ilike(companies.name, pattern), ownerCondition(companies.ownerId)))
      .limit(6),
    db
      .select({
        id: contacts.id,
        name: contacts.name,
        email: contacts.email,
        companyId: contacts.companyId,
        companyName: companies.name,
        companyStatus: companies.status,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.companyId, companies.id))
      .where(
        and(
          or(ilike(contacts.name, pattern), ilike(contacts.email, pattern)),
          ownerCondition(companies.ownerId)
        )
      )
      .limit(6),
    db
      .select({
        id: deals.id,
        name: deals.name,
        amount: deals.amount,
        companyId: deals.companyId,
        companyName: companies.name,
        companyStatus: companies.status,
      })
      .from(deals)
      .leftJoin(companies, eq(deals.companyId, companies.id))
      .where(and(ilike(deals.name, pattern), ownerCondition(deals.ownerId)))
      .limit(6),
  ]);

  return NextResponse.json({
    companies: companyResults,
    contacts: contactResults,
    deals: dealResults,
  });
}
