import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, TrendingUp, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { EquityChart } from "@/components/charts/EquityChart";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedBackground } from "@/components/motion/AnimatedBackground";
import { CardNav } from "@/components/CardNav";
import type { EquityPoint } from "@/lib/stats";

const SAMPLE: EquityPoint[] = [0, 120, 60, 240, 180, 360, 320, 520, 610, 540, 760, 920].map((value, index) => ({
  index,
  value,
  date: "",
}));

export default async function Landing() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const t = await getT();

  const features = [
    { icon: TrendingUp, title: t.landing.f1Title, body: t.landing.f1Body },
    { icon: Layers, title: t.landing.f2Title, body: t.landing.f2Body },
    { icon: ShieldCheck, title: t.landing.f3Title, body: t.landing.f3Body },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <header className="relative py-6">
        <CardNav
          ctaLabel={t.landing.getStarted}
          ctaHref="/register"
          items={[
            {
              label: t.brand.eyebrow,
              links: [
                { label: t.landing.f1Title, href: "#features" },
                { label: t.landing.f3Title, href: "#features" },
              ],
            },
            {
              label: t.nav.profile,
              links: [
                { label: t.common.signIn, href: "/login" },
                { label: t.landing.getStarted, href: "/register" },
              ],
            },
          ]}
        />
      </header>

      <main className="relative mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-hair bg-surface/60 px-3 py-1 font-mono text-xs uppercase tracking-widest text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {t.landing.badge}
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {t.landing.titleA} <br /> {t.landing.titleB} <span className="text-gradient">{t.landing.titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">{t.landing.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-[2px] bg-brand px-5 py-3 font-semibold text-base transition hover:brightness-110 active:scale-[0.98]"
              >
                {t.landing.ctaPrimary} <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="rounded-[2px] px-5 py-3 font-medium text-fg hairline-faint transition hover:[box-shadow:var(--shadow-hairline)] active:scale-[0.98]"
              >
                {t.common.signIn}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="card glow-brand p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-faint">{t.landing.equityCurve}</span>
                <span className="font-mono text-sm font-semibold text-won">+$920.00</span>
              </div>
              <div className="mt-4">
                <EquityChart points={SAMPLE} height={200} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-hair pt-4 text-center">
                {[
                  [t.landing.roi, "+18.4%"],
                  [t.landing.winRate, "61%"],
                  [t.landing.streak, "W4"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="font-mono text-lg font-semibold text-fg">{v}</div>
                    <div className="text-xs text-faint">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="grid gap-4 pb-24 sm:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="card h-full p-6">
                <f.icon className="text-brand" size={22} />
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </section>
      </main>
    </div>
  );
}
