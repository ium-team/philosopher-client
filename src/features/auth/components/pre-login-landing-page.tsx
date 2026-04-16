"use client";

import Image from "next/image";
import Link from "next/link";
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
] as const;

export function PreLoginLandingPage({ authError, onSignIn }: PreLoginLandingPageProps) {
  const selectedPhilosophers = philosophers.filter((philosopher) => heroPhilosophers.includes(philosopher.id));

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#fffdf8] text-[#211c16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#fffaf4_42%,#fffdf8_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(234,91,12,0.12)_0%,rgba(255,253,248,0)_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(234,91,12,0.1)_0%,rgba(255,253,248,0)_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_105%,rgba(234,91,12,0.08)_0%,rgba(255,253,248,0)_46%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background:repeating-linear-gradient(90deg,transparent,transparent_11px,rgba(119,88,52,0.06)_12px,transparent_13px)]" />
        <div className="absolute inset-0 opacity-[0.1] [background:repeating-linear-gradient(0deg,transparent,transparent_15px,rgba(119,88,52,0.05)_16px,transparent_17px)]" />
      </div>

      <header className="sticky top-0 z-30 bg-transparent">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-3 md:px-10 md:py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 items-center px-1 text-[11px] font-semibold tracking-[0.16em] text-[#ea5b0c]">
              PHILOSOPHER
            </span>
            <p className="text-sm tracking-tight text-[#4d3e2f] md:text-base">AI 철학 인터페이스</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-full border border-[#f0b28d] bg-[#fff7f2] px-4 py-2 text-sm font-semibold text-[#c44708] transition hover:bg-[#ffefe5]"
          >
            Google 로그인
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-14 px-4 pt-8 pb-0 sm:px-6 md:gap-20 md:px-10 md:pt-20 md:pb-0">
        <section className="px-1 py-8 md:px-2 md:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs tracking-[0.22em] text-[#d45a1d] uppercase">Socratic Interface</p>
            <h1 className="mt-7 font-serif text-4xl font-bold leading-[1.04] tracking-tight text-[#2a231b] sm:text-5xl md:text-7xl">
              Philosopher
              <br />
              <span className="text-[#ea5b0c]">Dialogue</span>
            </h1>
            <p className="mx-auto mt-8 max-w-4xl text-base leading-7 text-[#5f5143] sm:text-lg sm:leading-8 md:mt-10 md:text-xl md:leading-9">
              {siteConfig.description} 질문하고, 반박하고, 재구성하며 사고를 명확하게 만드는 대화형 철학 도구입니다.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-full border border-[#f0b28d] bg-[#ea5b0c] px-7 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#cf4e08]"
              >
                구글 로그인으로 시작
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="p-1 md:p-2">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#2a231b] sm:text-3xl md:text-4xl">What You Get</h2>
            <ul className="mt-8 space-y-4">
              {keyPoints.map((point) => (
                <li key={point} className="border-b border-[#eee2d3] py-4 text-base text-[#4c4034]">
                  <span className="font-semibold text-[#ea5b0c]">•</span> {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-1">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {selectedPhilosophers.map((philosopher) => (
                <article
                  key={philosopher.id}
                  className="group overflow-hidden p-1"
                >
                  <div className="relative h-40 sm:h-48 md:h-56">
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

        {authError ? (
          <section>
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
          </section>
        ) : null}

      </div>

      <footer className="relative mt-10 border-t border-[#eadccc] pt-7 pb-2">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 pb-4 text-sm text-[#7a6b5b] sm:px-6 md:flex-row md:items-center md:justify-between md:px-10 md:pb-5">
          <p>© {new Date().getFullYear()} Philosopher. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="transition hover:text-[#4f4031]">
              이용약관
            </Link>
            <Link href="/privacy" className="transition hover:text-[#4f4031]">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
