import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const sql = neon(process.env.DATABASE_URL);
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const email = `authtest_${Date.now()}@test.local`;

const hash = await bcrypt.hash("password123", 12);
const [user] = await sql`
  insert into users (name, email, password_hash, preferred_odds_format, currency, favorite_sports, onboarded)
  values ('Auth Test', ${email}, ${hash}, 'american', 'USD', ${["NBA"]}, true)
  returning id
`;
const [event] = await sql`
  insert into events (created_by, name, sport, color) values (${user.id}, 'Test Slate', 'NBA', '#46e6a4') returning id
`;
await sql`
  insert into picks (user_id, event_id, match_name, selection, pick_type, stake, odds, odds_format, status, profit, potential_return, settled_at)
  values (${user.id}, ${event.id}, 'Lakers @ Celtics', 'Celtics ML', 'moneyline', 100, -110, 'american', 'won', 90.91, 190.91, now()),
         (${user.id}, ${event.id}, 'Heat @ Knicks', 'Over 210.5', 'over_under', 50, 2.0, 'decimal', 'pending', 0, 100, null)
`;

const token = await new SignJWT({ userId: user.id })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("30d")
  .sign(secret);

// Print machine-readable for the shell
console.log(`TOKEN=${token}`);
console.log(`USERID=${user.id}`);
console.log(`EVENTID=${event.id}`);
