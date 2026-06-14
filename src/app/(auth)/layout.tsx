import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { getT } from "@/lib/i18n-server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-hair lg:block">
        <div className="grid-noise absolute inset-0 opacity-60" />
        <div
          className="absolute -left-24 top-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(70,230,164,0.22), transparent 70%)" }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/">
            <Logo />
          </Link>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">{t.brand.eyebrow}</p>
            <h1 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
              {t.brand.titleA} <br />
              {t.brand.titleB} <span className="text-gradient">{t.brand.titleAccent}</span> {t.brand.titleC}
            </h1>
            <p className="mt-4 max-w-sm text-muted">{t.brand.subtitle}</p>
          </div>
          <div className="flex gap-8 font-mono text-sm text-faint">
            <div>
              <div className="text-2xl font-semibold text-fg">ROI</div>
              <div>{t.brand.s1}</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-fg">W/L</div>
              <div>{t.brand.s2}</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-fg">P&amp;L</div>
              <div>{t.brand.s3}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <div className="lg:hidden">
              <Logo />
            </div>
            <LanguageToggle className="ml-auto" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
