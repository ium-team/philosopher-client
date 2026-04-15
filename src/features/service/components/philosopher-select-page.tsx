"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { philosophers } from "@/data/philosophers";

function getCardsPerPage(width: number): number {
  if (width >= 1280) {
    return 6;
  }
  if (width >= 768) {
    return 4;
  }
  return 2;
}

export function PhilosopherSelectPage() {
  const router = useRouter();
  const [philosopherQuery, setPhilosopherQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(6);

  useEffect(() => {
    const updateCardsPerPage = () => {
      setCardsPerPage(getCardsPerPage(window.innerWidth));
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const filteredPhilosophers = useMemo(() => {
    const normalized = philosopherQuery.trim().toLowerCase();
    if (!normalized) {
      return philosophers;
    }

    return philosophers.filter((philosopher) =>
      [philosopher.name, philosopher.era, philosopher.school].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [philosopherQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPhilosophers.length / cardsPerPage));
  const pagedPhilosophers = useMemo(() => {
    const start = currentPage * cardsPerPage;
    return filteredPhilosophers.slice(start, start + cardsPerPage);
  }, [cardsPerPage, currentPage, filteredPhilosophers]);

  useEffect(() => {
    setCurrentPage(0);
  }, [philosopherQuery, cardsPerPage]);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages - 1));
  }, [totalPages]);

  return (
    <main className="min-h-screen bg-[#fffcf8] px-5 py-6 text-[#2a241f] md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/service")}
          className="mb-6 rounded-lg px-3 py-2 text-sm text-[#6f675f] hover:bg-[#f4eee5]"
        >
          ← 대화로 돌아가기
        </button>

        <header className="mb-5">
          <p className="text-xs tracking-[0.18em] text-[#a3917f] uppercase">New Conversation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2f2720]">대화할 철학자를 선택하세요</h1>
          <p className="mt-2 text-sm text-[#7f7369]">선택 후 `채팅하기`를 누르면 해당 철학자와의 대화가 시작됩니다.</p>
        </header>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="block w-full md:max-w-sm">
            <span className="sr-only">철학자 검색</span>
            <input
              type="text"
              value={philosopherQuery}
              onChange={(event) => setPhilosopherQuery(event.target.value)}
              placeholder="철학자 검색 (이름/시대/학파)"
              className="w-full rounded-xl border border-[#e7ddcf] bg-white px-4 py-2.5 text-sm text-[#2a241f] outline-none transition placeholder:text-[#aa9e91] focus:border-[#d7c5ae] focus:ring-2 focus:ring-[#f4e5d3]"
            />
          </label>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 0))}
              disabled={currentPage === 0}
              className="h-10 rounded-lg border border-[#e7ddcf] bg-white px-3 text-sm text-[#7b6958] transition hover:bg-[#f9f3ec] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            <p className="min-w-24 text-center text-xs text-[#8a7a6c]">
              {currentPage + 1} / {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              className="h-10 rounded-lg border border-[#e7ddcf] bg-white px-3 text-sm text-[#7b6958] transition hover:bg-[#f9f3ec] disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        {filteredPhilosophers.length === 0 ? (
          <div className="rounded-2xl border border-[#efe6da] bg-white px-4 py-8 text-center text-sm text-[#8f8377]">
            검색 결과가 없습니다.
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedPhilosophers.map((philosopher) => (
            <article
              key={philosopher.id}
              className="group rounded-2xl border border-[#efe6da] bg-white p-5 shadow-[0_10px_26px_rgba(125,79,25,0.08)]"
            >
              <div className="relative mb-4 h-56 overflow-hidden rounded-2xl border border-[#f2e9de] bg-[radial-gradient(circle_at_50%_20%,#fffaf3_0%,#f5ece2_75%)] md:h-60 xl:h-64">
                <div className="absolute inset-x-5 bottom-3 h-8 rounded-full bg-[#7c5b3f]/20 blur-md" />
                <Image
                  src={philosopher.imageSrc}
                  alt={`${philosopher.name} portrait`}
                  width={1024}
                  height={1536}
                  className="relative z-10 mx-auto h-full w-full object-contain object-bottom px-2 py-1 drop-shadow-[0_12px_20px_rgba(54,35,19,0.24)]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-[#2b2118]/95 via-[#2b2118]/82 to-[#2b2118]/35 p-4 text-[#f8efe4] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100">
                  <p className="text-[11px] tracking-[0.14em] uppercase text-[#f3ddc5]">자세한 설명</p>
                  <p className="mt-1 text-sm leading-6">{philosopher.summary}</p>
                  <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-[#f3ddc5]">대화 톤</p>
                  <p className="mt-1 text-sm leading-6">{philosopher.tone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  router.push(`/service?philosopher=${philosopher.id}&new=1`);
                }}
                className="mb-4 w-full rounded-xl border border-[#fed7aa] bg-[#fff5ea] px-4 py-2.5 text-sm font-semibold text-[#9a3412] transition hover:bg-[#ffedd8]"
              >
                채팅하기
              </button>
              <p className="text-xs text-[#a3917f]">{philosopher.era}</p>
              <h2 className="mt-1 text-xl font-semibold text-[#2f2720]">{philosopher.name}</h2>
              <p className="mt-2 text-xs text-[#c0ab96]">{philosopher.school}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
