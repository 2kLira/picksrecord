import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const email = `smoke_${Date.now()}@test.local`;

// 1. user with a text[] array param (the risky bit)
const [user] = await sql`
  insert into users (name, email, password_hash, preferred_odds_format, currency, favorite_sports, onboarded)
  values ('Smoke Test', ${email}, 'x', 'american', 'USD', ${["NBA", "NFL"]}, true)
  returning id, favorite_sports
`;
console.log("user.favorite_sports =", user.favorite_sports);

// 2. event
const [event] = await sql`
  insert into events (created_by, name, sport, color)
  values (${user.id}, 'Smoke Cup', 'NBA', '#46e6a4')
  returning id
`;

// 3. picks: american +150 stake 100 -> profit 150; decimal 2.5 stake 100 -> 150
await sql`
  insert into picks (user_id, event_id, match_name, selection, pick_type, stake, odds, odds_format, status, profit, potential_return, settled_at)
  values (${user.id}, ${event.id}, 'A vs B', 'A ML', 'moneyline', 100, 150, 'american', 'won', 150, 250, now()),
         (${user.id}, ${event.id}, 'C vs D', 'Over', 'over_under', 100, 120, 'american', 'lost', -100, 200, now())
`;

const picks = await sql`select status, stake, odds, profit from picks where user_id = ${user.id} order by created_at`;
console.log("picks =", picks.map((p) => ({ ...p, stake: Number(p.stake), profit: Number(p.profit) })));

const [agg] = await sql`
  select sum(profit) as net, sum(stake) as staked from picks where user_id = ${user.id} and status in ('won','lost','push')
`;
console.log("net profit =", Number(agg.net), "staked =", Number(agg.staked));

// 4. cleanup (cascade removes event + picks)
await sql`delete from users where id = ${user.id}`;
const check = await sql`select id from users where id = ${user.id}`;
console.log("cleanup ok =", check.length === 0);
console.log("SMOKE OK");
