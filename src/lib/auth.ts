import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";
import type { User } from "./types";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";

const BCRYPT_ROUNDS = 12;

/** Hash a plaintext password. Never store the plaintext. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Compare a plaintext password against a stored hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionCookie(userId: string): Promise<void> {
  const token = await signSession({ userId });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Resolve the current user from the session cookie, or null. Public-safe shape. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  // Never select password_hash — only public-safe columns.
  const rows = (await sql`
    select id, name, email, preferred_odds_format, currency,
           favorite_sports, onboarded, created_at, updated_at
    from users where id = ${session.userId}
  `) as User[];

  return rows[0] ?? null;
}

/** Use in protected pages/actions. Redirects to /login when there is no valid session. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
