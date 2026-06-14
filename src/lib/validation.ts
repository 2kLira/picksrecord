import { z } from "zod";

const oddsFormat = z.enum(["american", "decimal"]);
const currency = z.enum(["USD", "EUR", "GBP", "MXN", "CAD", "BRL"]);

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(80),
  preferred_odds_format: oddsFormat,
  currency,
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  preferred_odds_format: oddsFormat,
  currency,
  favorite_sports: z.array(z.string()).default([]),
});

export const eventSchema = z.object({
  name: z.string().trim().min(1, "Name your event").max(120),
  sport: z.string().trim().min(1, "Pick a sport").max(60),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a color")
    .default("#46E6A4"),
  event_date: z.string().optional().or(z.literal("")),
});

export const parlayLegSchema = z.object({
  selection: z.string().trim().min(1, "Add the selection").max(160),
  odds: z.coerce.number().refine((v) => v !== 0, "Enter valid odds"),
});

export const parlayLegsSchema = z
  .array(parlayLegSchema)
  .min(2, "A parlay needs at least 2 selections");

export const pickSchema = z.object({
  event_id: z.string().uuid("Pick an event"),
  match_name: z.string().trim().min(1, "Add the match or description").max(160),
  selection: z.string().trim().min(1, "Add your selection").max(160),
  pick_type: z.enum(["moneyline", "spread", "over_under", "prop", "parlay", "future", "other"]),
  stake: z.coerce.number().positive("Stake must be greater than 0"),
  odds: z.coerce.number().refine((v) => v !== 0, "Enter valid odds"),
  odds_format: oddsFormat,
  status: z.enum(["pending", "won", "lost", "push"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type PickInput = z.infer<typeof pickSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ParlayLegInput = z.infer<typeof parlayLegSchema>;
