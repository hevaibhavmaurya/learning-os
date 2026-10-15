import type { SessionResponse } from "@/shared/contracts/auth";

export type SessionStub = { email: string; initials: string; displayName: string };

export function sessionProfile(session: SessionResponse): SessionStub {
  const owner = session.owner;
  if (!owner) throw new Error("Authenticated owner missing");
  const displayName = owner.displayName || owner.email.split("@")[0] || owner.email;
  return {
    email: owner.email,
    displayName,
    initials: displayName.split(/\s+/).map((part) => part[0] ?? "").slice(0, 2).join("").toUpperCase(),
  };
}
