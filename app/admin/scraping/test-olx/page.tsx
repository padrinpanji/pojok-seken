import { redirect } from "next/navigation";
import { hasSuperadminSession } from "@/lib/superadmin-auth";
import TestOlxClient from "./TestOlxClient";

export default async function TestOlxPage() {
  // Check authentication
  if (!(await hasSuperadminSession())) {
    redirect("/auth");
  }

  // Render client component if authenticated
  return <TestOlxClient />;
}
