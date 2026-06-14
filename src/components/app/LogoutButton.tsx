"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

export function LogoutButton() {
  const t = useT();
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-lost active:scale-[0.97]"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">{t.common.signOut}</span>
      </button>
    </form>
  );
}
