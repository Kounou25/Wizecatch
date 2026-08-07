"use client";

import { useFormStatus } from "react-dom";
import { GoogleIcon, LoaderIcon } from "@/components/icons";
import { signInWithGoogle } from "@/lib/auth/actions";

function Inner({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg bg-white text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 transition-colors duration-150 hover:bg-zinc-50 disabled:opacity-60"
    >
      {pending ? (
        <LoaderIcon className="h-4 w-4" />
      ) : (
        <GoogleIcon className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

export function GoogleButton({
  label = "Continue with Google",
  next = "/dashboard",
}: {
  label?: string;
  next?: string;
}) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <Inner label={label} />
    </form>
  );
}
