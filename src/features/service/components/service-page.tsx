"use client";

import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { philosophers, type PhilosopherProfile } from "@/data/philosophers";
import {
  createDefaultConversation as createDefaultConversationRequest,
  createConversation as createConversationRequest,
  createProject as createProjectRequest,
  deleteConversation as deleteConversationRequest,
  deleteProject as deleteProjectRequest,
  listConversations,
  listMessages,
  listProjects,
  moveConversationProject as moveConversationProjectRequest,
  sendMessage as sendMessageRequest,
  synthesizeSpeech as synthesizeSpeechRequest,
  updateProjectSettings as updateProjectSettingsRequest,
  type ApiConversation,
  type ApiMessage,
  type ApiPhilosopher,
  type ApiProject,
} from "@/features/service/api/chat-api";
import { getCachedTtsBlob, setCachedTtsBlob } from "@/features/service/lib/tts-audio-cache";

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
  instruction: string | null;
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
const VOICE_SILENCE_TIMEOUT_MS = 1600;

function toApiPhilosopherId(philosopherId: string): ApiPhilosopher {
  if (philosopherId === "arendt") {
    return "hannah_arendt";
  }
  if (philosopherId === "socrates" || philosopherId === "nietzsche") {
    return philosopherId;
  }
  return "socrates";
}

function fromApiPhilosopherId(philosopherId: ApiPhilosopher): string {
  if (philosopherId === "hannah_arendt") {
    return "arendt";
  }
  return philosopherId;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "방금";
  }
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapProject(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    instruction: project.instruction,
  };
}

function mapMessage(message: ApiMessage): Message {
  return {
    id: message.id,
    role: message.role,
    text: message.content,
    timestamp: formatTimestamp(message.created_at),
  };
}

function mapMessagesInDisplayOrder(messages: ApiMessage[]): Message[] {
  return messages
    .map((message, index) => ({ message, index }))
    .sort((left, right) => {
      const leftTime = Date.parse(left.message.created_at);
      const rightTime = Date.parse(right.message.created_at);
      const leftTimestamp = Number.isNaN(leftTime) ? 0 : leftTime;
      const rightTimestamp = Number.isNaN(rightTime) ? 0 : rightTime;

      if (leftTimestamp !== rightTimestamp) {
        return leftTimestamp - rightTimestamp;
      }

      if (left.message.role !== right.message.role) {
        return left.message.role === "user" ? -1 : 1;
      }

      return left.index - right.index;
    })
    .map(({ message }) => mapMessage(message));
}

function mapConversation(
  conversation: ApiConversation,
  messages: ApiMessage[],
): Conversation {
  const localPhilosopherId = fromApiPhilosopherId(conversation.philosopher);
  const philosopherName = philosophers.find((item) => item.id === localPhilosopherId)?.name ?? localPhilosopherId;
  const titleFromServer = conversation.title?.trim();
  const fallbackTitle = `${philosopherName} 대화`;

  return {
    id: conversation.id,
    title: titleFromServer && titleFromServer.length > 0 ? titleFromServer : fallbackTitle,
    philosopherId: localPhilosopherId,
    projectId: conversation.project_id,
    recent: true,
    messages: mapMessagesInDisplayOrder(messages),
  };
}

function deriveInitialConversationTitle(content: string, maxLength = 80): string {
  const normalized = content.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return normalized.slice(0, maxLength).trimEnd();
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

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M8 6.2c0-1 1.1-1.6 2-1l8.1 5.8c.7.5.7 1.5 0 2l-8.1 5.8c-.9.6-2 .1-2-1z" />
    </svg>
  );
}

function IconStop() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, signOut } = useAuthSession();

  const profileName = useMemo(() => {
    const fullName = session?.user.user_metadata?.full_name;
    if (typeof fullName === "string" && fullName.trim().length > 0) {
      return fullName.trim();
    }

    const name = session?.user.user_metadata?.name;
    if (typeof name === "string" && name.trim().length > 0) {
      return name.trim();
    }

    const emailId = session?.user.email?.split("@")[0]?.trim();
    if (emailId) {
      return emailId;
    }

    return "로그인 사용자";
  }, [session]);
  const profileEmail = session?.user.email ?? "";
  const profileInitial = (profileName[0] ?? "U").toUpperCase();
  const profileImageUrl = useMemo(() => {
    const avatarUrl = session?.user.user_metadata?.avatar_url;
    if (typeof avatarUrl === "string" && avatarUrl.trim().length > 0) {
      return avatarUrl.trim();
    }

    const picture = session?.user.user_metadata?.picture;
    if (typeof picture === "string" && picture.trim().length > 0) {
      return picture.trim();
    }

    return "";
  }, [session]);

  const [projects, setProjects] = useState(initialProjects);
  const [conversations, setConversations] = useState(initialConversations);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isConversationHydrating, setIsConversationHydrating] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isSelectingPhilosopher, setIsSelectingPhilosopher] = useState(startInSelection);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isHeaderProfileCardOpen, setIsHeaderProfileCardOpen] = useState(false);
  const [isProjectMoveMenuOpen, setIsProjectMoveMenuOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isProjectDeleteConfirmOpen, setIsProjectDeleteConfirmOpen] = useState(false);
  const [projectSettingsName, setProjectSettingsName] = useState("");
  const [projectSettingsGuideline, setProjectSettingsGuideline] = useState(
    "내가 분야를 말하면 그 분야의 cs 지식에 대한 질문을 던져주는데 일단 너의 형식을 알려주자면 질문주고나서 내가 답변을 하면 너는 그 답을 평가해줘.",
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const moveMenuRef = useRef<HTMLDivElement | null>(null);
  const profileCardRef = useRef<HTMLDivElement | null>(null);
  const headerProfileCardRef = useRef<HTMLDivElement | null>(null);
  const handledSelectionRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isCancellingVoiceRef = useRef(false);
  const latestVoiceDraftRef = useRef("");
  const voiceSilenceTimeoutRef = useRef<number | null>(null);
  const submitMessageRef = useRef<(messageText: string) => Promise<void>>(
    async () => Promise.resolve(),
  );
  const [isListening, setIsListening] = useState(false);
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [isRoutePending, startRouteTransition] = useTransition();
  const messageLoadRequestIdRef = useRef(0);
  const readingAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());
  const readingAudioUrlsRef = useRef<Set<string>>(new Set());
  const readingAbortControllerRef = useRef<AbortController | null>(null);
  const readingRequestIdRef = useRef(0);
  const accessToken = session?.access_token ?? "";

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
  const visibleProjectIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects]);
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
  const initialGuideQuestions = activePhilosopher?.promptSamples.length
    ? activePhilosopher.promptSamples.slice(0, 2)
    : ["정의로운 삶은 왜 어려운가?", "나는 왜 확신하면서도 자주 틀릴까?"];
  const initialGuideTitle = activePhilosopher
    ? `${activePhilosopher.name}와 대화를 시작해보세요`
    : "철학자와 대화를 시작해보세요";
  const initialGuideSummary = activePhilosopher?.summary ?? "질문을 던지면 생각의 결을 따라 깊이 있게 답변합니다.";
  const cautionSubject = activePhilosopher?.name ?? "AI";

  const filteredRecentConversations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    const filtered = conversations.filter((conversation) => {
      if (!conversation.recent) {
        return false;
      }
      if (conversation.projectId && visibleProjectIds.has(conversation.projectId)) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return conversation.title.toLowerCase().includes(normalized);
    });

    return filtered.sort((left, right) => Number(Boolean(right.pinned)) - Number(Boolean(left.pinned)));
  }, [conversations, searchQuery, visibleProjectIds]);
  const projectConversations = useMemo(
    () =>
      activeProjectId
        ? conversations.filter((conversation) => conversation.projectId === activeProjectId)
        : [],
    [activeProjectId, conversations],
  );
  const hydrateChatData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsHydrating(true);
    setLoadError(null);

    try {
      const projectList = await listProjects(accessToken);
      const mappedProjects = projectList.map(mapProject);
      setProjects(mappedProjects);

      const conversationResponses = await Promise.all(
        projectList.map(async (project) => listConversations(accessToken, project.id)),
      );

      const conversationList = conversationResponses.flat();
      const messageEntries = await Promise.all(
        conversationList.map(async (conversation) => [conversation.id, await listMessages(accessToken, conversation.id)] as const),
      );
      const messageMap = new Map<string, ApiMessage[]>(messageEntries);

      const mappedConversations = conversationList.map((conversation) =>
        mapConversation(conversation, messageMap.get(conversation.id) ?? []),
      );
      const visibleProjectIdSet = new Set(mappedProjects.map((project) => project.id));

      setConversations((previous) => {
        const preservedHiddenConversations = previous.filter((conversation) => {
          if (!conversation.projectId) {
            return true;
          }
          return !visibleProjectIdSet.has(conversation.projectId);
        });

        const mergedConversations = [...mappedConversations];
        for (const hiddenConversation of preservedHiddenConversations) {
          if (!mergedConversations.some((conversation) => conversation.id === hiddenConversation.id)) {
            mergedConversations.push(hiddenConversation);
          }
        }

        return mergedConversations;
      });
      setActiveProjectId((previous) =>
        previous && mappedProjects.some((project) => project.id === previous) ? previous : null,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.";
      setLoadError(message);
    } finally {
      setIsHydrating(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void hydrateChatData();
  }, [hydrateChatData]);

  useEffect(() => {
    setIsRouteLoading(false);
  }, [pathname, searchParams]);

  const navigateWithLoading = useCallback((navigate: () => void) => {
    setIsRouteLoading(true);
    startRouteTransition(() => {
      navigate();
    });
  }, [startRouteTransition]);

  const startConversationWith = useCallback(async (philosopher: PhilosopherProfile) => {
    if (!accessToken) {
      setLoadError("로그인 정보가 없어 대화를 시작할 수 없습니다.");
      return;
    }

    try {
      const isProjectConversation = Boolean(activeProjectId);
      const createdConversation = isProjectConversation
        ? await createConversationRequest(accessToken, activeProjectId as string, {
            philosopher: toApiPhilosopherId(philosopher.id),
          })
        : await createDefaultConversationRequest(accessToken, {
            philosopher: toApiPhilosopherId(philosopher.id),
          });
      const messages = await listMessages(accessToken, createdConversation.id);
      const mappedConversation = mapConversation(createdConversation, messages);

      setConversations((previous) => [mappedConversation, ...previous]);
      setActiveConversationId(createdConversation.id);
      setActiveProjectId(isProjectConversation ? activeProjectId : null);
      setDraft("");
      setIsSelectingPhilosopher(false);
      navigateWithLoading(() => {
        router.replace(`/service?conversation=${createdConversation.id}`);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "대화를 시작하지 못했습니다.";
      setLoadError(message);
    }
  }, [accessToken, activeProjectId, navigateWithLoading, router]);

  const createProject = async () => {
    const defaultName = `프로젝트 ${projects.length + 1}`;
    const input = window.prompt("새 프로젝트 이름을 입력하세요.", defaultName);
    if (!input) {
      return;
    }

    const name = input.trim();
    if (!name) {
      return;
    }

    if (!accessToken) {
      setLoadError("로그인 정보가 없어 프로젝트를 만들 수 없습니다.");
      return;
    }

    try {
      const project = await createProjectRequest(accessToken, { name: name.slice(0, 30) });
      const mapped = mapProject(project);
      setProjects((previous) => [mapped, ...previous]);
      setActiveProjectId(project.id);
      setActiveConversationId("");
      setIsSelectingPhilosopher(false);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "프로젝트를 생성하지 못했습니다.";
      setLoadError(message);
    }
  };

  const moveConversationTo = async (targetProjectId: string | null) => {
    if (!activeConversation) {
      return;
    }

    if (!accessToken) {
      setLoadError("로그인 정보가 없어 프로젝트 이동을 수행할 수 없습니다.");
      return;
    }

    try {
      const movedConversation = await moveConversationProjectRequest(accessToken, activeConversation.id, targetProjectId);
      setConversations((previous) =>
        previous.map((item) =>
          item.id === activeConversation.id
            ? {
                ...item,
                projectId: movedConversation.project_id,
              }
            : item,
        ),
      );
      setActiveProjectId(targetProjectId);
      setIsMoveMenuOpen(false);
      setIsProjectMoveMenuOpen(false);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "프로젝트 이동에 실패했습니다.";
      setLoadError(message);
    }
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

  const deleteActiveConversation = async () => {
    if (!activeConversation) {
      return;
    }

    if (!accessToken) {
      setLoadError("로그인 정보가 없어 채팅을 삭제할 수 없습니다.");
      return;
    }

    try {
      await deleteConversationRequest(accessToken, activeConversation.id);
      setConversations((previous) => previous.filter((conversation) => conversation.id !== activeConversation.id));
      setActiveConversationId("");
      setIsSelectingPhilosopher(false);
      setIsMoveMenuOpen(false);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "채팅 삭제에 실패했습니다.";
      setLoadError(message);
    }
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
    void startConversationWith(philosopher);
  }, [startConversationWith]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationIdFromUrl = params.get("conversation")?.trim() ?? "";
    if (!conversationIdFromUrl) {
      return;
    }

    setIsSelectingPhilosopher(false);
    setActiveConversationId(conversationIdFromUrl);
  }, []);

  useEffect(() => {
    if (!accessToken || !activeConversationId) {
      return;
    }

    let cancelled = false;
    const requestId = messageLoadRequestIdRef.current + 1;
    messageLoadRequestIdRef.current = requestId;
    setIsConversationHydrating(true);

    void listMessages(accessToken, activeConversationId)
      .then((messages) => {
        if (cancelled) {
          return;
        }

        const mappedMessages = mapMessagesInDisplayOrder(messages);
        const firstUserMessage = mappedMessages.find((message) => message.role === "user");

        setConversations((previous) => {
          const existingConversation = previous.find((conversation) => conversation.id === activeConversationId);
          if (existingConversation) {
            return previous.map((conversation) =>
              conversation.id === activeConversationId
                ? {
                    ...conversation,
                    messages: mappedMessages,
                  }
                : conversation,
            );
          }

          const params = new URLSearchParams(window.location.search);
          const philosopherFromUrl = params.get("philosopher")?.trim() ?? "";
          const fallbackPhilosopher =
            philosophers.some((philosopher) => philosopher.id === philosopherFromUrl)
              ? philosopherFromUrl
              : "socrates";
          const fallbackPhilosopherName =
            philosophers.find((philosopher) => philosopher.id === fallbackPhilosopher)?.name ?? fallbackPhilosopher;
          const fallbackTitle = firstUserMessage
            ? deriveInitialConversationTitle(firstUserMessage.text)
            : `${fallbackPhilosopherName} 대화`;

          return [
            {
              id: activeConversationId,
              title: fallbackTitle,
              philosopherId: fallbackPhilosopher,
              recent: true,
              messages: mappedMessages,
            },
            ...previous,
          ];
        });
      })
      .catch(() => {
        // no-op: keep existing local state when refresh fails
      })
      .finally(() => {
        if (!cancelled && messageLoadRequestIdRef.current === requestId) {
          setIsConversationHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, activeConversationId]);

  useEffect(() => {
    return () => {
      if (voiceSilenceTimeoutRef.current !== null) {
        window.clearTimeout(voiceSilenceTimeoutRef.current);
      }
      recognitionRef.current?.stop();
    };
  }, []);

  const stopReadingAudio = useCallback(() => {
    readingRequestIdRef.current += 1;
    if (readingAbortControllerRef.current) {
      readingAbortControllerRef.current.abort();
      readingAbortControllerRef.current = null;
    }
    for (const audio of readingAudiosRef.current) {
      audio.pause();
      audio.src = "";
    }
    readingAudiosRef.current.clear();
    for (const url of readingAudioUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    readingAudioUrlsRef.current.clear();
    setReadingMessageId(null);
  }, []);

  useEffect(() => {
    return () => {
      stopReadingAudio();
    };
  }, [stopReadingAudio]);

  useEffect(() => {
    stopReadingAudio();
  }, [activeConversationId, stopReadingAudio]);

  useEffect(() => {
    stopReadingAudio();
  }, [pathname, searchParams, stopReadingAudio]);

  const clearVoiceSilenceTimeout = useCallback(() => {
    if (voiceSilenceTimeoutRef.current === null) {
      return;
    }
    window.clearTimeout(voiceSilenceTimeoutRef.current);
    voiceSilenceTimeoutRef.current = null;
  }, []);

  const armVoiceSilenceTimeout = useCallback(() => {
    clearVoiceSilenceTimeout();
    voiceSilenceTimeoutRef.current = window.setTimeout(() => {
      recognitionRef.current?.stop();
    }, VOICE_SILENCE_TIMEOUT_MS);
  }, [clearVoiceSilenceTimeout]);

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

  useEffect(() => {
    if (!isProfileCardOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileCardRef.current?.contains(event.target as Node)) {
        setIsProfileCardOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isProfileCardOpen]);

  useEffect(() => {
    if (!isHeaderProfileCardOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!headerProfileCardRef.current?.contains(event.target as Node)) {
        setIsHeaderProfileCardOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isHeaderProfileCardOpen]);

  const submitMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || !activeConversation || isResponding || isSelectingPhilosopher) {
      return;
    }

    if (!accessToken) {
      setLoadError("로그인 정보가 없어 메시지를 전송할 수 없습니다.");
      return;
    }

    const optimisticMessageId = `optimistic-user-${Date.now()}`;
    const optimisticUserMessage: Message = {
      id: optimisticMessageId,
      role: "user",
      text: trimmed,
      timestamp: "방금",
    };

    setDraft("");
    setIsResponding(true);
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              title:
                conversation.messages.length === 0
                  ? deriveInitialConversationTitle(trimmed)
                  : conversation.title,
              messages: [...conversation.messages, optimisticUserMessage],
            }
          : conversation,
      ),
    );

    try {
      const exchange = await sendMessageRequest(accessToken, activeConversation.id, trimmed);
      const userMessage = mapMessage(exchange.user_message);
      const assistantMessage = mapMessage(exchange.assistant_message);
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                title:
                  conversation.messages.filter((message) => message.id !== optimisticMessageId).length === 0
                    ? deriveInitialConversationTitle(trimmed)
                    : conversation.title,
                messages: [
                  ...conversation.messages.filter((message) => message.id !== optimisticMessageId),
                  userMessage,
                  assistantMessage,
                ],
              }
            : conversation,
        ),
      );
      setLoadError(null);
    } catch (error) {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: conversation.messages.filter((message) => message.id !== optimisticMessageId),
              }
            : conversation,
        ),
      );
      setDraft(trimmed);
      const message = error instanceof Error ? error.message : "메시지를 전송하지 못했습니다.";
      setLoadError(message);
    } finally {
      setIsResponding(false);
    }
  };
  submitMessageRef.current = submitMessage;

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
  const closeProjectSettings = async () => {
    if (!activeProject) {
      setIsProjectSettingsOpen(false);
      return;
    }

    const trimmed = projectSettingsName.trim();
    if (!accessToken) {
      setLoadError("로그인 정보가 없어 프로젝트 설정을 저장할 수 없습니다.");
      return;
    }

    try {
      const updated = await updateProjectSettingsRequest(accessToken, activeProject.id, {
        name: trimmed ? trimmed.slice(0, 30) : activeProject.name,
        instruction: projectSettingsGuideline.trim() || null,
      });
      const mapped = mapProject(updated);
      setProjects((previous) =>
        previous.map((project) =>
          project.id === mapped.id
            ? mapped
            : project,
        ),
      );
      setLoadError(null);
      setIsProjectSettingsOpen(false);
      setIsProjectDeleteConfirmOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "프로젝트 설정을 저장하지 못했습니다.";
      setLoadError(message);
    }
  };
  const openProjectSettings = () => {
    if (!activeProject) {
      return;
    }

    setProjectSettingsName(activeProject.name);
    setProjectSettingsGuideline(activeProject.instruction ?? "");
    setIsMoveMenuOpen(false);
    setIsProjectSettingsOpen(true);
  };
  const deleteActiveProject = async () => {
    if (!activeProject) {
      return;
    }

    if (!accessToken) {
      setLoadError("로그인 정보가 없어 프로젝트를 삭제할 수 없습니다.");
      return;
    }

    try {
      await deleteProjectRequest(accessToken, activeProject.id);
      setProjects((previous) => previous.filter((project) => project.id !== activeProject.id));
      setConversations((previous) => previous.filter((conversation) => conversation.projectId !== activeProject.id));
      setActiveProjectId(null);
      setActiveConversationId("");
      setIsProjectSettingsOpen(false);
      setIsProjectDeleteConfirmOpen(false);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.";
      setLoadError(message);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      return;
    }

    event.preventDefault();
    void submitMessage(draft);
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

  const readAssistantMessage = useCallback(async (messageId: string, text: string) => {
    if (!activeConversation || !accessToken) {
      return;
    }

    if (readingMessageId === messageId) {
      stopReadingAudio();
      return;
    }

    stopReadingAudio();
    setLoadError(null);
    setReadingMessageId(messageId);
    const requestId = readingRequestIdRef.current + 1;
    readingRequestIdRef.current = requestId;
    const abortController = new AbortController();
    readingAbortControllerRef.current = abortController;

    try {
      const philosopherId = toApiPhilosopherId(activeConversation.philosopherId);
      let ttsBlob = getCachedTtsBlob(philosopherId, text);
      if (!ttsBlob) {
        ttsBlob = await synthesizeSpeechRequest(accessToken, {
          philosopher_id: philosopherId,
          text,
        }, abortController.signal);
        setCachedTtsBlob(philosopherId, text, ttsBlob);
      }
      if (readingRequestIdRef.current !== requestId) {
        return;
      }
      const audioUrl = URL.createObjectURL(ttsBlob);
      readingAudioUrlsRef.current.add(audioUrl);

      const audio = new Audio(audioUrl);
      readingAudiosRef.current.add(audio);
      audio.onended = () => {
        stopReadingAudio();
      };
      audio.onerror = () => {
        stopReadingAudio();
        setLoadError("답변 음성 재생에 실패했습니다.");
      };

      await audio.play();
    } catch (error) {
      stopReadingAudio();
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message = error instanceof Error ? error.message : "답변 음성 재생에 실패했습니다.";
      setLoadError(message);
    }
  }, [accessToken, activeConversation, readingMessageId, stopReadingAudio]);

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
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onstart = () => {
        setIsListening(true);
        armVoiceSilenceTimeout();
      };

      recognition.onresult = (event) => {
        if (isCancellingVoiceRef.current) {
          return;
        }
        armVoiceSilenceTimeout();

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

        latestVoiceDraftRef.current = combinedDraft;
        setDraft(combinedDraft);
      };

      recognition.onerror = () => {
        clearVoiceSilenceTimeout();
        setIsListening(false);
      };

      recognition.onend = () => {
        clearVoiceSilenceTimeout();
        const spokenText = latestVoiceDraftRef.current.trim();

        if (isCancellingVoiceRef.current) {
          isCancellingVoiceRef.current = false;
          latestVoiceDraftRef.current = "";
          setDraft("");
          setIsListening(false);
          return;
        }

        setIsListening(false);

        if (!spokenText) {
          return;
        }

        void submitMessageRef.current(spokenText);
      };

      recognitionRef.current = recognition;
    }

    isCancellingVoiceRef.current = false;
    latestVoiceDraftRef.current = "";
    clearVoiceSilenceTimeout();
    setDraft("");

    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  }, [armVoiceSilenceTimeout, clearVoiceSilenceTimeout, isListening, isSelectingPhilosopher]);

  const stopVoiceInput = useCallback(() => {
    clearVoiceSilenceTimeout();
    recognitionRef.current?.stop();
    setIsListening(false);
  }, [clearVoiceSilenceTimeout]);

  const cancelVoiceInput = useCallback(() => {
    isCancellingVoiceRef.current = true;
    latestVoiceDraftRef.current = "";
    clearVoiceSilenceTimeout();
    recognitionRef.current?.stop();
    setDraft("");
    setIsListening(false);
  }, [clearVoiceSilenceTimeout]);

  const hasDraft = draft.trim().length > 0;
  const openVoiceMode = useCallback(() => {
    if (!activeConversation || isResponding || isSelectingPhilosopher) {
      return;
    }

    const query = new URLSearchParams({
      conversation: activeConversation.id,
      philosopher: activeConversation.philosopherId,
    });
    navigateWithLoading(() => {
      router.push(`/service/voice?${query.toString()}`);
    });
  }, [activeConversation, isResponding, isSelectingPhilosopher, navigateWithLoading, router]);

  const handlePrimaryComposerAction = () => {
    if (hasDraft) {
      void submitMessage(draft);
      return;
    }
    openVoiceMode();
  };

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
                    onClick={() => void createProject()}
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
                        <span className="inline-flex h-5 w-5 items-center justify-center text-[#9ca3af]">
                          <IconFolder className="h-4 w-4" />
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
                    const projectName = projects.find((project) => project.id === conversation.projectId)?.name ?? "프로젝트";

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

              <div ref={profileCardRef} className="relative mt-auto border-t border-[#e5e7eb] p-3">
                <button
                  type="button"
                  onClick={() => setIsProfileCardOpen((value) => !value)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#fff3e0]"
                >
                  <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#f3f4f6] text-xs text-[#374151]">
                    {profileImageUrl ? (
                      <span
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${profileImageUrl})` }}
                      />
                    ) : (
                      profileInitial
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-[#374151]">{profileName}</span>
                    <span className="block truncate text-xs text-[#9ca3af]">{profileEmail}</span>
                  </span>
                </button>
                {isProfileCardOpen ? (
                  <div className="absolute right-3 bottom-[calc(100%+8px)] left-3 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_16px_30px_rgba(17,24,39,0.12)]">
                    <p className="truncate text-sm font-semibold text-[#1f2937]">{profileName}</p>
                    <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{profileEmail}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileCardOpen(false);
                        void signOut();
                      }}
                      className="mt-3 w-full rounded-lg border border-[#ffd6aa] bg-[#fff3e0] px-3 py-2 text-sm font-medium text-[#c2410c] transition hover:bg-[#ffe0b2]"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div ref={profileCardRef} className="relative mt-auto border-t border-[#e5e7eb] p-3">
              <button
                type="button"
                onClick={() => setIsProfileCardOpen((value) => !value)}
                className="mx-auto flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#f3f4f6] text-xs text-[#374151] hover:bg-[#fff3e0]"
              >
                {profileImageUrl ? (
                  <span
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${profileImageUrl})` }}
                  />
                ) : (
                  profileInitial
                )}
              </button>
              {isProfileCardOpen ? (
                <div className="absolute bottom-[calc(100%+8px)] left-3 w-56 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_16px_30px_rgba(17,24,39,0.12)]">
                  <p className="truncate text-sm font-semibold text-[#1f2937]">{profileName}</p>
                  <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{profileEmail}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileCardOpen(false);
                      void signOut();
                    }}
                    className="mt-3 w-full rounded-lg border border-[#ffd6aa] bg-[#fff3e0] px-3 py-2 text-sm font-medium text-[#c2410c] transition hover:bg-[#ffe0b2]"
                  >
                    로그아웃
                  </button>
                </div>
              ) : null}
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

          <div className="flex items-center gap-3">
            {(activeConversation || isProjectHome) ? (
              <div ref={moveMenuRef} className="relative items-center gap-3 text-sm text-[#4b5563]">
                <button
                  type="button"
                  onClick={() => setIsMoveMenuOpen((value) => !value)}
                  className="rounded-md px-2 py-1.5 hover:bg-[#fff3e0]"
                  aria-label="more options"
                >
                  •••
                </button>
                {isMoveMenuOpen ? (
                  <div
                    className={`absolute right-0 top-11 z-20 rounded-2xl border border-[#d1d5db] bg-[#f9fafb] p-1 shadow-[0_10px_24px_rgba(17,24,39,0.15)] ${
                      isProjectHome ? "w-[148px]" : "w-48"
                    }`}
                  >
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
                                onClick={() => void moveConversationTo(project.id)}
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
                        onClick={() => void moveConversationTo(null)}
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
                          onClick={() => void deleteActiveConversation()}
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
            ) : null}

            <div ref={headerProfileCardRef} className="relative">
              <button
                type="button"
                aria-label="user profile menu"
                onClick={() => setIsHeaderProfileCardOpen((value) => !value)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#f3f4f6] text-xs text-[#374151]"
              >
                {profileImageUrl ? (
                  <span
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${profileImageUrl})` }}
                  />
                ) : (
                  profileInitial
                )}
              </button>
              {isHeaderProfileCardOpen ? (
                <div className="absolute right-0 top-10 z-30 w-64 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_16px_30px_rgba(17,24,39,0.12)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#eadfd2] bg-[#f3f4f6] text-sm text-[#374151]">
                      {profileImageUrl ? (
                        <span
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${profileImageUrl})` }}
                        />
                      ) : (
                        profileInitial
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1f2937]">{profileName}</p>
                      <p className="truncate text-xs text-[#9ca3af]">{profileEmail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHeaderProfileCardOpen(false);
                      void signOut();
                    }}
                    className="mt-3 w-full rounded-lg border border-[#ffd6aa] bg-[#fff3e0] px-3 py-2 text-sm font-medium text-[#c2410c] transition hover:bg-[#ffe0b2]"
                  >
                    로그아웃
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[920px] px-5 pb-36 pt-8 md:px-8">
            {isHydrating ? (
              <div className="sr-only">대화 데이터를 불러오는 중입니다...</div>
            ) : null}
            {loadError ? (
              <div className="mb-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">
                {loadError}
              </div>
            ) : null}
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

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {philosophers.map((philosopher) => (
                    <article
                      key={philosopher.id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(17,24,39,0.12)]"
                    >
                      <div className="relative h-72 overflow-hidden border-b border-[#edf1f5] bg-[radial-gradient(circle_at_50%_18%,#ffffff_0%,#f5f8fb_74%)]">
                        <div className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#0f172a]/70 to-transparent" />
                        <div className="absolute inset-x-8 bottom-3 h-8 rounded-full bg-[#64748b]/20 blur-md" />
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fff3e0]" />
                        <Image
                          src={philosopher.imageSrc}
                          alt={`${philosopher.name} portrait`}
                          width={1024}
                          height={1536}
                          className="relative z-10 mx-auto h-full w-full object-contain object-bottom px-3 py-2 drop-shadow-[0_12px_20px_rgba(17,24,39,0.25)] transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="absolute inset-x-4 bottom-3 z-30">
                          <h2 className="text-[22px] font-semibold tracking-tight text-white">{philosopher.name}</h2>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
                              {philosopher.era}
                            </span>
                            <span className="inline-flex rounded-full border border-[#ffe0b2]/70 bg-[#ffedd5]/90 px-2.5 py-1 text-[11px] text-[#9a3412]">
                              {philosopher.school}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <button
                          type="button"
                          onClick={() => void startConversationWith(philosopher)}
                          className="w-full rounded-xl border border-[#ffb74d] bg-[#fff3e0] px-4 py-2.5 text-sm font-semibold text-[#ff6d00] transition group-hover:bg-[#ffe8c5] hover:bg-[#ffe0b2]"
                        >
                          {philosopher.name}와 대화하기
                        </button>
                      </div>
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
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#9ca3af]">
                          <IconFolder className="h-5 w-5" />
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
              ? activeConversation && activeConversation.messages.length === 0
                ? (
                  <div className="mb-10 flex flex-col items-center px-3 py-2 text-center">
                    <p className="text-2xl font-semibold tracking-tight text-[#9a3412]">{initialGuideTitle}</p>
                    <p className="mt-3 max-w-[560px] text-sm leading-7 text-[#7c4a2b]">{initialGuideSummary}</p>
                  </div>
                )
                : null
              : null}

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
                        <div className="mt-2 flex items-center gap-2 text-[#9ca3af]">
                          <button
                            type="button"
                            onClick={() => copyMessage(message.text)}
                            className="rounded-md p-1.5 text-[#9ca3af] hover:bg-[#fff3e0] hover:text-[#6b7280]"
                            aria-label="copy assistant message"
                          >
                            <IconCopy />
                          </button>
                          <button
                            type="button"
                            onClick={() => void readAssistantMessage(message.id, message.text)}
                            className={`rounded-md p-1.5 ${
                              readingMessageId === message.id
                                ? "bg-[#fff1f2] text-[#b91c1c] hover:bg-[#ffe4e6]"
                                : "text-[#9ca3af] hover:bg-[#fff3e0] hover:text-[#6b7280]"
                            }`}
                            aria-label={readingMessageId === message.id ? "stop reading assistant message" : "read assistant message aloud"}
                          >
                            {readingMessageId === message.id ? <IconStop /> : <IconPlay />}
                          </button>
                        </div>
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
              {!isSelectingPhilosopher && activeConversation && activeConversation.messages.length === 0 ? (
                <div className="mb-3 flex flex-wrap items-center gap-2 pl-[21px]">
                  {initialGuideQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => {
                        setDraft(question);
                        composerRef.current?.focus();
                      }}
                      className="rounded-full border border-[#fdba74] bg-[#fff7ed] px-3 py-1.5 text-sm text-[#7c2d12] transition hover:bg-[#fff3e0]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              ) : null}
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
                      onClick={handlePrimaryComposerAction}
                      disabled={!activeConversation || isResponding || isSelectingPhilosopher}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7f11] to-[#ff6d00] text-white transition hover:from-[#ffc933] hover:to-[#ff7f11] disabled:cursor-not-allowed disabled:bg-[#b9b9b9] disabled:bg-none"
                      aria-label={hasDraft ? "send message" : "start voice mode"}
                    >
                      {hasDraft ? <IconSend /> : <IconVoiceWave />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-[#9ca3af]">
                {cautionSubject}는 실수할 수 있습니다. 완전히 믿지 말고 다시 확인하세요.
              </p>
            </div>
          </div>
        ) : null}
        {isProjectSettingsOpen && activeProject ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={() => void closeProjectSettings()}
          >
            <div
              className="w-full max-w-[640px] rounded-2xl border border-[#d1d5db] bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.2)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[30px] font-semibold tracking-tight text-[#111827]">프로젝트 설정</h2>
                <button
                  type="button"
                  onClick={() => void closeProjectSettings()}
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
            <div className="w-full max-w-[420px] rounded-2xl border border-[#d1d5db] bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.2)]">
              <h3 className="text-[26px] font-semibold tracking-tight text-[#111827]">프로젝트를 삭제할까요?</h3>
              <p className="mt-3 text-[16px] leading-6 text-[#111827]">
                모든 프로젝트 파일과 채팅이 영구 삭제됩니다. 채팅을 저장하려면 삭제하기 전에 채팅 목록 또는 다른 프로젝트로 옮겨 주세요.
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProjectDeleteConfirmOpen(false)}
                  className="rounded-full border border-[#d1d5db] px-4 py-2 text-base text-[#374151] transition hover:bg-[#f9fafb]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void deleteActiveProject()}
                  className="rounded-full bg-[#dc2626] px-4 py-2 text-base text-white transition hover:bg-[#b91c1c]"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {isHydrating || isConversationHydrating ? (
          <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <div className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm text-[#4b5563] shadow-[0_10px_24px_rgba(17,24,39,0.12)]">
              대화를 불러오는 중입니다...
            </div>
          </div>
        ) : null}
        {isRouteLoading || isRoutePending ? (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
            <div className="rounded-xl border border-white/50 bg-white px-5 py-3 text-sm font-medium text-[#374151] shadow-[0_16px_30px_rgba(17,24,39,0.2)]">
              페이지를 이동하는 중입니다...
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
