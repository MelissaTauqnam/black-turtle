"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateDealStage } from "@/lib/actions/deals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Stage = { id: string; name: string; order: number; isWon: boolean; isLost: boolean };

export function DealStageControl({
  dealId,
  currentStageId,
  stages,
  size = "default",
}: {
  dealId: string;
  currentStageId: string;
  stages: Stage[];
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(currentStageId);
  const [pending, startTransition] = React.useTransition();
  const [lostDialogStage, setLostDialogStage] = React.useState<Stage | null>(null);
  const [lostReason, setLostReason] = React.useState("");

  const sorted = [...stages].sort((a, b) => a.order - b.order);

  function commit(stageId: string, reason?: string) {
    startTransition(async () => {
      const result = await updateDealStage({ dealId, stageId, lostReason: reason });
      if (result.success) {
        setValue(stageId);
        toast.success("Étape mise à jour.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleChange(stageId: string) {
    const stage = sorted.find((s) => s.id === stageId);
    if (!stage) return;
    if (stage.isLost) {
      setLostDialogStage(stage);
      setLostReason("");
      return;
    }
    commit(stageId);
  }

  return (
    <>
      <Select value={value} onValueChange={handleChange} disabled={pending}>
        <SelectTrigger size={size} className="w-full min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sorted.map((stage) => (
            <SelectItem key={stage.id} value={stage.id}>
              {stage.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={!!lostDialogStage} onOpenChange={(open) => !open && setLostDialogStage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer ce deal comme perdu</DialogTitle>
            <DialogDescription>
              Un motif est requis pour passer ce deal en « {lostDialogStage?.name} ».
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="lost-reason">Motif de perte</Label>
            <Textarea
              id="lost-reason"
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Ex : budget insuffisant, parti chez un concurrent…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLostDialogStage(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={lostReason.trim().length < 3 || pending}
              onClick={() => {
                if (!lostDialogStage) return;
                commit(lostDialogStage.id, lostReason.trim());
                setLostDialogStage(null);
              }}
            >
              Confirmer la perte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
