import { RegisterForm } from "@/components/auth/AuthForms";
import { getT } from "@/lib/i18n-server";

export default async function RegisterPage() {
  const t = await getT();
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{t.register.title}</h2>
      <p className="mt-1 text-sm text-muted">{t.register.subtitle}</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
