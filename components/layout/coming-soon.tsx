import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">Arrive en {phase}.</p>
    </div>
  );
}
