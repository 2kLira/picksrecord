import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo showWord={false} className="scale-150" />
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">{t.notFound.title}</h1>
      <p className="mt-2 max-w-sm text-muted">{t.notFound.body}</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-[2px] bg-brand px-5 py-3 font-semibold text-base transition hover:brightness-110 active:scale-[0.98]"
      >
        {t.notFound.cta}
      </Link>
    </div>
  );
}
