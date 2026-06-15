import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { SideNav, MobileNav } from "@/components/app/SideNav";
import { LogoutButton } from "@/components/app/LogoutButton";
import { UserPrefsProvider } from "@/components/app/UserPrefs";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <UserPrefsProvider value={{ name: user.name, currency: user.currency, oddsFormat: user.preferred_odds_format }}>
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
        {/* Sidebar (desktop) — just the dock column */}
        <aside className="sticky top-0 hidden h-screen py-4 pl-4 lg:flex">
          <SideNav user={{ name: user.name, email: user.email }} />
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
