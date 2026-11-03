'use client';
//
// Clerk in the browser, only where it's needed: the dashboard and the sign-in and
// sign-up pages. The landing and legal pages render their signed-in state on the
// server (site-header.tsx), so visitors there never download Clerk's client.
//
import { ClerkProvider } from "@clerk/nextjs";
import { UserSync } from "@/components/user";

export function ClerkShell({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <UserSync />
      {children}
    </ClerkProvider>
  );
}
