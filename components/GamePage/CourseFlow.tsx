// app/game/[courseId]/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, Score } from "../../lib/db";
import Link from "next/link";

type Rating = 0 | 1 | 2 | 3 | 4;

interface ScoreEntry {
  par: string;
  score: string;
  rating: Rating | null;
}

export default function CourseFlow() {
  const router = useRouter();
  const courseId = router.query.courseId as string;

  const [gameId, setGameId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [isRatingBtn, setIsRatingBtn] = useState<boolean>(false);
  const [isScoreBtn, setIsScoreBtn] = useState<boolean>(false);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [current, setCurrent] = useState(0);

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
          scores: [],
        });
        g = await db.games.get(newId)!;
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
      existing.forEach(async (r: { hole: number | null }) => {
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
        <div className="flex justify-between px-6 py-4 text-slate-950">
          <h1 className="text-xl font-bold">{courseName}</h1>
          <p className="text-lg">
            <span className="font-bold">Score:</span> {scoreTotal}
          </p>
          <p className="text-base">
            <Link
              href="/games?new_player=0"
              className="inline-flex items-center underline cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Home
            </Link>
          </p>
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
              <span className="block text-slate-950 mb-2 font-bold">
                Rating
              </span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = entries[current]?.rating === n;

                  return (
                    <button
                      key={n}
                      onClick={() => {
                        handleRating(n);
                      }}
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                      ${
                        isRatingBtn || entries[current]?.rating
                          ? active
                            ? "bg-orange-500 rounded"
                            : "bg-orange-300"
                          : "bg-background border opacity-50 cursor-not-allowed"
                      }
                    `}
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
        <div className="flex justify-between px-6 py-4 bg-dusk">
          <button
            onClick={() => current > 0 && setCurrent(current - 1)}
            disabled={current === 0}
            className="text-black font-bold disabled:opacity-50 p-4 active:bg-orange-300 bg-orange-500 rounded w-12 h-12 rounded-full flex items-center justify-center font-bold"
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
            className="text-black font-bold disabled:opacity-50 active:bg-orange-300 p-4 bg-orange-500 rounded w-12 h-12 rounded-full flex items-center justify-center font-bold"
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
      {/* <BottomSheet
        label="Home"
        handleCallback={() => router.push("/games?new_player=0")}
      /> */}
    </>
  );
}
