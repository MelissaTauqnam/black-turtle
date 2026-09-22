import { getCurrentUser, getVisibleOwnerIds } from "@/lib/auth";
import { listCompanies } from "@/lib/queries/companies";
import { ProspectsTable, type ProspectRow } from "@/components/companies/prospects-table";

export default async function ProspectsPage() {
  const currentUser = await getCurrentUser();
  const scope = await getVisibleOwnerIds(currentUser);
  const companies = await listCompanies("prospect", scope);

  const rows: ProspectRow[] = companies.map((c) => {
    const latestDeal = c.deals[0] ?? null;
    return {
      id: c.id,
      name: c.name,
      industry: c.industry,
      sizeLabel: c.sizeLabel,
      owner: c.owner ? { id: c.owner.id, name: c.owner.name } : null,
      stageName: latestDeal?.stage.name ?? null,
      amount: latestDeal?.amount ?? null,
      leadScore: c.scores[0]?.value ?? null,
      lastActivityAt: c.interactions[0]?.occurredAt ?? null,
    };
  });

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">Prospects</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} entreprise{rows.length > 1 ? "s" : ""} prospect{rows.length > 1 ? "s" : ""}
        </p>
      </div>
      <ProspectsTable rows={rows} />
    </div>
  );
}
