"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { philosophers } from "@/data/philosophers";

type PreLoginLandingPageProps = {
  authError: string | null;
  onSignIn: () => Promise<void>;
};

const heroPhilosophers = ["socrates", "plato", "nietzsche", "simone_de_beauvoir"];

const keyPoints = [
  "철학자별 고유한 말투와 사고 방식",
  "텍스트와 음성 기반 대화 모두 지원",
  "대화 기록을 프로젝트 단위로 정리",
] as const;

const flowItems = [
  { number: "01", title: "철학자 선택" },
  { number: "02", title: "질문 시작" },
  { number: "03", title: "생각 확장" },
] as const;

export function PreLoginLandingPage({ authError, onSignIn }: PreLoginLandingPageProps) {
  const selectedPhilosophers = philosophers.filter((philosopher) => heroPhilosophers.includes(philosopher.id));

  return (
    <main className="min-h-screen bg-[#fffcf8] text-[#2a241f]">
      <header className="sticky top-0 z-30 border-b-2 border-[#e6d6c3] bg-[#fffaf4]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2.5 md:px-8 md:py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b856d]">Philosopher</p>
            <p className="mt-0.5 text-base font-bold tracking-tight text-[#2f2720]">AI 철학 인터페이스</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-xl bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c2410c]"
          >
            Google 로그인
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 md:px-8 md:py-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#a3917f]">Socratic Interface</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#2f2720] md:text-6xl">
              철학자와 대화하며
              <br />
              생각을 더 선명하게.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#5f554c]">{siteConfig.description}</p>

            <ul className="mt-6 space-y-3">
              {keyPoints.map((point) => (
                <li key={point} className="text-lg font-medium leading-8 text-[#3d332b]">
                  {point}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onSignIn}
              className="mt-8 rounded-xl bg-[#ea580c] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(194,65,12,0.24)] transition hover:bg-[#c2410c]"
            >
              지금 시작하기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedPhilosophers.map((philosopher) => (
              <article key={philosopher.id} className="overflow-hidden rounded-2xl border border-[#ebdecf] bg-[#fff8f0] p-3">
                <div className="relative h-44 md:h-56">
                  <Image
                    src={philosopher.imageSrc}
                    alt={`${philosopher.name} portrait`}
                    fill
                    className="object-contain object-bottom drop-shadow-[0_12px_20px_rgba(59,39,21,0.2)]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="rounded-xl border border-[#eadccb] bg-white px-3 py-2">
                  <p className="text-xs text-[#8f7b67]">{philosopher.era}</p>
                  <p className="mt-1 text-base font-semibold text-[#2f2720]">{philosopher.name}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#eadccc] bg-white p-6 md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#a3917f]">How It Works</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {flowItems.map((item) => (
              <article key={item.number} className="rounded-xl border border-[#efe2d4] bg-[#fffaf4] p-4">
                <p className="text-sm font-semibold tracking-[0.12em] text-[#b27a4d]">{item.number}</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#2f2720]">{item.title}</h2>
              </article>
            ))}
          </div>
          {authError ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
