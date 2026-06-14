"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { clearSessionCookie, createSessionCookie, hashPassword, verifyPassword } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";

export interface ActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsOf(error: { issues: { path: (string | number)[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  const existing = (await sql`select id from users where email = ${email}`) as { id: string }[];
  if (existing.length > 0) {
    return { fieldErrors: { email: "That email is already registered" } };
  }

  // Odds format and currency default in the DB and are set during onboarding.
  const password_hash = await hashPassword(password);
  const rows = (await sql`
    insert into users (name, email, password_hash)
    values (${name}, ${email}, ${password_hash})
    returning id
  `) as { id: string }[];

  await createSessionCookie(rows[0].id);
  redirect("/onboarding");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const { email, password } = parsed.data;
  const rows = (await sql`
    select id, password_hash, onboarded from users where email = ${email}
  `) as { id: string; password_hash: string; onboarded: boolean }[];

  const user = rows[0];
  // Generic error — never reveal whether the email exists.
  const valid = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !valid) {
    return { error: "Invalid credentials" };
  }

  await createSessionCookie(user.id);
  redirect(user.onboarded ? "/dashboard" : "/onboarding");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
