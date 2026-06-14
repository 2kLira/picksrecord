"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { onboardingSchema, profileSchema } from "@/lib/validation";
import type { ActionState } from "./auth";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    preferred_odds_format: formData.get("preferred_odds_format"),
    currency: formData.get("currency"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, preferred_odds_format, currency } = parsed.data;
  await sql`
    update users
    set name = ${name},
        preferred_odds_format = ${preferred_odds_format},
        currency = ${currency},
        updated_at = now()
    where id = ${user.id}
  `;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const favorites = formData.getAll("favorite_sports").map(String);

  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    preferred_odds_format: formData.get("preferred_odds_format"),
    currency: formData.get("currency"),
    favorite_sports: favorites,
  });

  if (!parsed.success) {
    redirect("/onboarding?error=1");
  }

  const { name, preferred_odds_format, currency, favorite_sports } = parsed.data;
  await sql`
    update users
    set name = ${name},
        preferred_odds_format = ${preferred_odds_format},
        currency = ${currency},
        favorite_sports = ${favorite_sports},
        onboarded = true,
        updated_at = now()
    where id = ${user.id}
  `;

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
