import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { Logo } from "@/components/Logo";
import { SideNav, MobileNav } from "@/components/app/SideNav";
import { LogoutButton } from "@/components/app/LogoutButton";
import { UserPrefsProvider } from "@/components/app/UserPrefs";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const t = await getT();
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <UserPrefsProvider value={{ name: user.name, currency: user.currency, oddsFormat: user.preferred_odds_format }}>
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-hair bg-base-2/60 p-5 lg:flex">
          <Link href="/dashboard" className="mb-8 px-1">
            <Logo />
          </Link>
          <SideNav />
          <Link
            href="/picks/new"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-[2px] bg-brand px-4 py-2.5 text-sm font-semibold text-base transition hover:brightness-110"
          >
            <Plus size={16} /> {t.common.newPick}
          </Link>
          <div className="mt-auto flex items-center gap-3 rounded-xl border border-hair bg-surface/50 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-elevated font-mono text-xs font-semibold text-brand">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate text-xs text-faint">{user.email}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hair glass px-4 py-3 lg:hidden">
            <Logo />
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <LogoutButton />
            </div>
          </header>

          {/* Desktop top bar */}
          <header className="hidden items-center justify-end gap-3 border-b border-hair px-8 py-3 lg:flex">
            <span className="mr-auto font-mono text-xs uppercase tracking-widest text-faint">
              {user.currency} · {user.preferred_odds_format}
            </span>
            <LanguageToggle />
            <LogoutButton />
          </header>

          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12">{children}</main>
          <MobileNav />
        </div>
      </div>
    </UserPrefsProvider>
  );
}
