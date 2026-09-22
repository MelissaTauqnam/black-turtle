"use client";

import * as React from "react";
import { ChevronsUpDown, LogOut, UserCircle2 } from "lucide-react";

import { selectUser, signOut } from "@/lib/actions/session";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type SwitcherUser = { id: string; name: string; role: string; jobTitle: string | null };

export function RoleSwitcher({
  currentUser,
  allUsers,
}: {
  currentUser: SwitcherUser;
  allUsers: SwitcherUser[];
}) {
  const [pending, startTransition] = React.useTransition();
  const others = allUsers.filter((u) => u.id !== currentUser.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
          disabled={pending}
        >
          <Avatar className="size-8">
            <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate font-medium">{currentUser.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[currentUser.role]}
            </span>
          </div>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserCircle2 className="size-4" />
          Connecté en tant que
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          <Badge variant="secondary">{ROLE_LABELS[currentUser.role]}</Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Basculer vers (auth simulée V1)
        </DropdownMenuLabel>
        {others.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onSelect={() =>
              startTransition(() => {
                void selectUser(user.id, "/ma-journee");
              })
            }
          >
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() =>
            startTransition(() => {
              void signOut();
            })
          }
        >
          <LogOut className="size-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
