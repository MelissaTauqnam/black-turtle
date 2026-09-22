import type { users } from "@/db/schema";

export type SimUser = typeof users.$inferSelect;

/**
 * Portée de visibilité pour un utilisateur donné : la liste des `ownerId` (users.id)
 * dont il peut voir les fiches/deals/stats, ou `"all"` pour un admin.
 *
 * Utilisée par toutes les requêtes serveur qui filtrent par commercial — c'est la seule
 * ligne de défense tant que Supabase RLS n'est pas branché (voir CLAUDE.md).
 */
export function visibleOwnerIds(
  currentUser: SimUser,
  teamMemberIds: string[]
): string[] | "all" {
  switch (currentUser.role) {
    case "admin":
      return "all";
    case "manager":
      // Un manager voit son équipe (lui inclus si mentionné dans teamMemberIds).
      return teamMemberIds.includes(currentUser.id)
        ? teamMemberIds
        : [...teamMemberIds, currentUser.id];
    case "commercial":
    default:
      return [currentUser.id];
  }
}

export function canViewOwner(scope: string[] | "all", ownerId: string | null): boolean {
  if (scope === "all") return true;
  if (!ownerId) return false;
  return scope.includes(ownerId);
}

export function isManagerOrAdmin(currentUser: Pick<SimUser, "role">): boolean {
  return currentUser.role === "manager" || currentUser.role === "admin";
}

export function isAdmin(currentUser: Pick<SimUser, "role">): boolean {
  return currentUser.role === "admin";
}
