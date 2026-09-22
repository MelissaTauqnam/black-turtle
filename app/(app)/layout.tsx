import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { CURRENT_USER_COOKIE, getCurrentUser, listAllUsers } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get(CURRENT_USER_COOKIE)?.value) {
    redirect("/login");
  }

  const currentUser = await getCurrentUser();
  const allUsers = await listAllUsers();

  return (
    <AppShell
      currentUser={{
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        jobTitle: currentUser.jobTitle,
      }}
      allUsers={allUsers.map((u) => ({ id: u.id, name: u.name, role: u.role, jobTitle: u.jobTitle }))}
    >
      {children}
    </AppShell>
  );
}
