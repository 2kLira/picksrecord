"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getPick } from "@/lib/queries";
import { pickSchema, parlayLegsSchema, type ParlayLegInput } from "@/lib/validation";
import { combineParlayOdds, potentialReturn, settledProfit } from "@/lib/odds";
import type { OddsFormat, PickStatus } from "@/lib/types";
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

/** Validate parlay legs posted as a JSON string under the `legs` field. */
function parseLegs(formData: FormData) {
  const raw = formData.get("legs");
  let json: unknown = [];
  try {
    json = JSON.parse(typeof raw === "string" ? raw : "[]");
  } catch {
    json = [];
  }
  return parlayLegsSchema.safeParse(json);
}

/**
 * For a parlay, derive the stored odds, a selection summary, and the legs JSON from the
 * individual legs. For single picks, returns the submitted odds/selection unchanged.
 */
function resolveParlay(
  pickType: string,
  legs: ParlayLegInput[] | null,
  oddsFormat: OddsFormat,
  odds: number,
  selection: string,
): { odds: number; selection: string; legsJson: string | null } {
  if (pickType !== "parlay" || !legs) {
    return { odds, selection, legsJson: null };
  }
  return {
    odds: combineParlayOdds(legs.map((l) => l.odds), oddsFormat),
    selection: legs.map((l) => l.selection).join(" + ").slice(0, 160),
    legsJson: JSON.stringify(legs),
  };
}

export async function createPickAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  // Validate parlay legs first so leg errors take priority over the generic odds check.
  let legs: ParlayLegInput[] | null = null;
  if (formData.get("pick_type") === "parlay") {
    const legsParsed = parseLegs(formData);
    if (!legsParsed.success) {
      return { fieldErrors: { legs: legsParsed.error.issues[0]?.message ?? "Add your selections" } };
    }
    legs = legsParsed.data;
  }

  const parsed = parsePick(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  // Verify the event belongs to the user.
  const owns = (await sql`
    select id from events where id = ${d.event_id} and created_by = ${user.id}
  `) as { id: string }[];
  if (owns.length === 0) return { error: "Event not found" };

  const { odds, selection, legsJson } = resolveParlay(d.pick_type, legs, d.odds_format, d.odds, d.selection);
  const profit = settledProfit(d.status, d.stake, odds, d.odds_format);
  const potential = potentialReturn(d.stake, odds, d.odds_format);
  const settledAt = d.status === "pending" ? null : new Date().toISOString();

  await sql`
    insert into picks (user_id, event_id, match_name, selection, pick_type, stake, odds,
                       odds_format, status, notes, profit, potential_return, legs, settled_at)
    values (${user.id}, ${d.event_id}, ${d.match_name}, ${selection}, ${d.pick_type},
            ${d.stake}, ${odds}, ${d.odds_format}, ${d.status}, ${d.notes || null},
            ${profit}, ${potential}, ${legsJson}::jsonb, ${settledAt})
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

  let legs: ParlayLegInput[] | null = null;
  if (formData.get("pick_type") === "parlay") {
    const legsParsed = parseLegs(formData);
    if (!legsParsed.success) {
      return { fieldErrors: { legs: legsParsed.error.issues[0]?.message ?? "Add your selections" } };
    }
    legs = legsParsed.data;
  }

  const parsed = parsePick(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  const { odds, selection, legsJson } = resolveParlay(d.pick_type, legs, d.odds_format, d.odds, d.selection);
  const profit = settledProfit(d.status, d.stake, odds, d.odds_format);
  const potential = potentialReturn(d.stake, odds, d.odds_format);
  const settledAt =
    d.status === "pending"
      ? null
      : existing.settled_at ?? new Date().toISOString();

  await sql`
    update picks
    set match_name = ${d.match_name}, selection = ${selection}, pick_type = ${d.pick_type},
        stake = ${d.stake}, odds = ${odds}, odds_format = ${d.odds_format},
        status = ${d.status}, notes = ${d.notes || null}, profit = ${profit},
        potential_return = ${potential}, legs = ${legsJson}::jsonb, settled_at = ${settledAt}, updated_at = now()
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
