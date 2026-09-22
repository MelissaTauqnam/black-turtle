import type { LucideIcon } from "lucide-react";
import { BarChart3, Building2, Gift, Kanban, Mail, Settings, Sparkles, Users } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  managerOnly?: boolean;
  adminOnly?: boolean;
};

export const mainNav: NavItem[] = [
  { href: "/ma-journee", label: "Ma journée", icon: Sparkles },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/prospects", label: "Prospects", icon: Users },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/sequences", label: "Séquences", icon: Mail },
  { href: "/lead-magnets", label: "Lead magnets", icon: Gift },
  { href: "/performance", label: "Performance", icon: BarChart3 },
];

export const adminNav: NavItem[] = [
  { href: "/admin/utilisateurs", label: "Utilisateurs & objectifs", icon: Settings, adminOnly: true },
  { href: "/admin/pipeline", label: "Pipeline & scoring", icon: Settings, adminOnly: true },
  { href: "/admin/integrations", label: "Intégrations", icon: Settings, adminOnly: true },
  { href: "/admin/audit", label: "Journal d'audit", icon: Settings, adminOnly: true },
];
