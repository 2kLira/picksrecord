import "server-only";
import { sql } from "./db";
import type { EventWithStats, Pick, SportEvent } from "./types";
import { computeStats } from "./stats";

/** Neon returns numeric/decimal columns as strings — coerce to numbers. */
function mapPick(row: Record<string, unknown>): Pick {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    event_id: row.event_id as string,
    match_name: row.match_name as string,
    selection: row.selection as string,
    pick_type: row.pick_type as Pick["pick_type"],
    stake: Number(row.stake),
    odds: Number(row.odds),
    odds_format: row.odds_format as Pick["odds_format"],
    status: row.status as Pick["status"],
    notes: (row.notes as string | null) ?? null,
    profit: Number(row.profit),
    potential_return: Number(row.potential_return),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    settled_at: (row.settled_at as string | null) ?? null,
  };
}

export async function getEvent(userId: string, eventId: string): Promise<SportEvent | null> {
  const rows = (await sql`
    select * from events where id = ${eventId} and created_by = ${userId}
  `) as SportEvent[];
  return rows[0] ?? null;
}

export async function getEventsWithStats(userId: string): Promise<EventWithStats[]> {
  const events = (await sql`
    select * from events where created_by = ${userId} order by created_at desc
  `) as SportEvent[];

  if (events.length === 0) return [];

  const picks = await getPicksForUser(userId);
  const byEvent = new Map<string, Pick[]>();
  for (const p of picks) {
    const list = byEvent.get(p.event_id) ?? [];
    list.push(p);
    byEvent.set(p.event_id, list);
  }

  return events.map((e) => ({
    ...e,
    stats: computeStats(byEvent.get(e.id) ?? []),
  }));
}

export async function getEventOptions(userId: string): Promise<{ id: string; name: string }[]> {
  return (await sql`
    select id, name from events where created_by = ${userId} order by created_at desc
  `) as { id: string; name: string }[];
}

export async function getPicksForUser(userId: string): Promise<Pick[]> {
  const rows = (await sql`
    select * from picks where user_id = ${userId} order by created_at desc
  `) as Record<string, unknown>[];
  return rows.map(mapPick);
}

export async function getPicksForEvent(userId: string, eventId: string): Promise<Pick[]> {
  const rows = (await sql`
    select * from picks
    where user_id = ${userId} and event_id = ${eventId}
    order by created_at desc
  `) as Record<string, unknown>[];
  return rows.map(mapPick);
}

export async function getPick(userId: string, pickId: string): Promise<Pick | null> {
  const rows = (await sql`
    select * from picks where id = ${pickId} and user_id = ${userId}
  `) as Record<string, unknown>[];
  return rows[0] ? mapPick(rows[0]) : null;
}
