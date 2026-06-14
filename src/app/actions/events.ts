"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getEvent } from "@/lib/queries";
import { eventSchema } from "@/lib/validation";
import type { ActionState } from "./auth";

function eventFromForm(formData: FormData) {
  return eventSchema.safeParse({
    name: formData.get("name"),
    sport: formData.get("sport"),
    description: formData.get("description") ?? "",
    color: formData.get("color") || "#46E6A4",
    event_date: formData.get("event_date") ?? "",
  });
}

export async function createEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = eventFromForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const { name, sport, description, color, event_date } = parsed.data;
  const rows = (await sql`
    insert into events (created_by, name, sport, description, color, event_date)
    values (${user.id}, ${name}, ${sport}, ${description || null}, ${color},
            ${event_date ? event_date : null})
    returning id
  `) as { id: string }[];

  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect(`/events/${rows[0].id}`);
}

export async function updateEventAction(
  eventId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await getEvent(user.id, eventId);
  if (!existing) return { error: "Event not found" };

  const parsed = eventFromForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const { name, sport, description, color, event_date } = parsed.data;
  await sql`
    update events
    set name = ${name}, sport = ${sport}, description = ${description || null},
        color = ${color}, event_date = ${event_date ? event_date : null}, updated_at = now()
    where id = ${eventId} and created_by = ${user.id}
  `;

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  return {};
}

export async function deleteEventAction(eventId: string): Promise<void> {
  const user = await requireUser();
  await sql`delete from events where id = ${eventId} and created_by = ${user.id}`;
  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect("/events");
}
