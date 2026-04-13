"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { philosophers } from "@/data/philosophers";

export function PhilosopherSelectPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#fffcf8] px-5 py-10 text-[#2a241f] md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/service")}
          className="mb-6 rounded-lg px-3 py-2 text-sm text-[#6f675f] hover:bg-[#f4eee5]"
        >
          ← 대화로 돌아가기
        </button>

        <header className="mb-7">
          <p className="text-xs tracking-[0.18em] text-[#a3917f] uppercase">New Conversation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2f2720]">대화할 철학자를 선택하세요</h1>
          <p className="mt-2 text-sm text-[#7f7369]">선택 후 `채팅하기`를 누르면 해당 철학자와의 대화가 시작됩니다.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {philosophers.map((philosopher) => (
            <article
              key={philosopher.id}
              className="group rounded-2xl border border-[#efe6da] bg-white p-5 shadow-[0_10px_26px_rgba(125,79,25,0.08)]"
            >
              <div className="relative mb-4 h-72 overflow-hidden rounded-2xl border border-[#f2e9de] bg-[radial-gradient(circle_at_50%_20%,#fffaf3_0%,#f5ece2_75%)] md:h-80">
                <div className="absolute inset-x-5 bottom-3 h-8 rounded-full bg-[#7c5b3f]/20 blur-md" />
                <Image
                  src={philosopher.imageSrc}
                  alt={`${philosopher.name} portrait`}
                  width={1024}
                  height={1536}
                  className="relative z-10 mx-auto h-full w-full object-contain object-bottom px-2 py-1 drop-shadow-[0_12px_20px_rgba(54,35,19,0.24)]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-[#2b2118]/95 via-[#2b2118]/82 to-[#2b2118]/35 p-4 text-[#f8efe4] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100">
                  <p className="text-[11px] tracking-[0.14em] uppercase text-[#f3ddc5]">자세한 설명</p>
                  <p className="mt-1 text-sm leading-6">{philosopher.summary}</p>
                  <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-[#f3ddc5]">대화 톤</p>
                  <p className="mt-1 text-sm leading-6">{philosopher.tone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/service?philosopher=${philosopher.id}&new=1`)}
                className="mb-4 w-full rounded-xl border border-[#fed7aa] bg-[#fff5ea] px-4 py-2.5 text-sm font-semibold text-[#9a3412] transition hover:bg-[#ffedd8]"
              >
                채팅하기
              </button>
              <p className="text-xs text-[#a3917f]">{philosopher.era}</p>
              <h2 className="mt-1 text-xl font-semibold text-[#2f2720]">{philosopher.name}</h2>
              <p className="mt-2 text-xs text-[#c0ab96]">{philosopher.school}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
