"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/I18nProvider";

const NAV = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/events", key: "events", icon: Trophy },
  { href: "/profile", key: "profile", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop vertical nav. */
export function SideNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-fg" : "text-muted hover:text-fg hover:bg-surface/60",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl border border-brand/25 bg-brand/10"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={18} className={cn("relative z-10", active && "text-brand")} />
            <span className="relative z-10">{t.nav[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom nav. */
export function MobileNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-hair glass md:hidden">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              active ? "text-brand" : "text-muted",
            )}
          >
            <Icon size={20} />
            {t.nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}
