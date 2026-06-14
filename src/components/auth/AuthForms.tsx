"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { registerAction, loginAction, type ActionState } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

export function RegisterForm() {
  const t = useT();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(registerAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <Field label={t.register.name} htmlFor="name" error={fe.name}>
        <Input id="name" name="name" placeholder="Alex Rivera" autoComplete="name" required />
      </Field>
      <Field label={t.register.email} htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
      </Field>
      <Field label={t.register.password} htmlFor="password" error={fe.password}>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t.register.passwordPlaceholder}
          autoComplete="new-password"
          required
        />
      </Field>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? t.register.creating : t.register.create}
      </Button>

      <p className="text-center text-xs text-faint">{t.register.nextHint}</p>

      <p className="text-center text-sm text-muted">
        {t.register.haveAccount}{" "}
        <Link href="/login" className="text-brand hover:underline">
          {t.common.signIn}
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const t = useT();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(loginAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <Field label={t.register.email} htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
      </Field>
      <Field label={t.register.password} htmlFor="password" error={fe.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      {state.error && (
        <div className="rounded-xl border border-lost/30 bg-lost/10 px-4 py-2.5 text-sm text-lost">
          {t.login.invalidCredentials}
        </div>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? t.login.signingIn : t.common.signIn}
      </Button>

      <p className="text-center text-sm text-muted">
        {t.login.newHere}{" "}
        <Link href="/register" className="text-brand hover:underline">
          {t.login.createAccount}
        </Link>
      </p>
    </form>
  );
}
