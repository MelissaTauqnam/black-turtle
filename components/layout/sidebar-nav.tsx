"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { adminNav, mainNav } from "@/lib/nav-config";

export function SidebarNav({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">Sales Hub</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {mainNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {role === "admin" && (
          <div className="pt-4">
            <div className="flex items-center gap-2 px-2.5 pb-1 text-xs font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
              <Settings className="size-3.5" />
              Administration
            </div>
            {adminNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/50">
        V1 design — données de démonstration
      </div>
    </div>
  );
}
