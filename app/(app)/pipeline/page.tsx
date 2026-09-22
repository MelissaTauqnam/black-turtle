import { getCurrentUser, getVisibleOwnerIds } from "@/lib/auth";
import { getPipelineBoardData } from "@/lib/queries/pipeline";
import { PipelineView } from "@/components/pipeline/pipeline-view";

export default async function PipelinePage() {
  const currentUser = await getCurrentUser();
  const scope = await getVisibleOwnerIds(currentUser);
  const { stages, deals } = await getPipelineBoardData(scope);

  const ownersMap = new Map<string, { id: string; name: string }>();
  for (const deal of deals) {
    if (deal.owner) ownersMap.set(deal.owner.id, { id: deal.owner.id, name: deal.owner.name });
  }

  return (
    <div className="h-full">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          {deals.length} deal{deals.length > 1 ? "s" : ""} dans votre périmètre
        </p>
      </div>
      <PipelineView stages={stages} deals={deals} owners={[...ownersMap.values()]} />
    </div>
  );
}
