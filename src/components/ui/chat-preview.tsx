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
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
      <div className="border-b border-white/10 bg-white/5 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">
              Live Dialogue Preview
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              철학자가 된 AI와의 대화
            </h3>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            Memory + Persona Active
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="space-y-4 px-5 py-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={message.role === "user" ? userBubble : aiBubble}
            >
              <p className="mb-2 text-[11px] tracking-[0.24em] text-slate-500 uppercase">
                {message.speaker}
              </p>
              <p className="text-sm leading-7 text-slate-100">{message.text}</p>
            </div>
          ))}

          <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
            <p className="text-[11px] tracking-[0.24em] text-cyan-200 uppercase">
              Suggested Follow-up
            </p>
            <p className="mt-2 text-sm leading-7 text-cyan-50">
              내 기준으로 산다는 건 어떤 선택부터 시작해야 한다고 보나?
            </p>
          </div>
        </div>

        <aside className="border-t border-white/10 bg-black/20 px-5 py-5 lg:border-t-0 lg:border-l">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                Persona Engine
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>철학자별 문체와 논리 구조 유지</li>
                <li>대표 저작과 개념 축 기반 답변</li>
                <li>세션별 사용자 질문 맥락 보존</li>
              </ul>
            </div>

            <div>
              <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                질문 추천
              </p>
              <div className="mt-3 space-y-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-6 text-slate-200 transition hover:bg-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-4">
              <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                Session Goal
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                단순 챗봇이 아니라, 각 철학자의 세계관으로 현재의 문제를
                해석하도록 돕는 대화 경험.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

const userBubble =
  "ml-auto max-w-xl rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4";

const aiBubble =
  "mr-auto max-w-xl rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/8 px-4 py-4";
