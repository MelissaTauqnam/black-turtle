"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { activityLog, deals, pipelineStages } from "@/db/schema";
import { getCurrentUser, getVisibleOwnerIds } from "@/lib/auth";
import { canViewOwner } from "@/lib/permissions";
import { defaultProbabilityForStage } from "@/lib/pipeline";
import { updateDealStageSchema, type UpdateDealStageInput } from "@/lib/validations/deals";

export async function updateDealStage(input: UpdateDealStageInput) {
  const parsed = updateDealStageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Entrée invalide." };
  }
  const { dealId, stageId, lostReason } = parsed.data;

  const currentUser = await getCurrentUser();
  const scope = await getVisibleOwnerIds(currentUser);

  const deal = await db.query.deals.findFirst({ where: eq(deals.id, dealId) });
  if (!deal) return { success: false as const, error: "Deal introuvable." };
  if (!canViewOwner(scope, deal.ownerId)) {
    return { success: false as const, error: "Action non autorisée pour ce deal." };
  }

  const stage = await db.query.pipelineStages.findFirst({ where: eq(pipelineStages.id, stageId) });
  if (!stage) return { success: false as const, error: "Étape introuvable." };

  if (stage.isLost && !lostReason) {
    return {
      success: false as const,
      error: "Un motif de perte est requis pour marquer ce deal comme perdu.",
    };
  }

  const status = stage.isWon ? ("won" as const) : stage.isLost ? ("lost" as const) : ("open" as const);
  const probability = defaultProbabilityForStage(stage);

  await db
    .update(deals)
    .set({
      stageId: stage.id,
      status,
      probability,
      lostReason: stage.isLost ? (lostReason ?? null) : null,
      updatedAt: new Date(),
    })
    .where(eq(deals.id, dealId));

  await db.insert(activityLog).values({
    userId: currentUser.id,
    action: `Changement d'étape du deal vers « ${stage.name} »`,
    entityType: "deal",
    entityId: dealId,
  });

  revalidatePath("/pipeline");
  revalidatePath(`/prospects/${deal.companyId}`);
  revalidatePath(`/clients/${deal.companyId}`);

  return { success: true as const };
}
