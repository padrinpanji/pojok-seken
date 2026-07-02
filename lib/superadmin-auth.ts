import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SUPERADMIN_USERNAME = "admin";
const SUPERADMIN_PASSWORD = "@dm1nS$K3N";
const SESSION_COOKIE = "pojok_seken_superadmin";
const SESSION_SECRET = process.env.SUPERADMIN_SESSION_SECRET || "pojok-seken-superadmin-session-v1";
const SESSION_SUBJECT = "superadmin";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signSession(subject: string) {
  return createHmac("sha256", SESSION_SECRET).update(subject).digest("hex");
}

function createSessionToken() {
  return `${SESSION_SUBJECT}.${signSession(SESSION_SUBJECT)}`;
}

export function isSuperadminCredential(username: string, password: string) {
  return safeEqual(username, SUPERADMIN_USERNAME) && safeEqual(password, SUPERADMIN_PASSWORD);
}

export async function createSuperadminSession(remember: boolean) {
  const cookieStore = await cookies();
  const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 8;

  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function clearSuperadminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function hasSuperadminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  return safeEqual(token, createSessionToken());
}
