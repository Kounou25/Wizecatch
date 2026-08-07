"use client";

import { createContext, useContext } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  plan: "free" | "pro";
  joinedAt: string;
};

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
}
