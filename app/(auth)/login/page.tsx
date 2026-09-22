import { Building2 } from "lucide-react";

import { listAllUsers } from "@/lib/auth";
import { selectUser } from "@/lib/actions/session";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
};

const ROLE_ORDER = ["admin", "manager", "commercial"];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function LoginPage() {
  const allUsers = await listAllUsers();
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    users: allUsers.filter((u) => u.role === role),
  })).filter((group) => group.users.length > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sales Hub</h1>
            <p className="text-sm text-muted-foreground">
              Cockpit commercial — choisissez un profil pour continuer (auth simulée, V1
              design).
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.role} className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.users.map((user) => (
                  <Card key={user.id} className="gap-3 py-4">
                    <CardHeader className="flex-row items-center gap-3 px-4">
                      <Avatar className="size-10">
                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-sm">{user.name}</CardTitle>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.jobTitle ?? ROLE_LABELS[user.role]}
                        </p>
                      </div>
                      <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                    </CardHeader>
                    <CardContent className="px-4">
                      <form action={selectUser.bind(null, user.id, "/ma-journee")}>
                        <Button type="submit" size="sm" className="w-full">
                          Se connecter
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
