import { describe, expect, it } from "vitest";

import { canViewOwner, isAdmin, isManagerOrAdmin, visibleOwnerIds } from "./permissions";
import type { SimUser } from "./permissions";

function makeUser(overrides: Partial<SimUser>): SimUser {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "commercial",
    teamId: null,
    avatarSeed: "test",
    jobTitle: null,
    monthlyTargetAmount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("visibleOwnerIds", () => {
  it("un commercial ne voit que ses propres fiches", () => {
    const commercial = makeUser({ id: "commercial-1", role: "commercial" });
    const scope = visibleOwnerIds(commercial, ["commercial-1", "commercial-2", "commercial-3"]);
    expect(scope).toEqual(["commercial-1"]);
  });

  it("un manager voit toute son équipe", () => {
    const manager = makeUser({ id: "manager-1", role: "manager" });
    const teamIds = ["manager-1", "commercial-1", "commercial-2"];
    const scope = visibleOwnerIds(manager, teamIds);
    expect(scope).toEqual(expect.arrayContaining(teamIds));
    expect(scope).toHaveLength(teamIds.length);
  });

  it("un admin voit tout ('all')", () => {
    const admin = makeUser({ id: "admin-1", role: "admin" });
    const scope = visibleOwnerIds(admin, ["commercial-1", "commercial-2"]);
    expect(scope).toBe("all");
  });
});

describe("canViewOwner", () => {
  it("refuse l'accès à un owner hors scope", () => {
    expect(canViewOwner(["commercial-1"], "commercial-2")).toBe(false);
  });

  it("autorise l'accès à un owner dans le scope", () => {
    expect(canViewOwner(["commercial-1", "commercial-2"], "commercial-2")).toBe(true);
  });

  it("autorise tout quand le scope est 'all'", () => {
    expect(canViewOwner("all", "n'importe-qui")).toBe(true);
  });

  it("refuse quand ownerId est null", () => {
    expect(canViewOwner(["commercial-1"], null)).toBe(false);
  });
});

describe("rôles", () => {
  it("isManagerOrAdmin distingue correctement les rôles", () => {
    expect(isManagerOrAdmin(makeUser({ role: "manager" }))).toBe(true);
    expect(isManagerOrAdmin(makeUser({ role: "admin" }))).toBe(true);
    expect(isManagerOrAdmin(makeUser({ role: "commercial" }))).toBe(false);
  });

  it("isAdmin ne retourne vrai que pour un admin", () => {
    expect(isAdmin(makeUser({ role: "admin" }))).toBe(true);
    expect(isAdmin(makeUser({ role: "manager" }))).toBe(false);
  });
});
