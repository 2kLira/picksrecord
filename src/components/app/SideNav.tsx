"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, User, Plus } from "lucide-react";
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

/** Desktop sidebar nav — a single vertical magnify dock (centered in the bar). */
export function SideNav() {
  const pathname = usePathname();
  const t = useT();

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

  return <Dock items={items} />;
}

/** Mobile bottom nav — a horizontal magnify dock (drag a finger across to magnify). */
export function MobileNav() {
  const pathname = usePathname();
  const t = useT();

  const items: DockNavItem[] = [
    { href: "/dashboard", label: t.nav.dashboard, active: isActive(pathname, "/dashboard"), icon: <LayoutDashboard /> },
    { href: "/events", label: t.nav.events, active: isActive(pathname, "/events"), icon: <Trophy /> },
    { href: "/picks/new", label: t.common.newPick, icon: <Plus />, variant: "brand" },
    { href: "/profile", label: t.nav.profile, active: isActive(pathname, "/profile"), icon: <User /> },
  ];

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 lg:hidden">
      <Dock orientation="horizontal" items={items} baseItemSize={46} magnification={62} distance={120} />
    </div>
  );
}
