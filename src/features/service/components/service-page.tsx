import { AppShell } from "@/components/layout/app-shell";
import { ChatPreview } from "@/components/ui/chat-preview";
import { philosophers } from "@/data/philosophers";

export function ServicePage() {
  return (
    <AppShell>
      <section className="grid flex-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex min-h-full flex-col rounded-[1.5rem] border border-stone-200 bg-white/80 p-4">
          <button
            type="button"
            className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left text-sm font-medium text-stone-900 transition hover:bg-stone-50"
          >
            새 채팅
          </button>

          <nav className="space-y-1">
            <button
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            >
              채팅 검색
            </button>
            <button
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            >
              철학자 라이브러리
            </button>
          </nav>

          <div className="mt-8">
            <p className="px-3 text-[11px] tracking-[0.24em] text-stone-400 uppercase">
              최근 대화
            </p>
            <div className="mt-3 space-y-1">
              {["니체와 자기실현", "소크라테스와 정의", "아렌트와 책임"].map(
                (title, index) => (
                  <button
                    key={title}
                    type="button"
                    className={`block w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                      index === 0
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    {title}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="px-3 text-[11px] tracking-[0.24em] text-stone-400 uppercase">
              철학자
            </p>
            <div className="mt-3 space-y-1">
              {philosophers.map((philosopher, index) => (
                <button
                  key={philosopher.id}
                  type="button"
                  className={`block w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                    index === 1
                      ? "bg-orange-50 text-stone-900"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {philosopher.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col rounded-[1.5rem] border border-stone-200 bg-white/70">
          <div className="px-6 pb-1 pt-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.24em] text-stone-500 uppercase">
                  ChatGPT
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">
                  Nietzsche
                </h2>
              </div>
              <div className="text-xs text-stone-500">Philosopher Mode</div>
            </div>

            <div className="mt-8 max-w-2xl">
              <h3 className="text-3xl font-semibold tracking-tight text-stone-900">
                진짜 핵심 감각
              </h3>
              <p className="mt-5 text-[16px] leading-8 text-stone-700">
                철학자를 읽는 느낌이 아니라, 그 철학자가 되어 지금의 질문에
                응답하는 인터페이스.
              </p>
              <div className="mt-8 space-y-3 text-[15px] leading-8 text-stone-600">
                <p>철학자의 저작, 문체, 문제의식을 기반으로 답변한다.</p>
                <p>대화는 하나의 세션으로 이어지고 질문의 맥락을 보존한다.</p>
              </div>
            </div>
          </div>

          <ChatPreview />
        </div>
      </section>
    </AppShell>
  );
}
