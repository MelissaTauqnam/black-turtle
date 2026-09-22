"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { CURRENT_USER_COOKIE } from "@/lib/auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function selectUser(userId: string, redirectTo = "/ma-journee") {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("Utilisateur introuvable");

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });

  redirect(redirectTo);
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(CURRENT_USER_COOKIE);
  redirect("/login");
}
