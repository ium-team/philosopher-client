"use client";

import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
  projectId?: string;
  pinned?: boolean;
  recent?: boolean;
  messages: Message[];
};

type Project = {
  id: string;
  name: string;
  icon: string;
};

type ServicePageProps = {
  startInSelection?: boolean;
};
const COMPOSER_MAX_HEIGHT_PX = 220;

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
const initialProjects: Project[] = [];
const DEFAULT_PROJECT_ICON = "📁";
const PROJECT_ICON_OPTIONS = ["📁", "🧠", "📚", "💡", "🧪", "⚙️", "🎯", "🚀"];

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

function IconFolderPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l1.5 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-12.5a2 2 0 0 1-2-2z" />
      <path d="M12 11v5M9.5 13.5h5" strokeLinecap="round" />
    </svg>
  );
}

function IconFolder({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l1.5 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-12.5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M14 3l7 7-3 1-3 6-2-2-6 3-1-1 3-6-2-2 6-3z" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5h6v2M8 7l.7 12h6.6L16 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFolderMove() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l1.5 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-12.5a2 2 0 0 1-2-2z" />
      <path d="M11 13h6M15 10l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ServicePage({ startInSelection = false }: ServicePageProps) {
  const router = useRouter();

  const [projects, setProjects] = useState(initialProjects);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isSelectingPhilosopher, setIsSelectingPhilosopher] = useState(startInSelection);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isProjectMoveMenuOpen, setIsProjectMoveMenuOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isProjectDeleteConfirmOpen, setIsProjectDeleteConfirmOpen] = useState(false);
  const [projectSettingsName, setProjectSettingsName] = useState("");
  const [projectSettingsIcon, setProjectSettingsIcon] = useState(DEFAULT_PROJECT_ICON);
  const [projectSettingsGuideline, setProjectSettingsGuideline] = useState(
    "내가 분야를 말하면 그 분야의 cs 지식에 대한 질문을 던져주는데 일단 너의 형식을 알려주자면 질문주고나서 내가 답변을 하면 너는 그 답을 평가해줘.",
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const moveMenuRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);
  const projectIdRef = useRef(0);
  const conversationIdRef = useRef(0);
  const handledSelectionRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isCancellingVoiceRef = useRef(false);
  const [isListening, setIsListening] = useState(false);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) {
      return null;
    }

    const selected = conversations.find((conversation) => conversation.id === activeConversationId);
    if (!selected) {
      return null;
    }

    if (activeProjectId && selected.projectId !== activeProjectId) {
      return null;
    }

    return selected;
  }, [activeConversationId, activeProjectId, conversations]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, projects],
  );
  const isProjectHome = Boolean(activeProject && !activeConversationId && !isSelectingPhilosopher);
  const moveTargetProjects = useMemo(
    () => projects.filter((project) => project.id !== activeConversation?.projectId),
    [activeConversation?.projectId, projects],
  );

  const activePhilosopher = useMemo(() => {
    if (!activeConversation) {
      return null;
    }

    return philosophers.find((philosopher) => philosopher.id === activeConversation.philosopherId) ?? null;
  }, [activeConversation]);

  const filteredRecentConversations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    const filtered = conversations.filter((conversation) => {
      if (!conversation.recent) {
        return false;
      }

      // "최근"은 프로젝트에 속하지 않은 일반 채팅만 보여준다.
      if (conversation.projectId) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return conversation.title.toLowerCase().includes(normalized);
    });

    return filtered.sort((left, right) => Number(Boolean(right.pinned)) - Number(Boolean(left.pinned)));
  }, [conversations, searchQuery]);
  const projectConversations = useMemo(
    () =>
      activeProjectId
        ? conversations.filter((conversation) => conversation.projectId === activeProjectId)
        : [],
    [activeProjectId, conversations],
  );

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
      projectId: activeProjectId ?? undefined,
      recent: true,
      messages: [seededMessage],
    };

    setConversations((previous) => [conversation, ...previous]);
    setActiveConversationId(conversationId);
    setDraft("");
    setIsSelectingPhilosopher(false);
    router.replace(`/service?conversation=${conversationId}`);
  }, [activeProjectId, router]);

  const createProject = () => {
    const defaultName = `프로젝트 ${projects.length + 1}`;
    const input = window.prompt("새 프로젝트 이름을 입력하세요.", defaultName);
    if (!input) {
      return;
    }

    const name = input.trim();
    if (!name) {
      return;
    }

    projectIdRef.current += 1;
    const projectId = `project-${projectIdRef.current}`;
    const project: Project = { id: projectId, name: name.slice(0, 30), icon: DEFAULT_PROJECT_ICON };

    setProjects((previous) => [project, ...previous]);
    setActiveProjectId(projectId);
    setIsSelectingPhilosopher(true);
  };

  const moveConversationTo = (targetProjectId: string | null) => {
    if (!activeConversation) {
      return;
    }

    setConversations((previous) =>
      previous.map((item) =>
        item.id === activeConversation.id
          ? {
              ...item,
              projectId: targetProjectId ?? undefined,
            }
          : item,
      ),
    );
    setActiveProjectId(targetProjectId);
    setIsMoveMenuOpen(false);
    setIsProjectMoveMenuOpen(false);
  };

  const togglePinActiveConversation = () => {
    if (!activeConversation) {
      return;
    }

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              pinned: !conversation.pinned,
            }
          : conversation,
      ),
    );
    setIsMoveMenuOpen(false);
  };

  const deleteActiveConversation = () => {
    if (!activeConversation) {
      return;
    }

    setConversations((previous) => previous.filter((conversation) => conversation.id !== activeConversation.id));
    setActiveConversationId("");
    setIsSelectingPhilosopher(false);
    setIsMoveMenuOpen(false);
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollTop = scroller.scrollHeight;
  }, [activeConversation?.messages.length, isResponding, isSelectingPhilosopher]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) {
      return;
    }

    composer.style.height = "auto";
    const nextHeight = Math.min(composer.scrollHeight, COMPOSER_MAX_HEIGHT_PX);
    composer.style.height = `${nextHeight}px`;
    composer.style.overflowY = composer.scrollHeight > COMPOSER_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [draft, isSelectingPhilosopher]);

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

  useEffect(() => {
    if (!isMoveMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!moveMenuRef.current?.contains(event.target as Node)) {
        setIsMoveMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      setIsProjectMoveMenuOpen(false);
    };
  }, [isMoveMenuOpen]);

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
    // Sidebar "새 채팅"은 항상 일반 채팅에서 시작한다.
    setActiveProjectId(null);
    setActiveConversationId("");
    setIsSelectingPhilosopher(true);
  };
  const createProjectConversation = () => {
    if (!activeProjectId) {
      return;
    }

    setActiveConversationId("");
    setIsSelectingPhilosopher(true);
  };
  const closeProjectSettings = () => {
    if (!activeProject) {
      setIsProjectSettingsOpen(false);
      return;
    }

    const trimmed = projectSettingsName.trim();
    setProjects((previous) =>
      previous.map((project) =>
        project.id === activeProject.id
          ? {
              ...project,
              name: trimmed ? trimmed.slice(0, 30) : project.name,
              icon: projectSettingsIcon || DEFAULT_PROJECT_ICON,
            }
          : project,
      ),
    );

    setIsProjectSettingsOpen(false);
    setIsProjectDeleteConfirmOpen(false);
  };
  const openProjectSettings = () => {
    if (!activeProject) {
      return;
    }

    setProjectSettingsName(activeProject.name);
    setProjectSettingsIcon(activeProject.icon || DEFAULT_PROJECT_ICON);
    setIsMoveMenuOpen(false);
    setIsProjectSettingsOpen(true);
  };
  const deleteActiveProject = () => {
    if (!activeProject) {
      return;
    }

    setProjects((previous) => previous.filter((project) => project.id !== activeProject.id));
    setConversations((previous) => previous.filter((conversation) => conversation.projectId !== activeProject.id));
    setActiveProjectId(null);
    setActiveConversationId("");
    setIsProjectSettingsOpen(false);
    setIsProjectDeleteConfirmOpen(false);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
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
              className="rounded-md p-2 text-[#4b5563] transition hover:bg-[#fff3e0]"
            >
              <IconHamburger />
            </button>

            {isSidebarOpen ? (
              <button
                type="button"
                onClick={createConversation}
                className="rounded-md p-2 text-[#4b5563] transition hover:bg-[#fff3e0]"
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
                  className="flex w-full items-center gap-2 rounded-lg border border-[#ffb74d] bg-[#fff3e0] px-3 py-2 text-sm font-medium text-[#ff6d00] transition hover:bg-[#ffe0b2]"
                >
                  <IconSquarePen />
                  새 채팅
                </button>
                <div className="mt-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="대화 제목 검색"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#ff8a3d] focus:ring-2 focus:ring-[#ffb74d]"
                  />
                </div>
              </div>

              <div className="mt-3 border-t border-[#e5e7eb] pt-3">
                <p className="px-6 text-xs text-[#9ca3af]">프로젝트</p>
                <div className="mt-1 px-2">
                  <button
                    type="button"
                    onClick={createProject}
                    className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#1f2937] transition hover:bg-[#f3f4f6]"
                  >
                    <span className="text-[#374151]">
                      <IconFolderPlus />
                    </span>
                    새 프로젝트
                  </button>
                  {projects.map((project) => {
                    const isActive = activeProjectId === project.id;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setActiveProjectId(project.id);
                          setActiveConversationId("");
                          setIsSelectingPhilosopher(false);
                        }}
                        className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#1f2937] transition ${
                          isActive ? "bg-[#fff3e0]" : "hover:bg-[#f3f4f6]"
                        }`}
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center text-base leading-none text-[#374151]">
                          {project.icon || DEFAULT_PROJECT_ICON}
                        </span>
                        <span className="block truncate">{project.name}</span>
                      </button>
                    );
                  })}
                  {projects.length === 0 ? (
                    <p className="rounded-lg px-3 py-2 text-sm text-[#9ca3af]">프로젝트가 없습니다.</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 border-t border-[#e5e7eb] pt-3">
                <button
                  type="button"
                  onClick={() => setActiveProjectId(null)}
                  className={`px-6 text-xs transition ${
                    activeProjectId === null ? "text-[#ff6d00]" : "text-[#9ca3af] hover:text-[#6b7280]"
                  }`}
                >
                  최근
                </button>
                <div className="mt-1 px-2">
                  {filteredRecentConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversation?.id;
                    const philosopher = philosophers.find((item) => item.id === conversation.philosopherId);
                    const philosopherName = philosopher?.name ?? "Unknown";
                    const projectName = conversation.projectId ? "프로젝트" : "일반";

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          setActiveProjectId(null);
                          setActiveConversationId(conversation.id);
                          setIsSelectingPhilosopher(false);
                        }}
                        className={`mb-0.5 block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                          isActive ? "bg-[#fff3e0] text-[#ff6d00]" : "text-[#374151] hover:bg-[#fff3e0]"
                        }`}
                      >
                        <span className="block truncate">{conversation.title}</span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-[#9ca3af]">
                          {philosopher ? (
                            <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#fbf5ec]">
                              <Image
                                src={philosopher.imageSrc}
                                alt={`${philosopherName} portrait`}
                                width={20}
                                height={20}
                                className="h-full w-full scale-125 object-contain object-bottom"
                              />
                            </span>
                          ) : (
                            <span className="h-4 w-4 rounded-full bg-[#e5e7eb]" />
                          )}
                          <span className="truncate">
                            {philosopherName} · {projectName}
                          </span>
                          {conversation.pinned ? <span className="rounded bg-[#fff3e0] px-1.5 py-0.5 text-[10px] text-[#ff6d00]">고정</span> : null}
                        </span>
                      </button>
                    );
                  })}
                  {filteredRecentConversations.length === 0 ? (
                    <p className="rounded-lg px-3 py-2 text-sm text-[#9ca3af]">
                      {activeProject ? "이 프로젝트에 대화가 없습니다." : "최근 대화가 없습니다."}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-auto border-t border-[#e5e7eb] p-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#fff3e0]"
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
            className="flex items-center gap-2 text-[18px] font-semibold tracking-tight text-[#111827]"
          >
            {activePhilosopher ? (
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#fbf5ec]">
                <Image
                  src={activePhilosopher.imageSrc}
                  alt={`${activePhilosopher.name} portrait`}
                  width={40}
                  height={40}
                  className="h-full w-full scale-125 object-contain object-bottom"
                />
              </span>
            ) : (
              <span className="h-8 w-8 rounded-full bg-[#f3f4f6]" />
            )}
            {activePhilosopher?.name ?? "철학자 선택"} <span className="ml-1 text-sm text-[#ff7f11]">▾</span>
          </button>

          <div ref={moveMenuRef} className="relative flex items-center gap-3 text-sm text-[#4b5563]">
            <button type="button" className="rounded-md px-2.5 py-1.5 hover:bg-[#fff3e0]">
              공유하기
            </button>
            <button
              type="button"
              onClick={() => setIsMoveMenuOpen((value) => !value)}
              disabled={!activeConversation && !isProjectHome}
              className="rounded-md px-2 py-1.5 hover:bg-[#fff3e0] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="more options"
            >
              •••
            </button>
            {isMoveMenuOpen && (activeConversation || isProjectHome) ? (
              <div className="absolute right-0 top-11 z-20 w-48 rounded-2xl border border-[#d1d5db] bg-[#f9fafb] p-1 shadow-[0_10px_24px_rgba(17,24,39,0.15)]">
                {isProjectHome ? (
                  <button
                    type="button"
                    onClick={openProjectSettings}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-[#1f2937] transition hover:bg-white"
                  >
                    <span className="text-[#374151]">
                      <IconEdit />
                    </span>
                    프로젝트 설정
                  </button>
                ) : null}
                {!isProjectHome && moveTargetProjects.length > 0 ? (
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setIsProjectMoveMenuOpen(true)}
                      onClick={() => setIsProjectMoveMenuOpen((value) => !value)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-[#1f2937] transition hover:bg-white"
                    >
                      <span className="text-[#374151]">
                        <IconFolderMove />
                      </span>
                      <span className="flex-1">프로젝트로 이동</span>
                      <span className="text-[#6b7280]">
                        <IconArrowRight />
                      </span>
                    </button>
                    {isProjectMoveMenuOpen ? (
                      <div className="absolute top-0 right-[100%] z-30 mr-1 w-44 rounded-2xl border border-[#d1d5db] bg-[#f9fafb] p-1 shadow-[0_10px_24px_rgba(17,24,39,0.15)]">
                        {moveTargetProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onMouseEnter={() => moveConversationTo(project.id)}
                            onClick={() => moveConversationTo(project.id)}
                            className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] text-[#1f2937] transition hover:bg-white"
                          >
                            {project.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {!isProjectHome && activeConversation ? (
                  <button
                    type="button"
                    onClick={togglePinActiveConversation}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-[#1f2937] transition hover:bg-white"
                  >
                    <span className="text-[#374151]">
                      <IconPin />
                    </span>
                    {activeConversation.pinned ? "채팅 고정 해제" : "채팅 고정"}
                  </button>
                ) : null}
                {!isProjectHome && activeConversation?.projectId ? (
                  <button
                    type="button"
                    onMouseEnter={() => moveConversationTo(null)}
                    onClick={() => moveConversationTo(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-[#1f2937] transition hover:bg-white"
                  >
                    <span className="text-[#374151]">
                      <IconFolderMove />
                    </span>
                    메인으로 이동
                  </button>
                ) : null}
                {!isProjectHome && activeConversation ? (
                  <>
                    <div className="my-0.5 h-px bg-[#f1f5f9]" />
                    <button
                      type="button"
                      onClick={deleteActiveConversation}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-[#dc2626] transition hover:bg-white"
                    >
                      <span>
                        <IconTrash />
                      </span>
                      채팅 삭제
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[920px] px-5 pb-36 pt-8 md:px-8">
            {isSelectingPhilosopher ? (
              <>
                <header className="mb-6">
                  <p className="text-xs tracking-[0.18em] text-[#9ca3af] uppercase">New Conversation</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111827]">대화할 철학자를 선택하세요</h1>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    선택 후 바로 같은 화면에서 대화가 시작됩니다.
                    {activeProject ? ` 현재 프로젝트: ${activeProject.name}` : ""}
                  </p>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {philosophers.map((philosopher) => (
                    <article
                      key={philosopher.id}
                      className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_10px_26px_rgba(17,24,39,0.08)]"
                    >
                      <div className="relative mb-4 h-56 overflow-hidden rounded-2xl border border-[#ebeef2] bg-[radial-gradient(circle_at_50%_20%,#fbfdff_0%,#edf2f7_74%)]">
                        <div className="absolute inset-x-5 bottom-3 h-8 rounded-full bg-[#334155]/20 blur-md" />
                        <Image
                          src={philosopher.imageSrc}
                          alt={`${philosopher.name} portrait`}
                          width={1024}
                          height={1536}
                          className="relative z-10 mx-auto h-full w-full object-contain object-bottom px-2 py-1 drop-shadow-[0_12px_20px_rgba(17,24,39,0.28)]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      </div>
                      <p className="text-xs text-[#9ca3af]">{philosopher.era}</p>
                      <h2 className="mt-1 text-xl font-semibold text-[#111827]">{philosopher.name}</h2>
                      <p className="mt-2 text-xs text-[#9ca3af]">{philosopher.school}</p>

                      <p className="mt-4 text-sm leading-6 text-[#4b5563]">{philosopher.summary}</p>

                      <p className="mt-4 text-xs font-medium text-[#9ca3af]">대화 톤</p>
                      <p className="mt-1 text-sm text-[#374151]">{philosopher.tone}</p>

                      <button
                        type="button"
                        onClick={() => startConversationWith(philosopher)}
                        className="mt-5 w-full rounded-xl border border-[#ffb74d] bg-[#fff3e0] px-4 py-2.5 text-sm font-semibold text-[#ff6d00] transition hover:bg-[#ffe0b2]"
                      >
                        선택하기
                      </button>
                    </article>
                  ))}
                </section>
              </>
            ) : null}

            {!isSelectingPhilosopher && !activeConversation ? (
              activeProject ? (
                <div className="py-4">
                  <div>
                    <div className="mb-6 flex items-center justify-between gap-5">
                      <div className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-[#111827]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[22px] leading-none text-[#4b5563]">
                          {activeProject.icon || DEFAULT_PROJECT_ICON}
                        </span>
                        {activeProject.name}
                      </div>
                      <button
                        type="button"
                        onClick={createProjectConversation}
                        className="rounded-xl border border-[#ffb74d] bg-[#fff3e0] px-4 py-2 text-base font-medium text-[#ff6d00] transition hover:bg-[#ffe0b2]"
                      >
                        새 채팅
                      </button>
                    </div>
                    <div className="mb-4 h-px bg-[#e5e7eb]" />
                    <div className="mb-3">
                      <span className="inline-flex rounded-full bg-[#f3f4f6] px-4 py-1 text-sm font-semibold text-[#1f2937]">
                        채팅
                      </span>
                    </div>
                    <div className="space-y-1">
                      {projectConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => setActiveConversationId(conversation.id)}
                          className="flex w-full items-start justify-between gap-4 rounded-lg px-3 py-2 text-left transition hover:bg-[#f7f7f7]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-[#1f2937]">{conversation.title}</p>
                            <p className="mt-1 truncate text-sm text-[#6b7280]">
                              {conversation.messages[conversation.messages.length - 1]?.text ?? "대화를 시작해보세요."}
                            </p>
                          </div>
                          <span className="shrink-0 pt-0.5 text-xs text-[#9ca3af]">
                            {conversation.messages[conversation.messages.length - 1]?.timestamp ?? "방금"}
                          </span>
                        </button>
                      ))}
                      {projectConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280]">
                            <IconFolder />
                          </div>
                          <p className="mt-4 text-xl font-semibold text-[#111827]">채팅이 없습니다</p>
                          <p className="mt-2 text-sm text-[#8a919e]">새 채팅을 시작하면 여기에 표시됩니다.</p>
                          <button
                            type="button"
                            onClick={createProjectConversation}
                            className="mt-6 rounded-lg border border-[#ffb74d] bg-[#fff3e0] px-4 py-2 text-sm font-medium text-[#ff6d00] transition hover:bg-[#ffe0b2]"
                          >
                            새 채팅
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-[#6b7280]">
                  <p className="text-xl font-medium text-[#ff6d00]">새 대화를 시작하세요</p>
                  <p className="mt-2 text-sm">왼쪽에서 `새 채팅`을 눌러 대화를 시작할 수 있습니다.</p>
                </div>
              )
            ) : null}

            {!isSelectingPhilosopher
              ? activeConversation?.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`mb-7 ${message.role === "user" ? "ml-auto max-w-[90%]" : "mr-auto w-full"}`}
                  >
                    {message.role === "user" ? (
                      <>
                        <div className="ml-auto max-w-[620px] rounded-3xl bg-[#fff3e0] px-5 py-4 text-[15px] leading-7 text-[#c2410c]">
                          {message.text}
                        </div>
                        <div className="mt-2 flex justify-end gap-2 text-[#9ca3af]">
                          <button
                            type="button"
                            onClick={() => copyMessage(message.text)}
                            className="rounded-md p-1.5 hover:bg-[#fff3e0]"
                            aria-label="copy"
                          >
                            <IconCopy />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraft(message.text)}
                            className="rounded-md p-1.5 hover:bg-[#fff3e0]"
                            aria-label="edit"
                          >
                            <IconEdit />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="max-w-[720px]">
                        <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.14em] text-[#9ca3af] uppercase">
                          {activePhilosopher ? (
                            <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#fbf5ec]">
                              <Image
                                src={activePhilosopher.imageSrc}
                                alt={`${activePhilosopher.name} portrait`}
                                width={24}
                                height={24}
                                className="h-full w-full scale-125 object-contain object-bottom"
                              />
                            </span>
                          ) : (
                            <span className="h-5 w-5 rounded-full bg-[#e5e7eb]" />
                          )}
                          {activePhilosopher?.name ?? "Philosopher"}
                        </div>
                        <div className="whitespace-pre-line text-[17px] leading-8 text-[#111827]">{message.text}</div>
                      </div>
                    )}
                  </article>
                ))
              : null}
            {!isSelectingPhilosopher && isResponding ? <div className="mb-6 text-sm text-[#9ca3af]">답변 작성 중...</div> : null}
          </div>
        </div>

        {!(activeProject && !activeConversation && !isSelectingPhilosopher) ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4">
            <div className="pointer-events-auto w-full max-w-[860px]">
              <div className="rounded-[26px] border border-[#e5e7eb] bg-white px-3 py-2 shadow-[0_-1px_0_rgba(17,24,39,0.06),0_10px_30px_rgba(17,24,39,0.12)]">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={composerRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={isSelectingPhilosopher ? "먼저 철학자를 선택해주세요." : "변경할 내용이 있으신가요?"}
                    disabled={isSelectingPhilosopher}
                    rows={1}
                    className="max-h-[220px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[#111827] outline-none placeholder:text-[#9ca3af] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
                  />
                  <div className="flex items-center gap-2">
                    {isListening ? (
                      <button
                        type="button"
                        onClick={cancelVoiceInput}
                        className="rounded-full p-2 text-[#4b5563] hover:bg-[#fff3e0]"
                        aria-label="cancel voice input"
                      >
                        <IconClose />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={isListening ? stopVoiceInput : handleVoiceInput}
                      disabled={isSelectingPhilosopher}
                      className={`rounded-full p-2 text-[#4b5563] hover:bg-[#fff3e0] disabled:cursor-not-allowed disabled:opacity-60 ${
                        isListening ? "bg-[#fff3e0] text-[#ff6d00]" : ""
                      }`}
                      aria-label={isListening ? "confirm voice input" : "voice input"}
                    >
                      {isListening ? <IconCheck /> : <IconMic />}
                    </button>
                    <button
                      type="button"
                      onClick={() => submitMessage(draft)}
                      disabled={!hasDraft || !activeConversation || isResponding || isSelectingPhilosopher}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7f11] to-[#ff6d00] text-white transition hover:from-[#ffc933] hover:to-[#ff7f11] disabled:cursor-not-allowed disabled:bg-[#b9b9b9] disabled:bg-none"
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
        ) : null}
        {isProjectSettingsOpen && activeProject ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={closeProjectSettings}
          >
            <div
              className="w-full max-w-[640px] rounded-2xl border border-[#d1d5db] bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.2)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[30px] font-semibold tracking-tight text-[#111827]">프로젝트 설정</h2>
                <button
                  type="button"
                  onClick={closeProjectSettings}
                  className="rounded-xl border border-[#111827] p-2 text-[#111827] hover:bg-[#f3f4f6]"
                  aria-label="close project settings"
                >
                  <IconClose />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-[#1f2937]">프로젝트 이름</p>
                  <input
                    value={projectSettingsName}
                    onChange={(event) => setProjectSettingsName(event.target.value)}
                    className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2 text-base text-[#111827] outline-none focus:border-[#ff8a3d] focus:ring-2 focus:ring-[#ffb74d]"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-[#1f2937]">아이콘</p>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_ICON_OPTIONS.map((icon) => {
                      const isSelected = projectSettingsIcon === icon;

                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setProjectSettingsIcon(icon)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-xl leading-none transition ${
                            isSelected
                              ? "border-[#ff8a3d] bg-[#fff3e0]"
                              : "border-[#d1d5db] bg-white hover:bg-[#f9fafb]"
                          }`}
                          aria-label={`project icon ${icon}`}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-[#1f2937]">지침</p>
                  <p className="mb-2 text-sm text-[#9ca3af]">
                    컨텍스트를 설정하고 프로젝트 내에서 ChatGPT가 응답하는 방식을 맞춤 설정하세요.
                  </p>
                  <textarea
                    value={projectSettingsGuideline}
                    onChange={(event) => setProjectSettingsGuideline(event.target.value)}
                    rows={5}
                    className="w-full resize-y rounded-xl border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#ff8a3d] focus:ring-2 focus:ring-[#ffb74d]"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-[#1f2937]">메모리</p>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-[#d1d5db] bg-white px-3 py-2 text-left text-base text-[#6b7280]"
                  >
                    <span>기본값</span>
                    <span className="text-[#9ca3af]">▾</span>
                  </button>
                  <p className="mt-2 text-sm text-[#9ca3af]">
                    프로젝트가 외부 채팅에서 메모리에 액세스할 수 있으며 그 반대도 가능합니다. 이는 변경할 수 없습니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProjectDeleteConfirmOpen(true)}
                  className="rounded-full border border-[#ef4444] px-4 py-2 text-base text-[#ef4444] transition hover:bg-[#fff1f2]"
                >
                  프로젝트 삭제
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {isProjectDeleteConfirmOpen && activeProject ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[520px] rounded-2xl border border-[#d1d5db] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.2)]">
              <h3 className="text-[34px] font-semibold tracking-tight text-[#111827]">프로젝트를 삭제할까요?</h3>
              <p className="mt-4 text-[22px] leading-8 text-[#111827]">
                모든 프로젝트 파일과 채팅이 영구 삭제됩니다. 채팅을 저장하려면 삭제하기 전에 채팅 목록 또는 다른 프로젝트로 옮겨 주세요.
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectDeleteConfirmOpen(false)}
                  className="rounded-full border border-[#d1d5db] px-5 py-2 text-[28px] text-[#374151] transition hover:bg-[#f9fafb]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={deleteActiveProject}
                  className="rounded-full bg-[#dc2626] px-5 py-2 text-[28px] text-white transition hover:bg-[#b91c1c]"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
