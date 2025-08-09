"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db, Score } from "@/lib/db";
import type { Game } from "@/lib/db";
import AuthGuard from "@/components/AuthGuard";
import BottomSheet from "@/components/BottomSheet";
import NavigationButton from "@/components/NavigationButton";
import { useRouter } from "next/navigation";

type Rating = 0 | 1 | 2 | 3 | 4;

interface ScoreEntry {
  par: string;
  score: string;
  rating: Rating | null;
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") as string;
  const [gameId, setGameId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [isRatingBtn, setIsRatingBtn] = useState<boolean>(false);
  const [isScoreBtn, setIsScoreBtn] = useState<boolean>(false);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [current, setCurrent] = useState(0);

  // load course, game, existing scores
  useEffect(() => {
    if (!courseId) return;

    (async () => {
      const c = await db.courses.get(Number(courseId));
      if (!c) return;
      setCourseName(c.name);

      // Get the most recent game for this course, or create a new one
      const games = await db.games
        .where("courseId")
        .equals(c.id!)
        .reverse()
        .sortBy("date");

      let g: Game | undefined = games[0];

      if (!g) {
        const newId = await db.games.add({
          courseId: c.id!,
          date: new Date(),
          finalNote: "",
          finalScore: 0,
          scores: [],
        });
        g = await db.games.get(newId);
      }

      if (g) {
        setGameId(g.id!);
      }

      // build entries array
      const existing = await db.scores
        .where("gameId")
        .equals(g?.id ?? 0)
        .toArray();

      const recs = Array(c?.rounds ?? 0).fill(null);
      existing.forEach(async (r) => {
        if (r.hole != null && r.hole < recs.length) recs[r.hole] = r;
      });

      const initial = recs.map((r) => ({
        par: r?.par ?? "",
        score: r?.score ?? "",
        rating: r?.rating ?? null,
      }));
      setEntries(initial);

      // calc initial total
      const total = initial.reduce(
        (sum, e) => sum + (parseInt(e.score) || 0),
        0
      );
      setScoreTotal(total);

      // find the last record with a par selected and set it to current
      const lastParIndex = initial.findLastIndex((entry) => entry.par !== "");
      if (lastParIndex !== -1) {
        setCurrent(lastParIndex);
      }
    })();
  }, [courseId]);

  // enable rating buttons
  useEffect(() => {
    if (isScoreBtn) {
      setIsRatingBtn(true);
    }
  }, [isScoreBtn]);

  // upsert helper
  const upsertScore = async (
    idx: number,
    partial: Partial<Pick<Score, "par" | "score" | "rating">>
  ) => {
    if (gameId === null) return;
    const existing = await db.scores
      .where("gameId")
      .equals(gameId)
      .and((r) => r.hole === idx)
      .first();

    if (existing?.id) {
      await db.scores.update(existing.id, partial);
    } else {
      await db.scores.add({
        gameId,
        hole: idx,
        par: partial.par ?? "",
        score: partial.score ?? "",
        rating: partial.rating ?? 0,
      } as Score);
    }
  };

  // handle Par selection
  const onParSelect = async (val: number) => {
    const updated = [...entries];
    updated[current].par = String(val);
    setEntries(updated);
    await upsertScore(current, { par: String(val) });
  };

  // handle Score selection
  const onScoreSelect = async (val: number) => {
    const prev = parseInt(entries[current].score) || 0;
    const updated = [...entries];
    updated[current].score = String(val);
    setEntries(updated);
    await upsertScore(current, { score: String(val) });

    const delta = val - prev;
    const newTotal = scoreTotal + delta;
    setScoreTotal(newTotal);

    setIsScoreBtn(true);
    if (gameId !== null) {
      await db.games.update(gameId, { finalScore: newTotal });
    }
  };

  // handle Rating selection
  const onRate = async (val: Rating) => {
    const updated = [...entries];
    updated[current].rating = val;
    setEntries(updated);
    await upsertScore(current, { rating: val });
  };

  const handleRating = (opt: number) => {
    onRate(opt as Rating);

    const handle = window.setTimeout(async () => {
      // 1) create the Course record

      setIsRatingBtn(false);
      setIsScoreBtn(false);
      if (current < holes - 1) {
        setCurrent(current + 1);
      }
    }, 1100);

    return () => clearTimeout(handle);
  };

  const holes = entries.length;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* header */}
        <div className="container text-slate-950 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {courseName}
          </h1>
          <p className="text-lg font-semibold text-slate-700">
            <span className="font-bold">Score:</span> {scoreTotal}
          </p>
        </div>
        {/* single card */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-amber-100 relative">
            <p className="float-right font-bold text-xl text-slate-800">
              {current + 1}
            </p>
            {/* Par row */}
            <div className="mb-8">
              <span className="block text-slate-900 mb-4 font-bold text-lg">
                Par
              </span>
              <div className="flex space-x-3">
                {[3, 4, 5].map((n) => {
                  const active = entries[current]?.par === String(n);

                  return (
                    <button
                      key={n}
                      onClick={() => onParSelect(n)}
                      className={`
                      w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                      ${
                        active
                          ? "bg-orange-600 text-white shadow-lg"
                          : "bg-orange-100 text-slate-800 hover:bg-orange-200 border-2 border-orange-200"
                      }
                    `}
                      aria-label={`Select par ${n}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Score row */}
            <div className="mb-8">
              <span className="block text-slate-900 mb-4 font-bold text-lg">
                Score
              </span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                  const active = entries[current]?.score === String(n);

                  return (
                    <button
                      key={n}
                      onClick={() => onScoreSelect(n)}
                      disabled={!entries[current]?.par}
                      className={`
                      w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                      ${
                        entries[current]?.par
                          ? active
                            ? "bg-orange-600 text-white shadow-lg"
                            : "bg-orange-100 text-slate-800 hover:bg-orange-200 border-2 border-orange-200"
                          : "bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                      }
                    `}
                      aria-label={`Select score ${n}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Rating row */}
            <div>
              <span className="block text-slate-900 mb-4 font-bold text-lg">
                Rating
              </span>
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = entries[current]?.rating === n;

                  return (
                    <button
                      key={n}
                      onClick={() => {
                        handleRating(n);
                      }}
                      className={`
                      w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                      ${
                        isRatingBtn || entries[current]?.rating
                          ? active
                            ? "bg-orange-600 text-white shadow-lg"
                            : "bg-orange-100 text-slate-800 hover:bg-orange-200 border-2 border-orange-200"
                          : "bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                      }
                    `}
                      aria-label={`Rate hole ${n} stars`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* navigation */}
        <div className="container bg-amber-50 p-6 flex justify-center space-x-6">
          <NavigationButton
            onClick={() => current > 0 && setCurrent(current - 1)}
            disabled={current === 0}
            direction="previous"
          />
          <NavigationButton
            onClick={() => current < holes - 1 && setCurrent(current + 1)}
            disabled={current === holes - 1}
            direction="next"
          />
        </div>

        {current === holes - 1 && (
          <BottomSheet
            label="Finish Game"
            handleCallback={() => router.push("/games")}
            position="fixed bottom-0 left-0 bg-white/80 border-t-2 border-amber-200"
            colorClasses="bg-orange-600 active:bg-orange-500 text-white font-semibold"
          />
        )}
      </div>
    </>
  );
}

export default function Game() {
  return (
    <AuthGuard>
      <>
        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          <GameContent />
        </Suspense>
      </>
    </AuthGuard>
  );
}
