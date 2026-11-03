"use client";

import React, { useEffect } from 'react';
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from 'next/navigation';
import { safeRedirectPath } from '@/lib/safe-redirect';
import Link from 'next/link';
import { Logo } from '@/components/site/logo';
import { ClerkShell } from '@/components/auth/clerk-shell';
import { SITE } from '@/config/site';

export default function SignInPage() {
  return (
    <ClerkShell>
      <Inner />
    </ClerkShell>
  );
}

function Inner() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only ever send people to a page on this site (no open redirect).
  const redirectUrl = safeRedirectPath(searchParams.get('redirect'));

  useEffect(() => {
    // If user is already signed in and there's a redirect parameter, redirect them
    if (isSignedIn) {
      router.push(redirectUrl);
    }
  }, [isSignedIn, redirectUrl, router]);

  return (
    <main id="main" className="stage flex min-h-dvh flex-col items-center justify-center gap-8 px-gutter py-12">
      <Link href="/" aria-label={`${SITE.name} home`} className="inline-flex min-h-11 items-center rounded-full px-1.5">
        <Logo name={SITE.name} />
      </Link>
      <SignIn forceRedirectUrl={redirectUrl} />
    </main>
  );
}
