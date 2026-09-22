import { z } from "zod";

export const updateDealStageSchema = z.object({
  dealId: z.string().uuid(),
  stageId: z.string().uuid(),
  lostReason: z.string().trim().min(3).max(300).optional(),
});

export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
