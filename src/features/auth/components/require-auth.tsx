"use client";

import type { ReactNode } from "react";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { PreLoginLandingPage } from "@/features/auth/components/pre-login-landing-page";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoading, session, authError, signInWithGoogle } = useAuthSession();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffcf8] px-4">
        <p className="text-sm text-[#6e665e]">로그인 상태를 확인하는 중입니다...</p>
      </main>
    );
  }

  if (!session) {
    return <PreLoginLandingPage authError={authError} onSignIn={signInWithGoogle} />;
  }

  return children;
}
