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
    <main className="relative min-h-screen overflow-hidden bg-[#fffcf8] text-[#2a241f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-160px] top-[-140px] h-[420px] w-[420px] rounded-full bg-[#fed7aa]/40 blur-3xl" />
        <div className="absolute right-[-140px] top-[220px] h-[360px] w-[360px] rounded-full bg-[#fdba74]/35 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-[#e7d9ca] bg-[#fffaf4]/90 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2.5 md:px-8 md:py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 items-center rounded-full border border-[#ecdcc9] bg-white px-3 text-xs font-semibold tracking-[0.14em] text-[#9b856d]">
              PHILOSOPHER
            </span>
            <p className="text-sm font-semibold tracking-tight text-[#2f2720] md:text-base">AI 철학 인터페이스</p>
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

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 md:px-8 md:py-10">
        <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#a3917f]">Socratic Interface</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#2f2720] md:text-6xl">
              철학자와 대화하며
              <br />
              생각을 더 선명하게.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#5f554c]">{siteConfig.description}</p>

            <ul className="mt-6 space-y-2.5">
              {keyPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-xl border border-[#ebddce] bg-white/85 px-4 py-3 text-[17px] leading-7 text-[#3d332b]"
                >
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[#ea580c]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-xl bg-[#ea580c] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(194,65,12,0.24)] transition hover:bg-[#c2410c]"
              >
                지금 시작하기
              </button>
              <p className="text-sm text-[#7a6a5a]">3단계로 바로 대화 시작</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#ebddce] bg-[linear-gradient(180deg,#fffaf4_0%,#f8efe4_100%)] p-3 shadow-[0_20px_38px_rgba(101,67,34,0.12)]">
            <div className="grid grid-cols-2 gap-3">
            {selectedPhilosophers.map((philosopher) => (
                <article
                  key={philosopher.id}
                  className="group overflow-hidden rounded-2xl border border-[#ebdecf] bg-[#fff8f0] p-3 transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(84,54,24,0.18)]"
                >
                  <div className="relative h-44 md:h-52">
                    <Image
                      src={philosopher.imageSrc}
                      alt={`${philosopher.name} portrait`}
                      fill
                      className="object-contain object-bottom drop-shadow-[0_12px_20px_rgba(59,39,21,0.2)] transition duration-300 group-hover:scale-105"
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
          </div>
        </section>

        <section className="rounded-2xl border border-[#eadccc] bg-white/95 p-6 shadow-[0_12px_28px_rgba(110,73,36,0.08)] md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#a3917f]">How It Works</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {flowItems.map((item) => (
              <article key={item.number} className="relative rounded-xl border border-[#efe2d4] bg-[#fffaf4] p-4">
                <p className="text-sm font-semibold tracking-[0.12em] text-[#b27a4d]">{item.number}</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#2f2720]">{item.title}</h2>
                <div className="mt-3 h-1 w-12 rounded-full bg-[#f4c59e]" />
              </article>
            ))}
          </div>
          {authError ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#eadccc] bg-[#fff7ee] px-5 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-base leading-7 text-[#5d5147]">
              대화는 단순한 Q&A가 아니라, <span className="font-semibold text-[#332821]">사고를 확장하는 훈련</span>입니다.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-xl border border-[#f3c8a1] bg-white px-5 py-2.5 text-sm font-semibold text-[#9a3412] transition hover:bg-[#fff2e5]"
            >
              Google로 계속하기
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
