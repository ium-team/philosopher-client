const messages = [
  {
    role: "user",
    speaker: "You",
    text: "타인의 기대를 따르느라 내 삶이 흐릿해진 느낌이 들어.",
  },
  {
    role: "ai",
    speaker: "Nietzsche AI",
    text: "그렇다면 먼저 묻자. 그 기대는 정말 네가 선택한 가치인가, 아니면 두려움이 빌린 목소리인가?",
  },
  {
    role: "user",
    speaker: "You",
    text: "실패가 두려워서 남들이 인정하는 길을 고르고 있었던 것 같아.",
  },
  {
    role: "ai",
    speaker: "Nietzsche AI",
    text: "좋다. 그 두려움을 없애려 하지 말고 재료로 써라. 너를 마비시키는 규범이 아니라, 너를 단련시키는 기준을 스스로 만들 수 있어야 한다.",
  },
];

const prompts = [
  "내가 진짜 원하는 삶이 뭔지 모르겠어",
  "도덕적 선택과 자기실현은 충돌할까?",
  "불안이 큰 시기에 어떻게 사고를 유지하지?",
];

export function ChatPreview() {
  return (
    <section className="flex h-full min-h-[calc(100vh-8rem)] flex-col rounded-b-[1.5rem] border-t border-stone-200 bg-[#fffaf5]">
      <div className="mx-auto w-full max-w-4xl px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <p className="text-xs tracking-[0.24em] text-stone-500 uppercase">
              Philosopher
            </p>
            <h3 className="mt-2 text-xl font-semibold text-stone-900">
              Nietzsche
            </h3>
          </div>
          <div className="text-xs text-stone-500">GPT-5.4 Persona</div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-8 sm:px-8">
          <div className="flex-1 space-y-12 py-8">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? userBubble : aiBubble}
              >
                <p className="mb-3 text-[11px] tracking-[0.24em] text-stone-500 uppercase">
                  {message.speaker}
                </p>
                <p className="text-[16px] leading-8 text-stone-800">
                  {message.text}
                </p>
              </div>
            ))}

            <div className="space-y-3 border-t border-stone-200 pt-8">
              <p className="text-[11px] tracking-[0.24em] text-stone-500 uppercase">
                추천 질문
              </p>
              <div className="flex flex-col gap-3">
                {prompts.slice(0, 2).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="text-left text-[15px] leading-8 text-stone-700 transition hover:text-stone-900"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-stone-200 bg-[linear-gradient(to_top,#fffaf5_75%,rgba(255,250,245,0))] pb-2 pt-8">
            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-[1.75rem] border border-stone-300 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                <div className="min-h-16 text-sm leading-7 text-stone-400">
                  철학자에게 질문해보세요
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex gap-4 text-xs text-stone-500">
                    <span>Deep mode</span>
                    <span>Memory on</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
                  >
                    보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const userBubble = "ml-auto max-w-2xl";

const aiBubble = "mr-auto max-w-2xl";
