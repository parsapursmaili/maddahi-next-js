// /app/admin/soogname/page.js

import { isAuthenticated } from "@/app/maddahi/actions/auth";
import { redirect } from "next/navigation";
import SoognameManager from "@/app/maddahi/components/admin/soogname/SoognameManager";

export default async function AdminSoognamePage() {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect("/maddahi/login");
  }

  return <SoognameManager />;
}
