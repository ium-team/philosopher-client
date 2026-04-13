type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#fffaf5] px-3 py-3 sm:px-4 sm:py-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.10),transparent_60%)]"
      />
      <header className="flex items-center justify-between border-b border-stone-200 px-2 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white">
            Φ
          </div>
          <div>
            <p className="text-[11px] tracking-[0.24em] text-stone-500 uppercase">
              Philosopher
            </p>
            <h1 className="mt-1 text-base font-semibold tracking-tight text-stone-900">
              AI 철학자 대화실
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="hidden sm:inline">공유하기</span>
          <button
            type="button"
            className="rounded-full border border-stone-300 px-3 py-1.5 font-medium text-stone-700 transition hover:bg-white"
          >
            새 대화
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-3">{children}</div>
    </main>
  );
}
