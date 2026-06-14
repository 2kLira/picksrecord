import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await requireUser();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(70,230,164,0.14), transparent 70%)" }}
      />
      <div className="absolute left-6 top-6">
        <Logo />
      </div>
      <OnboardingWizard
        defaultName={user.name}
        defaultOdds={user.preferred_odds_format}
        defaultCurrency={user.currency}
      />
    </div>
  );
}
