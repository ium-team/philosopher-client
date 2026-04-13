import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm",
        "shadow-[0_24px_80px_rgba(2,6,23,0.32)]",
        className,
      )}
    >
      <header className="mb-6 space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h3>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </header>
      {children}
    </section>
  );
}
