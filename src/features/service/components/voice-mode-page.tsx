"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { philosophers } from "@/data/philosophers";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import {
  sendMessage as sendMessageRequest,
  synthesizeSpeech as synthesizeSpeechRequest,
  type ApiPhilosopher,
} from "@/features/service/api/chat-api";

type VoiceModePageProps = {
  conversationId: string | null;
  philosopherId: string | null;
  shouldCreateConversation: boolean;
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

function toApiPhilosopherId(philosopherId: string | null): ApiPhilosopher {
  if (philosopherId === "arendt") {
    return "hannah_arendt";
  }
  if (philosopherId === "socrates" || philosopherId === "nietzsche") {
    return philosopherId;
  }
  return "socrates";
}

function IconClose({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function VoiceModePage({ conversationId, philosopherId, shouldCreateConversation }: VoiceModePageProps) {
  const router = useRouter();
  const { session } = useAuthSession();
  const accessToken = session?.access_token ?? "";
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isClosingRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const isManualListeningRef = useRef(false);
  const shouldSubmitOnEndRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const serviceHref = useMemo(() => {
    if (!conversationId) {
      return "/service";
    }
    return `/service?conversation=${encodeURIComponent(conversationId)}`;
  }, [conversationId]);

  const closeVoiceMode = () => {
    isClosingRef.current = true;
    recognitionRef.current?.stop();
    stopAudioPlayback();
    router.replace(serviceHref);
  };

  const activePhilosopher = useMemo(
    () => philosophers.find((philosopher) => philosopher.id === philosopherId) ?? null,
    [philosopherId],
  );
  const hasVoiceSession = Boolean(conversationId && accessToken);
  void shouldCreateConversation;

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
  const getSpokenText = useCallback(() => {
    return `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
  }, []);

  const speakAssistantText = useCallback(async (text: string) => {
    const ttsBlob = await synthesizeSpeechRequest(accessToken, {
      philosopher_id: toApiPhilosopherId(philosopherId),
      text,
    });
    const audioUrl = URL.createObjectURL(ttsBlob);
    stopAudioPlayback();
    audioUrlRef.current = audioUrl;

    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        stopAudioPlayback();
        resolve();
      };
      audio.onerror = () => {
        stopAudioPlayback();
        reject(new Error("TTS playback failed"));
      };
      void audio.play().catch(() => {
        stopAudioPlayback();
        reject(new Error("TTS playback failed"));
      });
    });
  }, [accessToken, philosopherId, stopAudioPlayback]);

  const sendUserSpeech = useCallback(async () => {
    if (!hasVoiceSession || !conversationId) {
      return;
    }

    const spokenText = getSpokenText();
    if (!spokenText) {
      return;
    }
    finalTranscriptRef.current = spokenText;
    interimTranscriptRef.current = "";

    isProcessingRef.current = true;
    setVoiceStatus("thinking");
    setErrorMessage(null);

    try {
      const exchange = await sendMessageRequest(accessToken, conversationId, spokenText);
      const assistantText = exchange.assistant_message.content.trim();
      if (!assistantText) {
        throw new Error("응답이 비어 있습니다.");
      }

      setVoiceStatus("speaking");
      await speakAssistantText(assistantText);
      resetTranscript();
      setVoiceStatus("idle");
    } catch (error) {
      const message = error instanceof Error ? error.message : "음성 대화 처리에 실패했습니다.";
      setVoiceStatus("error");
      setErrorMessage(message);
    } finally {
      isProcessingRef.current = false;
    }
  }, [accessToken, conversationId, getSpokenText, hasVoiceSession, speakAssistantText]);

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
      recognition.continuous = true;
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

        if (shouldSubmitOnEndRef.current) {
          shouldSubmitOnEndRef.current = false;
          isManualListeningRef.current = false;
          const spokenText = getSpokenText();
          if (!spokenText && !isProcessingRef.current) {
            setVoiceStatus("idle");
            return;
          }
          if (!isProcessingRef.current) {
            void sendUserSpeech();
          }
          return;
        }

        if (isManualListeningRef.current && !isProcessingRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            setVoiceStatus("error");
            setErrorMessage("마이크를 다시 시작하지 못했습니다. 화면을 눌러 다시 시도하세요.");
            return;
          }
        }

        const spokenText = getSpokenText();
        if (!spokenText && !isProcessingRef.current) {
          setVoiceStatus("idle");
        }
      };

      recognitionRef.current = recognition;
    }

    resetTranscript();
    isManualListeningRef.current = true;
    shouldSubmitOnEndRef.current = false;
    try {
      recognitionRef.current.start();
    } catch {
      setVoiceStatus("error");
      setErrorMessage("마이크를 시작하지 못했습니다. 화면을 눌러 다시 시도하세요.");
    }
  }, [getSpokenText, hasVoiceSession, sendUserSpeech, speechRecognitionConstructor]);

  const stopListeningAndSubmit = useCallback(() => {
    if (!recognitionRef.current || !isManualListeningRef.current || isProcessingRef.current) {
      return;
    }
    shouldSubmitOnEndRef.current = true;
    recognitionRef.current.stop();
  }, []);

  const toggleListening = useCallback(() => {
    if (voiceStatus === "listening") {
      stopListeningAndSubmit();
      return;
    }

    if (voiceStatus === "idle" || voiceStatus === "error") {
      startListening();
    }
  }, [startListening, stopListeningAndSubmit, voiceStatus]);

  useEffect(() => {
    return () => {
      isClosingRef.current = true;
      recognitionRef.current?.stop();
      stopAudioPlayback();
    };
  }, [stopAudioPlayback]);

  const statusText =
    voiceStatus === "listening"
      ? "듣는 중... 화면 탭 또는 스페이스바로 종료 후 전송됩니다."
      : voiceStatus === "thinking"
        ? "생각 중..."
        : voiceStatus === "speaking"
          ? "읽는 중..."
          : voiceStatus === "error"
            ? errorMessage ?? "음성 모드에 문제가 있습니다."
            : hasVoiceSession
              ? "화면 탭 또는 스페이스바를 눌러 듣기를 시작하세요."
              : "대화를 먼저 시작한 뒤 음성 모드를 사용하세요.";

  return (
    <main className="relative flex min-h-screen flex-col bg-[#f8f8f7] text-[#111827]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.9),rgba(248,248,247,0.94)_45%,rgba(244,245,247,1)_100%)]" />

      <div
        role="button"
        tabIndex={0}
        onClick={toggleListening}
        onKeyDown={(event) => {
          if ((event.key === " " || event.code === "Space" || event.key === "Spacebar")) {
            event.preventDefault();
            toggleListening();
          }
        }}
        className="relative flex min-h-screen flex-1 flex-col"
      >
        <div className="flex justify-end px-5 pt-5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeVoiceMode();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#efefee] text-[#111827] shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:bg-[#e7e7e6]"
            aria-label="close voice mode"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          {activePhilosopher ? (
            <div
              className={`rounded-full transition-all duration-300 ${
                voiceStatus === "speaking"
                  ? "scale-[1.03] animate-pulse bg-white/40 shadow-[0_0_56px_rgba(56,189,248,0.35)]"
                  : "scale-100"
              }`}
            >
              <Image
                src={activePhilosopher.imageSrc}
                alt={`${activePhilosopher.name} portrait`}
                width={440}
                height={440}
                className="h-[280px] w-[280px] object-contain object-bottom md:h-[360px] md:w-[360px] lg:h-[420px] lg:w-[420px]"
              />
            </div>
          ) : null}
        </div>

        <div className="px-6 pb-10">
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
