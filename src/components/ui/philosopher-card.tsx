import type { PhilosopherProfile } from "@/data/philosophers";
import { cn } from "@/lib/utils";

type PhilosopherCardProps = {
  philosopher: PhilosopherProfile;
  featured?: boolean;
};

export function PhilosopherCard({
  philosopher,
  featured = false,
}: PhilosopherCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm",
        "transition-transform duration-300 hover:-translate-y-1",
        featured && "lg:col-span-2 lg:p-8",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-32 bg-gradient-to-r opacity-80 blur-2xl",
          philosopher.accentColor,
        )}
      />
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.24em] text-slate-400 uppercase">
              {philosopher.era}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {philosopher.name}
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
            {philosopher.school}
          </span>
        </div>

        <p className="max-w-xl text-sm leading-7 text-slate-300">
          {philosopher.summary}
        </p>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
            대화 스타일
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {philosopher.tone}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
            이해 기반 텍스트
          </p>
          <div className="flex flex-wrap gap-2">
            {philosopher.works.map((work) => (
              <span
                key={work}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
              >
                {work}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
            이렇게 시작
          </p>
          <div className="space-y-2">
            {philosopher.promptSamples.map((prompt) => (
              <div
                key={prompt}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                “{prompt}”
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
