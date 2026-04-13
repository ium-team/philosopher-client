"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exchangeErrorMessage, setExchangeErrorMessage] = useState<string | null>(null);

  const code = useMemo(() => searchParams.get("code"), [searchParams]);
  const oauthError = useMemo(() => searchParams.get("error_description"), [searchParams]);
  const displayErrorMessage = oauthError ?? exchangeErrorMessage;

  useEffect(() => {
    if (oauthError) {
      return;
    }

    if (!code) {
      router.replace("/service");
      return;
    }

    const supabase = getSupabaseClient();

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setExchangeErrorMessage(exchangeError.message);
          return;
        }
        router.replace("/service");
      })
      .catch((exchangeError: unknown) => {
        setExchangeErrorMessage(exchangeError instanceof Error ? exchangeError.message : "알 수 없는 인증 오류");
      });
  }, [code, oauthError, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fffcf8] px-4">
      <section className="w-full max-w-md rounded-2xl border border-[#efe5da] bg-white p-7 shadow-[0_14px_34px_rgba(108,70,30,0.12)]">
        {displayErrorMessage ? (
          <>
            <h1 className="text-xl font-semibold text-[#2f2720]">로그인 처리 중 오류가 발생했습니다</h1>
            <p className="mt-3 break-words text-sm text-[#6c6157]">{displayErrorMessage}</p>
            <button
              type="button"
              onClick={() => router.replace("/service")}
              className="mt-6 rounded-lg border border-[#ddccb8] px-4 py-2 text-sm text-[#5f554b] transition hover:bg-[#f9f1e8]"
            >
              서비스 화면으로 이동
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-[#2f2720]">로그인 처리 중입니다</h1>
            <p className="mt-3 text-sm text-[#6c6157]">잠시만 기다려 주세요...</p>
          </>
        )}
      </section>
    </main>
  );
}
