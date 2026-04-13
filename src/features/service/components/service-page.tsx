"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  project?: string;
  recent?: boolean;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: "philosopher-service",
    title: "철학자 AI 서비스",
    recent: true,
    messages: [
      {
        id: "m1",
        role: "user",
        text: "내가 만들려는 서비스가 있는데 철학자들의 이야기를 책으로 완벽히 이해해서 그 철학자가 된 AI를 만들고 그 AI랑 이야기할 수 있는 서비스야",
        timestamp: "오후 2:12",
      },
      {
        id: "m2",
        role: "assistant",
        text: `좋아요. 이건 꽤 강한 서비스 아이디어예요.\n\n핵심은 단순 "철학 지식 챗봇"이 아니라, "특정 철학자의 사유 방식과 말하기 방식까지 재현한 대화형 인격 인터페이스"라는 점이에요.\n\n다만 여기서 제일 중요한 건 하나예요.\n\n"그 철학자가 된 AI"는 기술적으로 가능해 보여도, 실제로는 "완벽한 이해"보다 "해석된 재구성"에 가깝다는 점입니다.\n\n이걸 잘 설계하면 서비스가 살아나고, 못 하면 그냥 철학자 이름 붙인 RAG 챗봇이 됩니다.\n\n이 서비스의 진짜 매력\n사용자는 보통 철학 책을 이렇게 읽기 어려워해요.\n• 문장이 어렵다\n• 개념이 추상적이다\n• 시대 배경이 없다\n• "그래서 지금 내 삶에 무슨 의미냐"가 안 잡힌다\n\n당신 서비스는 이걸 이렇게 바꿔줄 수 있어요.\n• 플라톤에게 직접 정의란 무엇인지 묻는다\n• 니체에게 내 허무감에 대해 상담받는다\n• 칸트에게 거짓말의 윤리를 따진다\n• 한나 아렌트에게 현대 정치 문제를 묻는다\n\n이건 단순 검색보다 훨씬 몰입감이 있어요.\n잘 만들면 교육, 콘텐츠, 청년기 동반자 경험, 토론 훈련까지 확장돼요.\n\n제일 먼저 정리해야 할 문제\n1) 실제 철학자 원문과 2차 해설의 경계\n2) 모델의 환각과 시대착오 표현 제어\n3) 대화형 UX에서 신뢰와 몰입의 균형\n\n원하면 다음으로, 이걸 MVP 제품 구조로 바로 쪼개서 화면/기능/데이터 파이프라인까지 제안해줄게요.`,
        timestamp: "오후 2:12",
      },
    ],
  },
  {
    id: "education-software",
    title: "교육 시스템 소프트웨어 해결책",
    recent: true,
    messages: [
      {
        id: "m3",
        role: "assistant",
        text: "학습자의 개별 페이스를 추적하는 대시보드가 핵심입니다. 우선 학습 이벤트 수집부터 설계합시다.",
        timestamp: "오전 11:10",
      },
    ],
  },
  {
    id: "codex-install",
    title: "Codex 설치 에러 해결",
    recent: true,
    messages: [
      {
        id: "m4",
        role: "assistant",
        text: "환경변수 충돌을 먼저 점검하면 빠르게 원인을 좁힐 수 있습니다.",
        timestamp: "오전 09:41",
      },
    ],
  },
];

const projectItems = ["새 프로젝트", "ium", "면접", "ai를 잘 쓰는 방법", "인생을 갈아버리자", "객체지향과 아키텍처와 디자인"];

const promptSuggestions = [
  "사용자 신뢰를 잃지 않으면서 몰입을 유지하려면?",
  "철학자 페르소나별 시스템 프롬프트 뼈대를 만들어줘",
  "MVP 4주 로드맵으로 쪼개줘",
];

const syntheticResponses = [
  "좋습니다. 먼저 페르소나 품질 기준부터 정의해야 해요. 정확도, 문체 일관성, 시대 맥락 반영을 각각 별도 지표로 분리합시다.",
  "이 질문은 제품 신뢰성과 직결됩니다. '원문 근거 보기'와 '해석 레이어 표기'를 UI에 같이 두면 환각 체감이 크게 줄어요.",
  "다음 단계로 넘어가려면 학습 데이터 계층을 정리해야 합니다. 원전, 주석서, 현대 해설을 분리 저장하는 구조를 권장해요.",
];

function IconHamburger() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

function IconSquarePen() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20h16" />
      <path d="M13.5 4.5l6 6L9 21l-6 .8L3.8 16z" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14" />
      <path d="M6.8 10.2L12 5l5.2 5.2" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M6 11.5a6 6 0 0012 0M12 18v3" />
    </svg>
  );
}

function IconClip() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8.5 12.5l6-6a3.2 3.2 0 114.5 4.5l-8.3 8.3a5.5 5.5 0 11-7.8-7.8l8-8" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20h16" />
      <path d="M14 4l6 6-8.5 8.5-6 .8.8-6z" />
    </svg>
  );
}

export function ServicePage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(
    initialConversations.reduce((count, conversation) => count + conversation.messages.length, 0),
  );
  const responseCursorRef = useRef(0);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollTop = scroller.scrollHeight;
  }, [activeConversation?.messages.length, isGenerating]);

  const submitMessage = (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || !activeConversation) {
      return;
    }

    messageIdRef.current += 1;
    const userMessage: Message = {
      id: `msg-${messageIdRef.current}-u`,
      role: "user",
      text: trimmed,
      timestamp: "방금",
    };

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, userMessage],
            }
          : conversation,
      ),
    );
    setDraft("");
    setIsGenerating(true);

    window.setTimeout(() => {
      messageIdRef.current += 1;
      const response = syntheticResponses[responseCursorRef.current % syntheticResponses.length] ?? syntheticResponses[0];
      responseCursorRef.current += 1;

      const assistantMessage: Message = {
        id: `msg-${messageIdRef.current}-a`,
        role: "assistant",
        text: response,
        timestamp: "방금",
      };

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: [...conversation.messages, assistantMessage],
              }
            : conversation,
        ),
      );
      setIsGenerating(false);
    }, 700);
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#f7f7f7] text-[#1f1f1f]">
      <aside>
        <div
          className={`flex h-full flex-col border-r border-[#e6e6e6] bg-[#f2f2f2] transition-all duration-200 ${
            isSidebarOpen ? "w-[290px]" : "w-[72px]"
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <button
              type="button"
              aria-label="toggle sidebar"
              onClick={() => setIsSidebarOpen((value) => !value)}
              className="rounded-md p-2 text-[#666] transition hover:bg-[#e7e7e7]"
            >
              <IconHamburger />
            </button>

            {isSidebarOpen ? (
              <button
                type="button"
                className="rounded-md p-2 text-[#666] transition hover:bg-[#e7e7e7]"
                aria-label="new chat"
              >
                <IconSquarePen />
              </button>
            ) : null}
          </div>

          {isSidebarOpen ? (
            <>
              <div className="px-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#333] transition hover:bg-[#e8e8e8]"
                >
                  <IconSquarePen />
                  새 채팅
                </button>
                <button
                  type="button"
                  className="mt-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#555] transition hover:bg-[#e8e8e8]"
                >
                  <IconSearch />
                  채팅 검색
                </button>
              </div>

              <div className="mt-3 border-t border-[#e6e6e6] pt-3">
                <p className="px-6 text-xs text-[#9a9a9a]">프로젝트</p>
                <div className="mt-1 px-2">
                  {projectItems.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                        index === 0
                          ? "text-[#333] hover:bg-[#e8e8e8]"
                          : "text-[#555] hover:bg-[#e8e8e8]"
                      }`}
                    >
                      {index === 0 ? `+ ${item}` : item}
                    </button>
                  ))}
                  <button type="button" className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-[#555] hover:bg-[#e8e8e8]">
                    ... 더 보기
                  </button>
                </div>
              </div>

              <div className="mt-3 border-t border-[#e6e6e6] pt-3">
                <p className="px-6 text-xs text-[#9a9a9a]">최근</p>
                <div className="mt-1 px-2">
                  {conversations
                    .filter((conversation) => conversation.recent)
                    .map((conversation) => {
                      const isActive = conversation.id === activeConversation?.id;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => setActiveConversationId(conversation.id)}
                          className={`mb-0.5 block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                            isActive
                              ? "bg-[#e6e6e6] text-[#1f1f1f]"
                              : "text-[#555] hover:bg-[#e8e8e8]"
                          }`}
                        >
                          {conversation.title}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="mt-auto border-t border-[#e6e6e6] p-3">
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#555] hover:bg-[#e8e8e8]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d9d9d9] text-xs text-[#4d4d4d]">이</span>
                  이 건희
                </button>
              </div>
            </>
          ) : (
            <div className="mt-auto border-t border-[#e6e6e6] p-3">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d9d9] text-xs text-[#4d4d4d]">이</span>
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[#ececec] bg-[#f7f7f7] px-4 md:px-6">
          <button type="button" className="text-[18px] font-semibold tracking-tight text-[#2f2f2f]">
            ChatGPT <span className="ml-1 text-sm text-[#8a8a8a]">▾</span>
          </button>

          <div className="flex items-center gap-3 text-sm text-[#666]">
            <button type="button" className="rounded-md px-2.5 py-1.5 hover:bg-[#ededed]">
              공유하기
            </button>
            <button type="button" className="rounded-md px-2 py-1.5 hover:bg-[#ededed]" aria-label="more options">
              •••
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[820px] px-5 pb-36 pt-8 md:px-8">
            {activeConversation?.messages.map((message) => (
              <article key={message.id} className={`mb-7 ${message.role === "user" ? "ml-auto max-w-[90%]" : "mr-auto w-full"}`}>
                {message.role === "user" ? (
                  <>
                    <div className="ml-auto max-w-[620px] rounded-3xl bg-[#ececec] px-5 py-4 text-[15px] leading-7 text-[#2d2d2d]">
                      {message.text}
                    </div>
                    <div className="mt-2 flex justify-end gap-2 text-[#8b8b8b]">
                      <button type="button" className="rounded-md p-1.5 hover:bg-[#ededed]" aria-label="copy">
                        <IconCopy />
                      </button>
                      <button type="button" className="rounded-md p-1.5 hover:bg-[#ededed]" aria-label="edit">
                        <IconEdit />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="max-w-[720px] whitespace-pre-line text-[17px] leading-8 text-[#202020]">{message.text}</div>
                )}
              </article>
            ))}

            {isGenerating ? (
              <article className="mr-auto mb-7">
                <div className="flex items-center gap-2 text-sm text-[#777]">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#8a8a8a]" />
                  답변 생성 중
                </div>
              </article>
            ) : null}

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-[#6c6c6c]">추천 질문</p>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitMessage(suggestion)}
                    className="rounded-full border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#3d3d3d] transition hover:bg-[#f4f4f4]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4">
          <div className="pointer-events-auto w-full max-w-[860px]">
            <div className="rounded-[26px] border border-[#dedede] bg-white shadow-[0_-1px_0_rgba(0,0,0,0.04),0_10px_28px_rgba(0,0,0,0.07)]">
              <div className="min-h-[86px] px-4 pt-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="변경할 내용이 있으신가요?"
                  className="h-16 w-full resize-none bg-transparent text-[15px] leading-7 text-[#262626] outline-none placeholder:text-[#9a9a9a]"
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1 text-[#6f6f6f]">
                  <button type="button" className="rounded-full p-2 hover:bg-[#efefef]" aria-label="attach file">
                    <IconClip />
                  </button>
                  <button type="button" className="rounded-full px-2.5 py-1.5 text-sm hover:bg-[#efefef]" aria-label="insert command">
                    {"\\"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft("")}
                    className="rounded-full px-2.5 py-1.5 text-sm hover:bg-[#efefef]"
                    aria-label="clear input"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" className="rounded-full p-2 text-[#6f6f6f] hover:bg-[#efefef]" aria-label="voice input">
                    <IconMic />
                  </button>
                  <button
                    type="button"
                    onClick={() => submitMessage(draft)}
                    disabled={draft.trim().length === 0 || isGenerating}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#121212] text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:bg-[#b9b9b9]"
                    aria-label="send message"
                  >
                    <IconSend />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-[#9a9a9a]">
              ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
