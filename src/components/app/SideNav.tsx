"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/I18nProvider";
import { Dock, type DockNavItem } from "@/components/motion/Dock";

const NAV = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/events", key: "events", icon: Trophy },
  { href: "/profile", key: "profile", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const LogoMark = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 16.5L8.5 11l3.5 3.5L21 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 6h5v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Desktop sidebar — the entire sidebar is a single vertical magnify dock. */
export function SideNav({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const t = useT();
  const initials = user.name.slice(0, 2).toUpperCase();

  const items: DockNavItem[] = [
    { href: "/dashboard", label: "PicksRecord", icon: <LogoMark />, variant: "logo" },
    ...NAV.map(({ href, key, icon: Icon }) => ({
      href,
      label: t.nav[key],
      active: isActive(pathname, href),
      icon: <Icon />,
    })),
    { href: "/picks/new", label: t.common.newPick, icon: <Plus />, variant: "brand" as const },
  ];

  const bottomItems: DockNavItem[] = [
    { href: "/profile", label: user.name, icon: <span>{initials}</span>, variant: "avatar" },
  ];

  return <Dock items={items} bottomItems={bottomItems} className="h-full" />;
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
