"use client";

import { useRouter } from "next/navigation";
import { philosophers } from "@/data/philosophers";

export function PhilosopherSelectPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-5 py-10 text-[#1f1f1f] md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/service")}
          className="mb-6 rounded-lg px-3 py-2 text-sm text-[#666] hover:bg-[#ececec]"
        >
          ← 대화로 돌아가기
        </button>

        <header className="mb-7">
          <p className="text-xs tracking-[0.18em] text-[#9a9a9a] uppercase">New Conversation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2f2f2f]">대화할 철학자를 선택하세요</h1>
          <p className="mt-2 text-sm text-[#7a7a7a]">선택 후 `선택하기`를 누르면 해당 철학자와의 대화가 시작됩니다.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {philosophers.map((philosopher) => (
            <article key={philosopher.id} className="rounded-2xl border border-[#e6e6e6] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <p className="text-xs text-[#9a9a9a]">{philosopher.era}</p>
              <h2 className="mt-1 text-xl font-semibold text-[#272727]">{philosopher.name}</h2>
              <p className="mt-2 text-xs text-[#b2b2b2]">{philosopher.school}</p>

              <p className="mt-4 text-sm leading-6 text-[#5f5f5f]">{philosopher.summary}</p>

              <p className="mt-4 text-xs font-medium text-[#a3a3a3]">대화 톤</p>
              <p className="mt-1 text-sm text-[#555]">{philosopher.tone}</p>

              <button
                type="button"
                onClick={() => router.push(`/service?philosopher=${philosopher.id}&new=1`)}
                className="mt-5 w-full rounded-xl border border-[#fed7aa] bg-[#fff2e8] px-4 py-2.5 text-sm font-semibold text-[#9a3412] transition hover:bg-[#ffe8d6]"
              >
                선택하기
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
