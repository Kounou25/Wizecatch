"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { signInWithPassword, type AuthState } from "@/lib/auth/actions";

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

export function LoginForm({ next, urlError }: { next: string; urlError?: string }) {
  const { dict } = useLanguage();
  const [state, formAction] = useActionState<AuthState, FormData>(
    signInWithPassword,
    { error: urlError ?? null },
  );

  const error = state.error ?? urlError ?? null;

  return (
    <AuthCard
      title={dict.auth.loginTitle}
      subtitle={dict.auth.loginSubtitle}
      footer={{ text: dict.auth.noAccount, linkLabel: dict.auth.signupLink, href: "/signup" }}
    >
      <GoogleButton label={dict.auth.continueGoogle} next={next} />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs text-zinc-400">{dict.auth.orContinueEmail}</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

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
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-zinc-800">
              {dict.auth.password}
            </label>
            <span className="cursor-not-allowed text-xs font-medium text-purple-600">
              {dict.auth.forgotPassword}
            </span>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        <SubmitButton label={dict.auth.loginButton} />
      </form>
    </AuthCard>
  );
}
