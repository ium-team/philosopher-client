type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[92rem] flex-col gap-16 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.14),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-40 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm tracking-[0.28em] text-slate-500 uppercase">
            Conversational Philosophy
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            철학자를 살아 있는 인터페이스로 만드는 서비스
          </h2>
        </div>
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300 backdrop-blur">
          철학자별 페르소나, 대표 저작 기반 추론, 현대적 대화 UX를 한 화면에서
          보여주는 프로덕트 시작안
        </div>
      </header>

      <div className="flex flex-col gap-10">{children}</div>
    </main>
  );
}
