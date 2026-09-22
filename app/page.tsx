import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CURRENT_USER_COOKIE } from "@/lib/auth";

export default async function RootPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(CURRENT_USER_COOKIE)?.value;
  redirect(hasSession ? "/ma-journee" : "/login");
}
