"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { philosophers } from "@/data/philosophers";

type PreLoginLandingPageProps = {
  authError: string | null;
  onSignIn: () => Promise<void>;
};

const heroPhilosophers = ["socrates", "plato", "nietzsche", "simone_de_beauvoir"];

const valueCards = [
  {
    title: "철학자별 페르소나",
    description: "문체와 문제의식을 분리해서 설계한 캐릭터로, 인물마다 대화의 결이 분명하게 달라집니다.",
  },
  {
    title: "텍스트 + 보이스",
    description: "질문을 쓰거나 말해도 같은 맥락이 이어지고, 필요하면 음성으로 답변을 들을 수 있습니다.",
  },
  {
    title: "대화 기록 관리",
    description: "주제별 프로젝트로 대화를 묶고, 다시 돌아왔을 때도 사고의 흐름을 이어갈 수 있습니다.",
  },
] as const;

const flowItems = [
  {
    number: "01",
    title: "철학자 선택",
    description: "시대와 학파를 기준으로 대화 상대를 고릅니다.",
  },
  {
    number: "02",
    title: "질문 던지기",
    description: "짧은 질문부터 긴 고민까지 자유롭게 시작합니다.",
  },
  {
    number: "03",
    title: "사고 확장",
    description: "반박, 재질문, 예시 요청으로 생각을 깊게 확장합니다.",
  },
] as const;

export function PreLoginLandingPage({ authError, onSignIn }: PreLoginLandingPageProps) {
  const selectedPhilosophers = philosophers.filter((philosopher) => heroPhilosophers.includes(philosopher.id));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffcf8] text-[#2a241f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-120px] h-[320px] w-[320px] rounded-full bg-[#fed7aa]/45 blur-3xl" />
        <div className="absolute right-[-120px] top-[240px] h-[360px] w-[360px] rounded-full bg-[#fdba74]/35 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-6 md:px-8 md:py-8">
        <header className="flex items-center justify-between rounded-2xl border border-[#efe6da] bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#a3917f]">Philosopher</p>
            <p className="mt-1 text-sm text-[#6f665c]">AI 철학 인터페이스</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-xl bg-[#ea580c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c2410c]"
          >
            Google로 시작하기
          </button>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#a3917f]">Socratic Interface</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#2f2720] md:text-5xl">
              철학자와 대화하며
              <br />
              생각의 밀도를 높이세요.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#6c6157] md:text-base">
              {siteConfig.description} 질문하고, 반박하고, 다시 질문하며 당신만의 논리를 더 선명하게 만드세요.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(194,65,12,0.25)] transition hover:bg-[#c2410c]"
              >
                지금 바로 로그인
              </button>
              <a
                href="#how-it-works"
                className="rounded-xl border border-[#e8dccd] bg-white px-5 py-3 text-sm font-medium text-[#7f6f60] transition hover:bg-[#faf5ef]"
              >
                사용 방식 보기
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedPhilosophers.map((philosopher) => (
              <article
                key={philosopher.id}
                className="group relative overflow-hidden rounded-2xl border border-[#efe6da] bg-gradient-to-b from-[#fffaf4] to-[#f6ece1] p-3"
              >
                <div className="relative h-44 md:h-56">
                  <Image
                    src={philosopher.imageSrc}
                    alt={`${philosopher.name} portrait`}
                    fill
                    className="object-contain object-bottom drop-shadow-[0_12px_20px_rgba(59,39,21,0.2)] transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="rounded-xl border border-[#eadccb] bg-white/85 px-3 py-2">
                  <p className="text-xs text-[#9d8a76]">{philosopher.era}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2f2720]">{philosopher.name}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valueCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-[#efe6da] bg-white p-5 shadow-[0_10px_24px_rgba(111,74,36,0.07)]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#a3917f]">Core Value</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#2f2720]">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6f645a]">{card.description}</p>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="rounded-3xl border border-[#e9ddcf] bg-[#fff7ee] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#a3917f]">How It Works</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {flowItems.map((item) => (
              <article key={item.number} className="rounded-2xl border border-[#f0e1d0] bg-white p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#b28055]">{item.number}</p>
                <h3 className="mt-2 text-base font-semibold text-[#2f2720]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f645a]">{item.description}</p>
              </article>
            ))}
          </div>
          {authError ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{authError}</p>
          ) : null}
          <div className="mt-6 flex justify-start">
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c2410c]"
            >
              Google 계정으로 시작
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
