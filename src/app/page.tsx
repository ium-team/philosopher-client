import { AppShell } from "@/components/layout/app-shell";
import { ChatPreview } from "@/components/ui/chat-preview";
import { PhilosopherCard } from "@/components/ui/philosopher-card";
import { siteConfig } from "@/config/site";
import { philosophers } from "@/data/philosophers";

export default function Home() {
  return (
    <AppShell>
      <section className="grid items-start gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs tracking-[0.28em] text-cyan-100 uppercase">
            Philosopher AI Studio
          </div>

          <div className="max-w-4xl space-y-5">
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
              철학자를 읽는 것을 넘어
              <span className="block text-slate-400">
                이제 대화할 수 있게 만든다
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {siteConfig.description} 사용자는 소크라테스, 니체, 한나 아렌트
              같은 인물과 직접 대화하듯 질문하고, 각 철학자의 논리와 문체로
              응답을 받는다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
            >
              철학자 선택하고 시작
            </button>
            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              대화 데모 보기
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold text-white">30+</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                철학자 페르소나 확장 가능 구조
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold text-white">Works</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                저작과 개념을 근거로 응답하는 지식 기반
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold text-white">1:1</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                개인 고민을 철학적으로 해석하는 대화 세션
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_100px_rgba(2,6,23,0.45)] backdrop-blur">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">
                Session Setup
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                누구와 대화할까?
              </h2>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              Realtime Persona Ready
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {philosophers.map((philosopher) => (
              <div
                key={philosopher.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 transition hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {philosopher.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {philosopher.tone}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {philosopher.school}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {philosopher.works.slice(0, 2).map((work) => (
                    <span
                      key={work}
                      className="rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300"
                    >
                      {work}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatPreview />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">
              Philosopher Library
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              철학자별 대화 경험을 고른다
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            각 페르소나는 대표 저작, 핵심 개념, 문체의 긴장감까지 보존하는
            방향으로 설계된다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {philosophers.map((philosopher, index) => (
            <PhilosopherCard
              key={philosopher.id}
              philosopher={philosopher}
              featured={index === 0}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
            Reading Layer
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            철학자를 공부한 AI
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            단순 요약이 아니라 저작, 개념, 시대적 맥락을 함께 이해한 페르소나를
            만든다.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
            Dialogue Layer
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            지금의 고민과 연결
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            사용자의 질문을 현재의 문제로 받아들이고, 철학자의 논리로 다시
            해석해준다.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
            Product Layer
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            계속 이어지는 사고 기록
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            한 번의 대화로 끝나지 않고 질문 기록, 메모리, 추천 질문으로 사고를
            축적한다.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
