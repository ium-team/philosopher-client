"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { philosophers } from "@/data/philosophers";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { sendMessage as sendMessageRequest } from "@/features/service/api/chat-api";

type VoiceModePageProps = {
  conversationId: string | null;
  philosopherId: string | null;
};

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

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

function IconClose({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function VoiceModePage({ conversationId, philosopherId }: VoiceModePageProps) {
  const router = useRouter();
  const { session } = useAuthSession();
  const accessToken = session?.access_token ?? "";
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUserSpeech, setLastUserSpeech] = useState("");
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isClosingRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const startedOnceRef = useRef(false);

  const serviceHref = useMemo(() => {
    if (!conversationId) {
      return "/service";
    }
    return `/service?conversation=${encodeURIComponent(conversationId)}`;
  }, [conversationId]);

  const closeVoiceMode = () => {
    isClosingRef.current = true;
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();

    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(serviceHref);
  };

  const activePhilosopher = useMemo(
    () => philosophers.find((philosopher) => philosopher.id === philosopherId) ?? null,
    [philosopherId],
  );
  const hasVoiceSession = Boolean(conversationId && accessToken);

  const speechRecognitionConstructor = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return (
      (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructorLike;
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
      }).SpeechRecognition ??
      (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructorLike;
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
      }).webkitSpeechRecognition ??
      null
    );
  }, []);

  const resetTranscript = () => {
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setLiveTranscript("");
  };

  const startListening = useCallback(() => {
    if (isClosingRef.current || !hasVoiceSession) {
      return;
    }

    if (!speechRecognitionConstructor) {
      setVoiceStatus("error");
      setErrorMessage("브라우저에서 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new speechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onstart = () => {
        setVoiceStatus("listening");
        setErrorMessage(null);
      };

      recognition.onresult = (event) => {
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result[0]?.transcript ?? "";

          if (result.isFinal) {
            finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim();
            interimTranscriptRef.current = "";
            continue;
          }

          interimTranscriptRef.current = transcript;
        }

        setLiveTranscript(`${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim());
      };

      recognition.onerror = () => {
        if (!isClosingRef.current) {
          setVoiceStatus("error");
          setErrorMessage("음성 인식 중 문제가 발생했습니다. 화면을 눌러 다시 시작하세요.");
        }
      };

      recognition.onend = () => {
        if (isClosingRef.current) {
          return;
        }

        const spokenText = finalTranscriptRef.current.trim();
        if (!spokenText && !isProcessingRef.current) {
          setVoiceStatus("idle");
        }
      };

      recognitionRef.current = recognition;
    }

    resetTranscript();
    try {
      recognitionRef.current.start();
    } catch {
      setVoiceStatus("error");
      setErrorMessage("마이크를 시작하지 못했습니다. 화면을 눌러 다시 시도하세요.");
    }
  }, [hasVoiceSession, speechRecognitionConstructor]);

  const speakAssistantText = useCallback((text: string) => {
    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ko"));

      if (koreanVoice) {
        utterance.voice = koreanVoice;
        utterance.lang = koreanVoice.lang;
      } else {
        utterance.lang = "ko-KR";
      }

      utterance.rate = 1.02;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error("TTS playback failed"));

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const sendUserSpeech = useCallback(async () => {
    if (!hasVoiceSession || !conversationId) {
      return;
    }

    const spokenText = finalTranscriptRef.current.trim();
    if (!spokenText) {
      return;
    }

    setLastUserSpeech(spokenText);
    isProcessingRef.current = true;
    setVoiceStatus("thinking");
    setErrorMessage(null);

    try {
      const exchange = await sendMessageRequest(accessToken, conversationId, spokenText);
      const assistantText = exchange.assistant_message.content.trim();
      if (!assistantText) {
        throw new Error("응답이 비어 있습니다.");
      }

      setLastAssistantSpeech(assistantText);
      setVoiceStatus("speaking");
      await speakAssistantText(assistantText);
      resetTranscript();

      if (!isClosingRef.current) {
        startListening();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "음성 대화 처리에 실패했습니다.";
      setVoiceStatus("error");
      setErrorMessage(message);
    } finally {
      isProcessingRef.current = false;
    }
  }, [accessToken, conversationId, hasVoiceSession, speakAssistantText, startListening]);

  useEffect(() => {
    if (!recognitionRef.current) {
      return;
    }

    recognitionRef.current.onend = () => {
      if (isClosingRef.current) {
        return;
      }

      const spokenText = finalTranscriptRef.current.trim();
      if (!spokenText && !isProcessingRef.current) {
        setVoiceStatus("idle");
        return;
      }

      if (!isProcessingRef.current) {
        void sendUserSpeech();
      }
    };
  }, [sendUserSpeech]);

  useEffect(() => {
    if (!hasVoiceSession || startedOnceRef.current) {
      return;
    }

    startedOnceRef.current = true;
    const timeoutId = window.setTimeout(() => {
      startListening();
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasVoiceSession, startListening]);

  useEffect(() => {
    return () => {
      isClosingRef.current = true;
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const statusText =
    voiceStatus === "listening"
      ? "듣는 중..."
      : voiceStatus === "thinking"
        ? "생각 중..."
        : voiceStatus === "speaking"
          ? "읽는 중..."
          : voiceStatus === "error"
            ? errorMessage ?? "음성 모드에 문제가 있습니다."
            : hasVoiceSession
              ? "화면을 탭하면 다시 듣기 시작합니다."
              : "대화를 먼저 시작한 뒤 음성 모드를 사용하세요.";

  return (
    <main className="relative flex min-h-screen flex-col bg-[#f8f8f7] text-[#111827]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.9),rgba(248,248,247,0.94)_45%,rgba(244,245,247,1)_100%)]" />

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (voiceStatus === "idle" || voiceStatus === "error") {
            startListening();
          }
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && (voiceStatus === "idle" || voiceStatus === "error")) {
            event.preventDefault();
            startListening();
          }
        }}
        className="relative flex min-h-screen flex-1 flex-col"
      >
        <div className="flex justify-end px-5 pt-5">
          <button
            type="button"
            onClick={closeVoiceMode}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#efefee] text-[#111827] shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:bg-[#e7e7e6]"
            aria-label="close voice mode"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          {activePhilosopher ? (
            <Image
              src={activePhilosopher.imageSrc}
              alt={`${activePhilosopher.name} portrait`}
              width={440}
              height={440}
              className="h-[280px] w-[280px] object-contain object-bottom md:h-[360px] md:w-[360px] lg:h-[420px] lg:w-[420px]"
            />
          ) : null}
        </div>

        <div className="px-6 pb-10">
          <div className="mx-auto mb-4 w-full max-w-[720px] space-y-2 text-left">
            <div className="rounded-xl border border-[#e5e7eb] bg-white/70 px-4 py-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#6b7280] uppercase">User</p>
              <p className="mt-1 text-sm text-[#111827]">{lastUserSpeech || "아직 없음"}</p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] bg-white/70 px-4 py-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#6b7280] uppercase">AI</p>
              <p className="mt-1 whitespace-pre-line text-sm text-[#111827]">{lastAssistantSpeech || "아직 없음"}</p>
            </div>
          </div>

          <div className="text-center">
          <p
            className={`text-base ${
              voiceStatus === "error" ? "text-[#b91c1c]" : "text-[#4b5563]"
            }`}
          >
            {statusText}
          </p>
          {liveTranscript ? <p className="mt-2 text-sm text-[#6b7280]">{liveTranscript}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
