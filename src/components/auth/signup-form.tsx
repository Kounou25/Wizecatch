"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { signUpWithPassword, type AuthState } from "@/lib/auth/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 text-base font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-purple-700 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && <LoaderIcon className="h-4 w-4" />}
      {label}
    </button>
  );
}

export function SignupForm({ urlError }: { urlError?: string }) {
  const { dict } = useLanguage();
  const [state, formAction] = useActionState<AuthState, FormData>(
    signUpWithPassword,
    { error: urlError ?? null },
  );

  const message = state.error ?? urlError ?? null;

  return (
    <AuthCard
      title={dict.auth.signupTitle}
      subtitle={dict.auth.signupSubtitle}
      footer={{ text: dict.auth.hasAccount, linkLabel: dict.auth.loginLink, href: "/login" }}
    >
      <GoogleButton label={dict.auth.continueGoogle} />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs text-zinc-400">{dict.auth.orContinueEmail}</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">
          {message}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">{dict.auth.fullName}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Rivera"
          />
        </div>

        <div>
          <Label htmlFor="email">{dict.auth.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">{dict.auth.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={8}
            required
          />
          <p className="mt-1.5 text-xs text-zinc-400">At least 8 characters.</p>
        </div>

        <SubmitButton label={dict.auth.signupButton} />

        <p className="text-center text-xs text-zinc-400">{dict.auth.terms}</p>
      </form>
    </AuthCard>
  );
}
