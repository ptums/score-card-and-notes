// app/game/[courseId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, Score } from "../../../lib/db";
import Link from "next/link";

type Rating = 0 | 1 | 2 | 3 | 4;

interface ScoreEntry {
  par: string;
  score: string;
  rating: Rating | null;
}

export default function GameEntryPage() {
  const router = useRouter();
  const { courseId } = useParams();

  const [gameId, setGameId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [scoreTotal, setScoreTotal] = useState(0);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [current, setCurrent] = useState(0);

  // rating button styles
  const ratingOptions = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];

  // load course, game, existing scores
  useEffect(() => {
    (async () => {
      const c = await db.courses.get(Number(courseId));
      if (!c) return;
      setCourseName(c.name);

      const [user] = await db.users.toArray();
      let g = await db.games
        .where("courseId")
        .equals(c.id!)
        .and((g) => g.userId === user.id!)
        .first();

      if (!g) {
        const newId = await db.games.add({
          courseId: c.id!,
          userId: user.id!,
          date: new Date(),
          finalNote: "",
          finalScore: 0,
        });
        g = await db.games.get(newId)!;
      }
      setGameId(g.id!);

      // build entries array
      const existing = await db.scores
        .where("gameId")
        .equals(g?.id ?? 0)
        .toArray();
      const recs = Array(c?.rounds ?? 0).fill(null);
      existing.forEach((r) => {
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
    })();
  }, [courseId]);

  // upsert helper
  const upsertScore = async (
    idx: number,
    partial: Partial<Pick<Score, "par" | "score" | "rating">>
  ) => {
    if (gameId === null) return;
    const recs = entries;
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

  const holes = entries.length;

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex justify-between px-6 py-4 text-slate-950">
        <h1 className="text-xl font-bold">{courseName}</h1>
        <p className="text-lg">Score: {scoreTotal}</p>
      </div>

      {/* single card */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="bg-white rounded-lg p-4 shadow relative">
          <p className="float-right font-bold">{current + 1}</p>
          {/* Par row */}
          <div className="mb-6">
            <span className="block text-slate-950 mb-2 font-bold">Par</span>
            <div className="flex space-x-2">
              {[3, 4, 5].map((n) => {
                const active = entries[current]?.par === String(n);
                return (
                  <button
                    key={n}
                    onClick={() => onParSelect(n)}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                      ${active ? "bg-orange-500" : "bg-orange-300"}
                    `}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Score row */}
          <div className="mb-6">
            <span className="block text-slate-950 mb-2 font-bold">Score</span>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                const active = entries[current]?.score === String(n);
                return (
                  <button
                    key={n}
                    onClick={() => onScoreSelect(n)}
                    disabled={!entries[current]?.par}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                      ${
                        entries[current]?.par
                          ? active
                            ? "bg-orange-500 rounded"
                            : "bg-orange-300"
                          : "bg-background border border-dusk text-text opacity-50 cursor-not-allowed"
                      }
                    `}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating row */}
          <div>
            <span className="block text-slate-950 mb-2 font-bold">Rating</span>
            <div className="flex space-x-2">
              {ratingOptions.map((opt) => {
                const active = entries[current]?.rating === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onRate(opt.value as Rating);
                      if (current < holes - 1) {
                        setCurrent(current + 1);
                      }
                    }}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                      ${active ? "bg-orange-500" : "bg-orange-300"}
                    `}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* navigation */}
      <div className="flex justify-between px-6 py-4 bg-dusk">
        <button
          onClick={() => current > 0 && setCurrent(current - 1)}
          disabled={current === 0}
          className="text-black font-bold disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => current < holes - 1 && setCurrent(current + 1)}
          disabled={current === holes - 1}
          className="text-black font-bold disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      {current === holes - 1 && (
        <Link
          href="/games"
          className="bg-orange-500 active:bg-orange-300 text-black text-center rounded mx-4 p-3 font-bold"
        >
          Finish Game
        </Link>
      )}
    </div>
  );
}
