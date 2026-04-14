"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { philosophers } from "@/data/philosophers";

type VoiceModePageProps = {
  conversationId: string | null;
  philosopherId: string | null;
};

function IconMic({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M6 11.5a6 6 0 0012 0M12 18v3" />
    </svg>
  );
}

function IconClose({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function VoiceModePage({ conversationId, philosopherId }: VoiceModePageProps) {
  const router = useRouter();
  const [isMicPressed, setIsMicPressed] = useState(false);

  const serviceHref = useMemo(() => {
    if (!conversationId) {
      return "/service";
    }
    return `/service?conversation=${encodeURIComponent(conversationId)}`;
  }, [conversationId]);

  const closeVoiceMode = () => {
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

  return (
    <main className="relative flex min-h-screen flex-col bg-[#f8f8f7] text-[#111827]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.9),rgba(248,248,247,0.94)_45%,rgba(244,245,247,1)_100%)]" />

      <div className="relative flex min-h-screen flex-1 flex-col">
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
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#8eb6ff]/30 blur-xl" />
            <div
              className={`relative h-36 w-36 rounded-full bg-[radial-gradient(circle_at_30%_25%,#d5ebff_0%,#6db8ff_50%,#2b64ff_100%)] shadow-[0_24px_50px_rgba(43,100,255,0.24)] transition-transform duration-200 ${
                isMicPressed ? "scale-95" : "scale-100"
              }`}
            >
              {activePhilosopher ? (
                <Image
                  src={activePhilosopher.imageSrc}
                  alt={`${activePhilosopher.name} portrait`}
                  width={220}
                  height={220}
                  className="h-full w-full scale-125 object-contain object-bottom"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-4 pb-10">
          <button
            type="button"
            onMouseDown={() => setIsMicPressed(true)}
            onMouseUp={() => setIsMicPressed(false)}
            onMouseLeave={() => setIsMicPressed(false)}
            onTouchStart={() => setIsMicPressed(true)}
            onTouchEnd={() => setIsMicPressed(false)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#efefee] text-[#111827] shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:bg-[#e7e7e6]"
            aria-label="start voice conversation"
          >
            <IconMic />
          </button>
          <button
            type="button"
            onClick={closeVoiceMode}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#efefee] text-[#111827] shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:bg-[#e7e7e6]"
            aria-label="close voice mode"
          >
            <IconClose />
          </button>
        </div>
      </div>
    </main>
  );
}
