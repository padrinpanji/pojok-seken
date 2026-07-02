"use server";

import { redirect } from "next/navigation";
import {
  clearSuperadminSession,
  createSuperadminSession,
  isSuperadminCredential
} from "@/lib/superadmin-auth";

export async function loginSuperadmin(formData: FormData) {
  const username = String(formData.get("loginEmail") || "").trim();
  const password = String(formData.get("loginPassword") || "");
  const remember = formData.get("rememberMe") === "on";

  if (!isSuperadminCredential(username, password)) {
    redirect("/auth?error=invalid");
  }

  await createSuperadminSession(remember);
  redirect("/admin");
}

export async function logoutSuperadmin() {
  await clearSuperadminSession();
  redirect("/auth");
}
