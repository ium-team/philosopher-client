"use client";

import type { ReactNode } from "react";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoading, session, authError, signInWithGoogle, signOut } = useAuthSession();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffcf8] px-4">
        <p className="text-sm text-[#6e665e]">로그인 상태를 확인하는 중입니다...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffcf8] px-4">
        <section className="w-full max-w-md rounded-2xl border border-[#efe5da] bg-white p-7 shadow-[0_14px_34px_rgba(108,70,30,0.12)]">
          <p className="text-xs tracking-[0.14em] text-[#9f8c78] uppercase">Account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2f2720]">
            Google 계정으로 시작하기
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6c6157]">
            대화 기록/사용자별 기능을 위해 로그인이 필요합니다.
          </p>
          {authError ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {authError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-6 w-full rounded-xl bg-[#ea580c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c2410c]"
          >
            Google로 로그인
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="fixed top-3 right-3 z-40 rounded-full border border-[#e7dbcd] bg-white/95 px-3 py-1.5 text-xs text-[#5f554b] shadow-sm backdrop-blur">
        <span>{session.user.email ?? "로그인 사용자"}</span>
        <button
          type="button"
          onClick={signOut}
          className="ml-2 rounded-full border border-[#ddccb8] px-2 py-0.5 text-[11px] transition hover:bg-[#f9f1e8]"
        >
          로그아웃
        </button>
      </div>
      {children}
    </>
  );
}
