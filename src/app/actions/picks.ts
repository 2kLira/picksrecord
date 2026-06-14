"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getPick } from "@/lib/queries";
import { pickSchema } from "@/lib/validation";
import { potentialReturn, settledProfit } from "@/lib/odds";
import type { PickStatus } from "@/lib/types";
import type { ActionState } from "./auth";

function parsePick(formData: FormData) {
  return pickSchema.safeParse({
    event_id: formData.get("event_id"),
    match_name: formData.get("match_name"),
    selection: formData.get("selection"),
    pick_type: formData.get("pick_type"),
    stake: formData.get("stake"),
    odds: formData.get("odds"),
    odds_format: formData.get("odds_format"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? "",
  });
}

function fieldErrors(error: { issues: { path: (string | number)[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] = issue.message;
  return out;
}

export async function createPickAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parsePick(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  // Verify the event belongs to the user.
  const owns = (await sql`
    select id from events where id = ${d.event_id} and created_by = ${user.id}
  `) as { id: string }[];
  if (owns.length === 0) return { error: "Event not found" };

  const profit = settledProfit(d.status, d.stake, d.odds, d.odds_format);
  const potential = potentialReturn(d.stake, d.odds, d.odds_format);
  const settledAt = d.status === "pending" ? null : new Date().toISOString();

  await sql`
    insert into picks (user_id, event_id, match_name, selection, pick_type, stake, odds,
                       odds_format, status, notes, profit, potential_return, settled_at)
    values (${user.id}, ${d.event_id}, ${d.match_name}, ${d.selection}, ${d.pick_type},
            ${d.stake}, ${d.odds}, ${d.odds_format}, ${d.status}, ${d.notes || null},
            ${profit}, ${potential}, ${settledAt})
  `;

  revalidatePath(`/events/${d.event_id}`);
  revalidatePath("/dashboard");
  redirect(`/events/${d.event_id}`);
}

export async function updatePickAction(
  pickId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await getPick(user.id, pickId);
  if (!existing) return { error: "Pick not found" };

  const parsed = parsePick(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  const profit = settledProfit(d.status, d.stake, d.odds, d.odds_format);
  const potential = potentialReturn(d.stake, d.odds, d.odds_format);
  const settledAt =
    d.status === "pending"
      ? null
      : existing.settled_at ?? new Date().toISOString();

  await sql`
    update picks
    set match_name = ${d.match_name}, selection = ${d.selection}, pick_type = ${d.pick_type},
        stake = ${d.stake}, odds = ${d.odds}, odds_format = ${d.odds_format},
        status = ${d.status}, notes = ${d.notes || null}, profit = ${profit},
        potential_return = ${potential}, settled_at = ${settledAt}, updated_at = now()
    where id = ${pickId} and user_id = ${user.id}
  `;

  revalidatePath(`/events/${existing.event_id}`);
  revalidatePath("/dashboard");
  redirect(`/events/${existing.event_id}`);
}

/**
 * Settle a pick with an optional custom payout.
 * When `profitOverride` is provided (e.g. the user types the exact amount won
 * after a partial cashout), it wins over the odds-computed profit.
 */
export async function settlePickAction(
  pickId: string,
  status: PickStatus,
  profitOverride?: number,
): Promise<void> {
  const user = await requireUser();
  const existing = await getPick(user.id, pickId);
  if (!existing) return;

  const computed = settledProfit(status, existing.stake, existing.odds, existing.odds_format);
  const profit =
    status !== "pending" && profitOverride !== undefined && Number.isFinite(profitOverride)
      ? Math.round((profitOverride + Number.EPSILON) * 100) / 100
      : computed;
  const settledAt = status === "pending" ? null : new Date().toISOString();

  await sql`
    update picks
    set status = ${status}, profit = ${profit}, settled_at = ${settledAt}, updated_at = now()
    where id = ${pickId} and user_id = ${user.id}
  `;

  revalidatePath(`/events/${existing.event_id}`);
  revalidatePath("/dashboard");
}

export async function deletePickAction(pickId: string): Promise<void> {
  const user = await requireUser();
  const existing = await getPick(user.id, pickId);
  if (!existing) return;

  await sql`delete from picks where id = ${pickId} and user_id = ${user.id}`;
  revalidatePath(`/events/${existing.event_id}`);
  revalidatePath("/dashboard");
}
