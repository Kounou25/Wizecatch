"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/language-toggle";
import { CheckIcon, LogOutIcon } from "@/components/icons";
import { interpolate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { useCurrentUser } from "@/components/providers/user-provider";
import { signOut } from "@/lib/auth/actions";

export default function SettingsPage() {
  const { dict } = useLanguage();
  const user = useCurrentUser();
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {dict.settings.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{dict.settings.subtitle}</p>

      <Card className="mt-8 p-6">
        <h2 className="text-sm font-semibold text-zinc-900">{dict.settings.profile}</h2>

        <div className="mt-4 flex items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
              {user.initials}
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-zinc-900">{user.fullName}</p>
            <p className="text-sm text-zinc-500">
              {interpolate(dict.settings.memberSince, {
                date: new Date(user.joinedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                }),
              })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">{dict.settings.fullName}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">{dict.settings.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <Button type="submit" variant={saved ? "outline" : "primary"}>
            {saved ? (
              <>
                <CheckIcon className="h-4 w-4 text-green-600" />
                {dict.common.saved}
              </>
            ) : (
              dict.settings.saveChanges
            )}
          </Button>
        </form>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900">{dict.settings.subscription}</h2>
              <Badge variant={user.plan === "pro" ? "purple" : "neutral"}>
                {user.plan === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {user.plan === "free" ? dict.settings.freePlanDesc : dict.settings.proPlanDesc}
            </p>
          </div>
          {user.plan === "free" && (
            <Button href="/#pricing" variant="secondary">
              {dict.settings.upgradeToPro}
            </Button>
          )}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{dict.settings.language}</h2>
            <p className="mt-1 text-sm text-zinc-500">{dict.settings.languageDesc}</p>
          </div>
          <LanguageToggle />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold text-zinc-900">{dict.settings.session}</h2>
        <p className="mt-1 text-sm text-zinc-500">{dict.settings.sessionDesc}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-200 transition-all duration-150 hover:-translate-y-0.5 hover:bg-red-50 active:translate-y-0 active:scale-[0.97]"
          >
            <LogOutIcon className="h-4 w-4" />
            {dict.settings.logOut}
          </button>
        </form>
      </Card>
    </div>
  );
}
