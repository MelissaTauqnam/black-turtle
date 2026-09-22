import { getCurrentUser, getVisibleOwnerIds } from "@/lib/auth";
import { isChurnRisk } from "@/lib/alerts";
import { listCompanies } from "@/lib/queries/companies";
import { ClientsTable, type ClientRow } from "@/components/companies/clients-table";

export default async function ClientsPage() {
  const currentUser = await getCurrentUser();
  const scope = await getVisibleOwnerIds(currentUser);
  const companies = await listCompanies("client", scope);

  const rows: ClientRow[] = companies.map((c) => {
    const usage = c.productUsageSnapshots[0] ?? null;
    return {
      id: c.id,
      name: c.name,
      industry: c.industry,
      owner: c.owner ? { id: c.owner.id, name: c.owner.name } : null,
      plan: usage?.plan ?? null,
      mrr: usage?.mrr ?? null,
      healthScore: c.scores[0]?.value ?? null,
      lastLoginAt: usage?.lastLoginAt ?? null,
      churnRisk: isChurnRisk(usage?.lastLoginAt ?? null),
    };
  });

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} compte{rows.length > 1 ? "s" : ""} client{rows.length > 1 ? "s" : ""}
        </p>
      </div>
      <ClientsTable rows={rows} />
    </div>
  );
}
