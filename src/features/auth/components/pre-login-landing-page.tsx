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
    <main className="relative min-h-screen overflow-hidden bg-[#fffdf8] text-[#211c16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-30%,rgba(195,140,44,0.1)_0%,rgba(255,253,248,0)_60%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background:repeating-linear-gradient(90deg,transparent,transparent_7px,rgba(96,74,40,0.08)_8px,transparent_9px)]" />
      </div>

      <header className="sticky top-0 z-30 bg-transparent">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-3 md:px-10 md:py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 items-center px-1 text-[11px] font-semibold tracking-[0.16em] text-[#8b6b3f]">
              PHILOSOPHER
            </span>
            <p className="text-sm tracking-tight text-[#4d3e2f] md:text-base">AI 철학 인터페이스</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-full border border-[#dcc7a7] bg-[#fffaf1] px-4 py-2 text-sm font-semibold text-[#7c5a2e] transition hover:bg-[#fff3e2]"
          >
            Google 로그인
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-6 py-12 md:px-10 md:py-16">
        <section className="px-1 py-8 md:px-2 md:py-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs tracking-[0.22em] text-[#9f8562] uppercase">Socratic Interface</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.04] tracking-tight text-[#2a231b] md:text-7xl">
              Philosopher
              <br />
              <span className="text-[#b28646]">Dialogue</span>
            </h1>
            <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-[#5f5143] md:text-xl md:leading-9">
              {siteConfig.description} 질문하고, 반박하고, 재구성하며 사고를 명확하게 만드는 대화형 철학 도구입니다.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-full border border-[#d8be98] bg-[#b28646] px-7 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#9a723c]"
              >
                구글 로그인으로 시작
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="p-1 md:p-2">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#2a231b] md:text-4xl">What You Get</h2>
            <ul className="mt-7 space-y-3">
              {keyPoints.map((point) => (
                <li key={point} className="border-b border-[#eee2d3] py-3 text-base text-[#4c4034]">
                  <span className="font-semibold text-[#a0763d]">•</span> {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-1">
            <div className="grid grid-cols-2 gap-5">
              {selectedPhilosophers.map((philosopher) => (
                <article
                  key={philosopher.id}
                  className="group overflow-hidden p-1"
                >
                  <div className="relative h-48 md:h-56">
                    <Image
                      src={philosopher.imageSrc}
                      alt={`${philosopher.name} portrait`}
                      fill
                      className="object-contain object-bottom drop-shadow-[0_10px_16px_rgba(59,39,21,0.2)] transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="px-1 py-1">
                    <p className="text-xs text-[#8f7b67]">{philosopher.era}</p>
                    <p className="mt-1 text-base font-semibold text-[#2f2720]">{philosopher.name}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="p-1 md:p-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#a3917f]">How It Works</p>
          <div className="mt-7 grid gap-10 md:grid-cols-3">
            {flowItems.map((item) => (
              <article key={item.number} className="text-center">
                <p className="text-sm font-semibold tracking-[0.12em] text-[#b27a4d]">{item.number}</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#2f2720]">{item.title}</h2>
                <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#f4c59e]" />
              </article>
            ))}
          </div>
          {authError ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
          ) : null}
        </section>

        <div className="border-t border-[#eadccc] pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-base leading-7 text-[#5d5147]">
              대화는 단순한 Q&A가 아니라, <span className="font-semibold text-[#332821]">사고를 확장하는 훈련</span>입니다.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-full border border-[#d7c2a1] bg-white px-5 py-2.5 text-sm font-semibold text-[#7c5a2e] transition hover:bg-[#fff2e5]"
            >
              Google로 계속하기
            </button>
          </div>
        </div>

        <footer className="border-t border-[#eadccc] pt-8 pb-3">
          <div className="flex flex-col gap-3 text-sm text-[#7a6b5b] md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Philosopher. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="transition hover:text-[#4f4031]">
                이용약관
              </a>
              <a href="#" className="transition hover:text-[#4f4031]">
                개인정보처리방침
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
