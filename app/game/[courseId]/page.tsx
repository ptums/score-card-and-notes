// app/game/[courseId]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { db, Score } from "../../../lib/db";

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
  const [courseName, setCourseName] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [records, setRecords] = useState<(Score | null)[]>([]);
  const [parActive, setParActive] = useState<boolean[]>([]);
  const [scoreActive, setScoreActive] = useState<boolean[]>([]);
  const parRefs = useRef<Array<HTMLInputElement | null>>([]);
  const scoreRefs = useRef<Array<HTMLInputElement | null>>([]);
  const parTimers = useRef<number[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  // 1) Load course → find/create game → load scores
  useEffect(() => {
    (async () => {
      const c = await db.courses.get(Number(courseId));
      if (!c) return;

      console.log(c.name);
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
        });
        g = await db.games.get(newId);
        if (!g) throw new Error("Failed to create game");
      }
      if (!g) throw new Error("Failed to find/create game");
      setGameId(g.id!); // Add non-null assertion since we've checked g exists

      // Set game date
      setGameDate(
        g.date
          ? g.date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null
      );

      // fetch scores and map by hole index
      const existing = await db.scores.where("gameId").equals(g.id!).toArray();
      const recs: (Score | null)[] = Array(c.rounds).fill(null);
      existing.forEach((r) => {
        if (r.hole >= 0 && r.hole < recs.length) recs[r.hole] = r;
      });

      setRecords(recs);
      setEntries(
        recs.map((r) => ({
          par: r?.par ?? "",
          score: r?.score ?? "",
          rating: r?.rating ?? null,
        }))
      );
      setParActive(Array(c.rounds).fill(false));
      setScoreActive(Array(c.rounds).fill(false));
    })();
  }, [courseId]);

  // 2) Upsert helper now includes hole index
  const upsertScore = async (
    idx: number,
    partial: Partial<Pick<Score, "par" | "score" | "rating">>
  ) => {
    if (gameId === null) return;

    const existing = records[idx];
    if (existing?.id) {
      await db.scores.update(existing.id, partial);
      const updated = { ...existing, ...partial };
      const copy = [...records];
      copy[idx] = updated;
      setRecords(copy);
    } else {
      const toAdd: Score = {
        gameId,
        hole: idx, // ← write hole index
        par: partial.par ?? "",
        score: partial.score ?? "",
        rating: partial.rating ?? 0,
      } as Score;
      const newId = await db.scores.add(toAdd);
      const newRec = await db.scores.get(newId);
      const copy = [...records];
      copy[idx] = newRec ?? null;
      setRecords(copy);
    }
  };

  // 3) activation & input handlers (unchanged)
  const focusPar = (i: number) =>
    setParActive((a) => {
      a[i] = true;
      return [...a];
    });
  const blurPar = (i: number) =>
    setParActive((a) => {
      a[i] = false;
      return [...a];
    });
  const focusScore = (i: number) =>
    setScoreActive((a) => {
      a[i] = true;
      return [...a];
    });
  const blurScore = (i: number) =>
    setScoreActive((a) => {
      a[i] = false;
      return [...a];
    });

  const onParChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const e = [...entries];
    e[i].par = val;
    setEntries(e);
    upsertScore(i, { par: val });

    clearTimeout(parTimers.current[i]);
    if (val) {
      parTimers.current[i] = window.setTimeout(() => {
        focusScore(i);
        scoreRefs.current[i]?.focus();
      }, 1000);
    }
  };
  const onScoreChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const e = [...entries];
    e[i].score = val;
    setEntries(e);
    upsertScore(i, { score: val });
  };

  // 4) rating options (unchanged)
  const ratingOptions = [
    { value: 0, light: "bg-red-200", dark: "bg-red-600" },
    { value: 1, light: "bg-orange-200", dark: "bg-orange-500" },
    { value: 2, light: "bg-amber-200", dark: "bg-amber-500" },
    { value: 3, light: "bg-lime-200", dark: "bg-lime-500" },
    { value: 4, light: "bg-green-200", dark: "bg-green-500" },
  ];
  const onRate = (i: number, v: Rating) => {
    const e = [...entries];
    e[i].rating = v;
    setEntries(e);
    upsertScore(i, { rating: v });
  };

  // 5) virtualizer (unchanged)
  const rowVirtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  return (
    <>
      {courseName && (
        <div className="px-6 mt-4 flex items-center">
          <h1 className=" font-bold text-white">{courseName}</h1>
          {gameDate && (
            <span className="text-white text-sm ml-2">- {gameDate}</span>
          )}
        </div>
      )}
      <p className="px-6 pt-4">Par | Score | Rating</p>
      <div
        ref={parentRef}
        className="h-full overflow-y-auto pt-2 px-6"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const i = virtualRow.index;
            const entry = entries[i];
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: virtualRow.start,
                  width: "100%",
                }}
              >
                <div className="h-20 flex justify-center bg-slate-600 rounded-lg relative">
                  {/* hole number above */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white text-black font-bold text-sm">
                    {i + 1}
                  </span>
                  <div className="flex items-center space-x-4">
                    {/* par & score */}
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        maxLength={1}
                        readOnly={!parActive[i]}
                        value={entry.par}
                        ref={(el) => {
                          parRefs.current[i] = el;
                        }}
                        onClick={() => {
                          focusPar(i);
                          parRefs.current[i]?.focus();
                        }}
                        onBlur={() => blurPar(i)}
                        onChange={(e) => onParChange(i, e.target.value)}
                        className="w-12 h-12 border border-gray-300 rounded text-center text-lg focus:outline-none bg-white text-black"
                      />
                      <input
                        type="tel"
                        maxLength={1}
                        readOnly={!scoreActive[i]}
                        value={entry.score}
                        ref={(el) => {
                          scoreRefs.current[i] = el;
                        }}
                        onClick={() => {
                          focusScore(i);
                          scoreRefs.current[i]?.focus();
                        }}
                        onBlur={() => blurScore(i)}
                        onChange={(e) => onScoreChange(i, e.target.value)}
                        className="w-12 h-12 border border-gray-300 rounded text-center text-lg focus:outline-none bg-white text-black"
                      />
                    </div>

                    {/* rating buttons */}
                    <div className="flex space-x-2">
                      {ratingOptions.map((opt) => {
                        const isActive = entry.rating === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => onRate(i, opt.value as Rating)}
                            className={`
                             w-10 h-10 rounded-full
                            ${isActive ? opt.dark : opt.light}
                          `}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Games */}
        <div className="mt-4 flex text-xl fixed bottom-0 bg-slate-800 w-full">
          <button
            onClick={() => router.push("/games")}
            className="flex items-center space-x-2 px-4 py-2 font-sans font-bold text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
            <span>Back to Games</span>
          </button>
        </div>
      </div>
    </>
  );
}
