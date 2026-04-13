import { Suspense } from "react";
import { AuthCallbackHandler } from "@/features/auth/components/auth-callback-handler";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#fffcf8] px-4">
          <p className="text-sm text-[#6c6157]">로그인 처리 중입니다...</p>
        </main>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
