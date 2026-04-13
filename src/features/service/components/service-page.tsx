"use client";

import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { philosophers, type PhilosopherProfile } from "@/data/philosophers";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  philosopherId: string;
  recent?: boolean;
  messages: Message[];
};

type ServicePageProps = {
  startInSelection?: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

const initialConversations: Conversation[] = [];

function buildAssistantReply(philosopher: PhilosopherProfile, question: string) {
  const condensed = question.replace(/\s+/g, " ").trim().slice(0, 80);

  return `${philosopher.name}의 관점에서 보면, "${condensed}"라는 질문은 스스로의 근거를 더 명료하게 점검하라는 요청입니다. ${philosopher.tone} 방식으로 다음 질문을 이어가 보세요.`;
}

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
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14" />
      <path d="M6.8 10.2L12 5l5.2 5.2" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M6 11.5a6 6 0 0012 0M12 18v3" />
    </svg>
  );
}

function IconVoiceWave() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M6 12h0.01" strokeLinecap="round" />
      <path d="M9 9v6" strokeLinecap="round" />
      <path d="M12 7v10" strokeLinecap="round" />
      <path d="M15 9v6" strokeLinecap="round" />
      <path d="M18 12h0.01" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.5l4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
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

export function ServicePage({ startInSelection = false }: ServicePageProps) {
  const router = useRouter();

  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isSelectingPhilosopher, setIsSelectingPhilosopher] = useState(startInSelection);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);
  const conversationIdRef = useRef(0);
  const handledSelectionRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isCancellingVoiceRef = useRef(false);
  const [isListening, setIsListening] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  const activePhilosopher = useMemo(() => {
    if (!activeConversation) {
      return null;
    }

    return philosophers.find((philosopher) => philosopher.id === activeConversation.philosopherId) ?? null;
  }, [activeConversation]);

  const filteredRecentConversations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (!conversation.recent) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return conversation.title.toLowerCase().includes(normalized);
    });
  }, [conversations, searchQuery]);

  const startConversationWith = useCallback((philosopher: PhilosopherProfile) => {
    conversationIdRef.current += 1;
    const conversationId = `conv-${conversationIdRef.current}`;

    const seededMessage: Message = {
      id: `msg-${conversationIdRef.current}-seed`,
      role: "assistant",
      text: `${philosopher.name}와의 대화가 시작되었습니다. ${philosopher.summary}`,
      timestamp: "방금",
    };

    const conversation: Conversation = {
      id: conversationId,
      title: `${philosopher.name} 대화`,
      philosopherId: philosopher.id,
      recent: true,
      messages: [seededMessage],
    };

    setConversations((previous) => [conversation, ...previous]);
    setActiveConversationId(conversationId);
    setDraft("");
    setIsSelectingPhilosopher(false);
    router.replace(`/service?conversation=${conversationId}`);
  }, [router]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollTop = scroller.scrollHeight;
  }, [activeConversation?.messages.length, isResponding, isSelectingPhilosopher]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const philosopherId = params.get("philosopher");
    const shouldCreate = params.get("new") === "1";
    const marker = `${philosopherId ?? "none"}-${shouldCreate ? "1" : "0"}`;

    if (!philosopherId || !shouldCreate || handledSelectionRef.current === marker) {
      return;
    }

    const philosopher = philosophers.find((item) => item.id === philosopherId);
    if (!philosopher) {
      return;
    }

    handledSelectionRef.current = marker;
    startConversationWith(philosopher);
  }, [startConversationWith]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const submitMessage = (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || !activeConversation || !activePhilosopher || isResponding || isSelectingPhilosopher) {
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
              title: conversation.messages.length <= 1 ? trimmed.slice(0, 32) : conversation.title,
              messages: [...conversation.messages, userMessage],
            }
          : conversation,
      ),
    );
    setDraft("");
    setIsResponding(true);

    window.setTimeout(() => {
      messageIdRef.current += 1;
      const assistantMessage: Message = {
        id: `msg-${messageIdRef.current}-a`,
        role: "assistant",
        text: buildAssistantReply(activePhilosopher, trimmed),
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
      setIsResponding(false);
    }, 500);
  };

  const createConversation = () => {
    setIsSelectingPhilosopher(true);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    submitMessage(draft);
  };

  const copyMessage = async (text: string) => {
    if (!navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard failures in restricted browser contexts.
    }
  };

  const handleVoiceInput = useCallback(() => {
    if (isSelectingPhilosopher) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechRecognitionConstructor =
      (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructorLike;
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
      }).SpeechRecognition ??
      (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructorLike;
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
      }).webkitSpeechRecognition;

    if (!speechRecognitionConstructor) {
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new speechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        if (isCancellingVoiceRef.current) {
          return;
        }

        let finalTranscript = "";
        let interimTranscript = "";

        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result[0]?.transcript ?? "";

          if (result.isFinal) {
            finalTranscript += transcript;
            continue;
          }

          interimTranscript += transcript;
        }

        const combinedDraft = `${finalTranscript} ${interimTranscript}`.trim();

        setDraft(combinedDraft);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isCancellingVoiceRef.current) {
          isCancellingVoiceRef.current = false;
          setDraft("");
        }

        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    isCancellingVoiceRef.current = false;
    setDraft("");

    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening, isSelectingPhilosopher]);

  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const cancelVoiceInput = useCallback(() => {
    isCancellingVoiceRef.current = true;
    recognitionRef.current?.stop();
    setDraft("");
    setIsListening(false);
  }, []);

  const hasDraft = draft.trim().length > 0;

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#ffffff] text-[#111827]">
      <aside>
        <div
          className={`flex h-full flex-col border-r border-[#e5e7eb] bg-[#ffffff] transition-all duration-200 ${
            isSidebarOpen ? "w-[290px]" : "w-[72px]"
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <button
              type="button"
              aria-label="toggle sidebar"
              onClick={() => setIsSidebarOpen((value) => !value)}
              className="rounded-md p-2 text-[#4b5563] transition hover:bg-[#eff6ff]"
            >
              <IconHamburger />
            </button>

            {isSidebarOpen ? (
              <button
                type="button"
                onClick={createConversation}
                className="rounded-md p-2 text-[#4b5563] transition hover:bg-[#eff6ff]"
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
                  onClick={createConversation}
                  className="flex w-full items-center gap-2 rounded-lg border border-[#93c5fd] bg-[#eff6ff] px-3 py-2 text-sm font-medium text-[#1d4ed8] transition hover:bg-[#dbeafe]"
                >
                  <IconSquarePen />
                  새 채팅
                </button>
                <button
                  type="button"
                  className="mt-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#374151] transition hover:bg-[#eff6ff]"
                >
                  <IconSearch />
                  채팅 검색
                </button>
                <div className="mt-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="대화 제목 검색"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#60a5fa] focus:ring-2 focus:ring-[#93c5fd]"
                  />
                </div>
              </div>

              <div className="mt-3 border-t border-[#e5e7eb] pt-3">
                <p className="px-6 text-xs text-[#9ca3af]">프로젝트</p>
                <div className="mt-1 px-2">
                  <p className="rounded-lg px-3 py-2 text-sm text-[#9ca3af]">프로젝트가 없습니다.</p>
                </div>
              </div>

              <div className="mt-3 border-t border-[#e5e7eb] pt-3">
                <p className="px-6 text-xs text-[#9ca3af]">최근</p>
                <div className="mt-1 px-2">
                  {filteredRecentConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversation?.id;
                    const philosopherName =
                      philosophers.find((philosopher) => philosopher.id === conversation.philosopherId)?.name ??
                      "Unknown";

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          setActiveConversationId(conversation.id);
                          setIsSelectingPhilosopher(false);
                        }}
                        className={`mb-0.5 block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                          isActive ? "bg-[#eff6ff] text-[#1d4ed8]" : "text-[#374151] hover:bg-[#eff6ff]"
                        }`}
                      >
                        <span className="block truncate">{conversation.title}</span>
                        <span className="block truncate text-xs text-[#9ca3af]">{philosopherName}</span>
                      </button>
                    );
                  })}
                  {filteredRecentConversations.length === 0 ? (
                    <p className="rounded-lg px-3 py-2 text-sm text-[#9ca3af]">최근 대화가 없습니다.</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-auto border-t border-[#e5e7eb] p-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#eff6ff]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f4f6] text-xs text-[#374151]">이</span>
                  이 건희
                </button>
              </div>
            </>
          ) : (
            <div className="mt-auto border-t border-[#e5e7eb] p-3">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-xs text-[#374151]">이</span>
            </div>
          )}
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[#e5e7eb] bg-[#ffffff] px-4 md:px-6">
          <button
            type="button"
            onClick={() => setIsSelectingPhilosopher(true)}
            className="text-[18px] font-semibold tracking-tight text-[#111827]"
          >
            {activePhilosopher?.name ?? "철학자 선택"} <span className="ml-1 text-sm text-[#2563eb]">▾</span>
          </button>

          <div className="flex items-center gap-3 text-sm text-[#4b5563]">
            <button type="button" className="rounded-md px-2.5 py-1.5 hover:bg-[#eff6ff]">
              공유하기
            </button>
            <button type="button" className="rounded-md px-2 py-1.5 hover:bg-[#eff6ff]" aria-label="more options">
              •••
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[920px] px-5 pb-36 pt-8 md:px-8">
            {isSelectingPhilosopher ? (
              <>
                <header className="mb-6">
                  <p className="text-xs tracking-[0.18em] text-[#9ca3af] uppercase">New Conversation</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111827]">대화할 철학자를 선택하세요</h1>
                  <p className="mt-2 text-sm text-[#6b7280]">선택 후 바로 같은 화면에서 대화가 시작됩니다.</p>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {philosophers.map((philosopher) => (
                    <article
                      key={philosopher.id}
                      className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_10px_26px_rgba(17,24,39,0.08)]"
                    >
                      <p className="text-xs text-[#9ca3af]">{philosopher.era}</p>
                      <h2 className="mt-1 text-xl font-semibold text-[#111827]">{philosopher.name}</h2>
                      <p className="mt-2 text-xs text-[#9ca3af]">{philosopher.school}</p>

                      <p className="mt-4 text-sm leading-6 text-[#4b5563]">{philosopher.summary}</p>

                      <p className="mt-4 text-xs font-medium text-[#9ca3af]">대화 톤</p>
                      <p className="mt-1 text-sm text-[#374151]">{philosopher.tone}</p>

                      <button
                        type="button"
                        onClick={() => startConversationWith(philosopher)}
                        className="mt-5 w-full rounded-xl border border-[#93c5fd] bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#1d4ed8] transition hover:bg-[#dbeafe]"
                      >
                        선택하기
                      </button>
                    </article>
                  ))}
                </section>
              </>
            ) : null}

            {!isSelectingPhilosopher && !activeConversation ? (
              <div className="py-20 text-center text-[#6b7280]">
                <p className="text-xl font-medium text-[#1d4ed8]">새 대화를 시작하세요</p>
                <p className="mt-2 text-sm">왼쪽에서 `새 채팅`을 누르거나 상단 철학자 메뉴를 눌러 대화를 시작할 수 있습니다.</p>
              </div>
            ) : null}

            {!isSelectingPhilosopher
              ? activeConversation?.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`mb-7 ${message.role === "user" ? "ml-auto max-w-[90%]" : "mr-auto w-full"}`}
                  >
                    {message.role === "user" ? (
                      <>
                        <div className="ml-auto max-w-[620px] rounded-3xl bg-[#eff6ff] px-5 py-4 text-[15px] leading-7 text-[#1e3a8a]">
                          {message.text}
                        </div>
                        <div className="mt-2 flex justify-end gap-2 text-[#9ca3af]">
                          <button
                            type="button"
                            onClick={() => copyMessage(message.text)}
                            className="rounded-md p-1.5 hover:bg-[#eff6ff]"
                            aria-label="copy"
                          >
                            <IconCopy />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraft(message.text)}
                            className="rounded-md p-1.5 hover:bg-[#eff6ff]"
                            aria-label="edit"
                          >
                            <IconEdit />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="max-w-[720px] whitespace-pre-line text-[17px] leading-8 text-[#111827]">{message.text}</div>
                    )}
                  </article>
                ))
              : null}
            {!isSelectingPhilosopher && isResponding ? <div className="mb-6 text-sm text-[#9ca3af]">답변 작성 중...</div> : null}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4">
          <div className="pointer-events-auto w-full max-w-[860px]">
            <div className="rounded-[26px] border border-[#e5e7eb] bg-white px-3 py-2 shadow-[0_-1px_0_rgba(17,24,39,0.06),0_10px_30px_rgba(17,24,39,0.12)]">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={isSelectingPhilosopher ? "먼저 철학자를 선택해주세요." : "변경할 내용이 있으신가요?"}
                  disabled={isSelectingPhilosopher}
                  className="h-11 flex-1 bg-transparent px-2 text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
                />
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <button
                      type="button"
                      onClick={cancelVoiceInput}
                      className="rounded-full p-2 text-[#4b5563] hover:bg-[#eff6ff]"
                      aria-label="cancel voice input"
                    >
                      <IconClose />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceInput : handleVoiceInput}
                    disabled={isSelectingPhilosopher}
                    className={`rounded-full p-2 text-[#4b5563] hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:opacity-60 ${
                      isListening ? "bg-[#eff6ff] text-[#1d4ed8]" : ""
                    }`}
                    aria-label={isListening ? "confirm voice input" : "voice input"}
                  >
                    {isListening ? <IconCheck /> : <IconMic />}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitMessage(draft)}
                    disabled={!hasDraft || !activeConversation || isResponding || isSelectingPhilosopher}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white transition hover:from-[#3b82f6] hover:to-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#b9b9b9] disabled:bg-none"
                    aria-label={hasDraft ? "send message" : "voice message"}
                  >
                    {hasDraft ? <IconSend /> : <IconVoiceWave />}
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-[#9ca3af]">
              ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
