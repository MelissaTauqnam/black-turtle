import "server-only";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { visibleOwnerIds, type SimUser } from "@/lib/permissions";

export const CURRENT_USER_COOKIE = "sales_hub_uid";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Auth simulée pour ce V1 "design only" : pas de mot de passe, l'utilisateur courant
 * est choisi via le sélecteur de rôle (voir components/layout/role-switcher.tsx) et
 * stocké dans un cookie. À remplacer par de vraies sessions Supabase Auth quand on
 * branchera le backend réel (voir CLAUDE.md).
 */
export async function getCurrentUser(): Promise<SimUser> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;

  if (userId && UUID_RE.test(userId)) {
    const found = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (found) return found;
  }

  // Pas de session : on retombe sur le premier admin du seed pour que l'app reste utilisable.
  const fallback = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
    orderBy: (u, { asc }) => asc(u.createdAt),
  });

  if (!fallback) {
    throw new Error(
      "Aucun utilisateur en base. Lancez `pnpm db:seed` avant de démarrer l'application."
    );
  }

  return fallback;
}

export async function listAllUsers() {
  return db.query.users.findMany({ orderBy: (u, { asc }) => asc(u.name) });
}

/**
 * Portée de visibilité (liste de owner_id, ou "all") pour l'utilisateur courant,
 * calculée à partir de son équipe réelle en base.
 */
export async function getVisibleOwnerIds(currentUser: SimUser): Promise<string[] | "all"> {
  if (currentUser.role === "admin") return "all";

  if (currentUser.role === "commercial" || !currentUser.teamId) {
    return visibleOwnerIds(currentUser, []);
  }

  const teamMembers = await db.query.users.findMany({
    where: eq(users.teamId, currentUser.teamId),
  });

  return visibleOwnerIds(
    currentUser,
    teamMembers.map((member) => member.id)
  );
}
