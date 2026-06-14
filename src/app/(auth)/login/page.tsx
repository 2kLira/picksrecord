import { LoginForm } from "@/components/auth/AuthForms";
import { getT } from "@/lib/i18n-server";

export default async function LoginPage() {
  const t = await getT();
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{t.login.title}</h2>
      <p className="mt-1 text-sm text-muted">{t.login.subtitle}</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
