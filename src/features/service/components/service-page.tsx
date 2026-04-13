"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
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
  const router = useRouter();

  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);
  const conversationIdRef = useRef(0);
  const handledSelectionRef = useRef<string | null>(null);

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

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollTop = scroller.scrollHeight;
  }, [activeConversation?.messages.length, isResponding]);

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
    router.replace(`/service?conversation=${conversationId}`);
  }, [router]);

  const submitMessage = (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || !activeConversation || !activePhilosopher || isResponding) {
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
    router.push("/service/new");
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
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
                onClick={createConversation}
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
                  onClick={createConversation}
                  className="flex w-full items-center gap-2 rounded-lg border border-[#fed7aa] bg-[#fff2e8] px-3 py-2 text-sm font-medium text-[#9a3412] transition hover:bg-[#ffe8d6]"
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
                <div className="mt-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="대화 제목 검색"
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#2a2a2a] outline-none placeholder:text-[#9a9a9a] focus:border-[#fb923c] focus:ring-2 focus:ring-[#fed7aa]"
                  />
                </div>
              </div>

              <div className="mt-3 border-t border-[#e6e6e6] pt-3">
                <p className="px-6 text-xs text-[#9a9a9a]">프로젝트</p>
                <div className="mt-1 px-2">
                  <p className="rounded-lg px-3 py-2 text-sm text-[#8b8b8b]">프로젝트가 없습니다.</p>
                </div>
              </div>

              <div className="mt-3 border-t border-[#e6e6e6] pt-3">
                <p className="px-6 text-xs text-[#9a9a9a]">최근</p>
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
                        onClick={() => setActiveConversationId(conversation.id)}
                        className={`mb-0.5 block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                          isActive ? "bg-[#fff1dc] text-[#9a3412]" : "text-[#555] hover:bg-[#e8e8e8]"
                        }`}
                      >
                        <span className="block truncate">{conversation.title}</span>
                        <span className="block truncate text-xs text-[#a3a3a3]">{philosopherName}</span>
                      </button>
                    );
                  })}
                  {filteredRecentConversations.length === 0 ? (
                    <p className="rounded-lg px-3 py-2 text-sm text-[#8b8b8b]">최근 대화가 없습니다.</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-auto border-t border-[#e6e6e6] p-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#555] hover:bg-[#e8e8e8]"
                >
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
            {activePhilosopher?.name ?? "ChatGPT"} <span className="ml-1 text-sm text-[#ea580c]">▾</span>
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
            {activeConversation ? null : (
              <div className="py-20 text-center text-[#7a7a7a]">
                <p className="text-xl font-medium text-[#c2410c]">새 대화를 시작하세요</p>
                <p className="mt-2 text-sm">왼쪽에서 `새 채팅`을 눌러 철학자를 선택하면 대화를 시작할 수 있습니다.</p>
              </div>
            )}
            {activeConversation?.messages.map((message) => (
              <article
                key={message.id}
                className={`mb-7 ${message.role === "user" ? "ml-auto max-w-[90%]" : "mr-auto w-full"}`}
              >
                {message.role === "user" ? (
                  <>
                    <div className="ml-auto max-w-[620px] rounded-3xl bg-[#fff4e6] px-5 py-4 text-[15px] leading-7 text-[#7c2d12]">
                      {message.text}
                    </div>
                    <div className="mt-2 flex justify-end gap-2 text-[#8b8b8b]">
                      <button
                        type="button"
                        onClick={() => copyMessage(message.text)}
                        className="rounded-md p-1.5 hover:bg-[#ededed]"
                        aria-label="copy"
                      >
                        <IconCopy />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft(message.text)}
                        className="rounded-md p-1.5 hover:bg-[#ededed]"
                        aria-label="edit"
                      >
                        <IconEdit />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="max-w-[720px] whitespace-pre-line text-[17px] leading-8 text-[#202020]">{message.text}</div>
                )}
              </article>
            ))}
            {isResponding ? (
              <div className="mb-6 text-sm text-[#a3a3a3]">답변 작성 중...</div>
            ) : null}
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4">
          <div className="pointer-events-auto w-full max-w-[860px]">
            <div className="rounded-[26px] border border-[#dedede] bg-white shadow-[0_-1px_0_rgba(0,0,0,0.04),0_10px_28px_rgba(0,0,0,0.07)]">
              <div className="min-h-[86px] px-4 pt-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="변경할 내용이 있으신가요?"
                  className="h-16 w-full resize-none bg-transparent text-[15px] leading-7 text-[#262626] outline-none placeholder:text-[#9a9a9a]"
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1 text-[#6f6f6f]">
                  <button type="button" className="rounded-full p-2 hover:bg-[#efefef]" aria-label="attach file">
                    <IconClip />
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-2.5 py-1.5 text-sm hover:bg-[#efefef]"
                    aria-label="insert command"
                  >
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
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#6f6f6f] hover:bg-[#efefef]"
                    aria-label="voice input"
                  >
                    <IconMic />
                  </button>
                  <button
                    type="button"
                    onClick={() => submitMessage(draft)}
                    disabled={draft.trim().length === 0 || !activeConversation || isResponding}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-white transition hover:from-[#facc15] hover:to-[#ea580c] disabled:cursor-not-allowed disabled:bg-[#b9b9b9] disabled:bg-none"
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
