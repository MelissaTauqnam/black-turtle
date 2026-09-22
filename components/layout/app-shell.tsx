"use client";

import * as React from "react";
import { Menu, Search } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ShellUser = { id: string; name: string; role: string; jobTitle: string | null };

export function AppShell({
  currentUser,
  allUsers,
  children,
}: {
  currentUser: ShellUser;
  allUsers: ShellUser[];
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav role={currentUser.role} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav role={currentUser.role} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Ouvrir la navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-4" />
          </Button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground shadow-sm hover:bg-accent/50"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Rechercher un contact, une entreprise…</span>
            <span className="sm:hidden">Rechercher…</span>
            <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <RoleSwitcher currentUser={currentUser} allUsers={allUsers} />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
