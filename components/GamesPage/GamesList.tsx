// app/games/page.tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import Link from "next/link";
import BottomSheet from "../BottomSheet";
import { COURSE_OPTION, RANGE_OPTION } from "@/utils";

export default function GamesList({
  setShowForm,
}: {
  setShowForm: React.Dispatch<React.SetStateAction<string>>;
}) {
  // 1️⃣ load & enrich games with course name, formatted date, and finalScore
  const games = useLiveQuery(async () => {
    const [user] = await db.users.toArray();
    if (!user) return [];
    const raw = await db.games.where("userId").equals(user.id!).toArray();
    const courses = await db.courses.toArray();
    const courseMap = new Map(courses.map((c) => [c.id, c.name]));
    return raw.map((g) => ({
      id: g.id!,
      courseName: courseMap.get(g.courseId) ?? "",
      datePlayed: g.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      finalScore: g.finalScore ?? 0,
    }));
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: games?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });
  // if we have games, we'd list them here
  if (games && games.length > 0) {
    return (
      <div className="relative min-h-screen bg-background py-6">
        {/* virtualized list */}
        <div
          ref={parentRef}
          className="overflow-y-auto pb-24" // pad for button
          style={{ height: "100vh" }}
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const game = games![virtualRow.index];
              return (
                <div
                  key={game.id}
                  style={{
                    position: "absolute",
                    top: virtualRow.start,
                    width: "100%",
                  }}
                  className="px-4"
                >
                  <Link href={`/game?courseId=${game.id}`}>
                    <div className="bg-white rounded-lg flex items-center justify-between p-4 mb-4 shadow">
                      <div>
                        <div className="font-bold text-text">
                          {game.courseName}
                        </div>
                        <div className="text-sm text-text">
                          Date Played: {game.datePlayed}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center">
                        <span className="text-black font-bold">
                          {game.finalScore}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full bg-accent p-4">
          <div className="flex flex-col sm:flex-row justify-between">
            <BottomSheet
              label="New Course"
              handleCallback={() => setShowForm(COURSE_OPTION)}
            />
            <BottomSheet
              label="New Range"
              handleCallback={() => setShowForm(RANGE_OPTION)}
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen flex flex-col justify-center">
      <div className="flex flex-col sm:flex-row justify-between">
        <BottomSheet
          label="New Course"
          handleCallback={() => setShowForm(COURSE_OPTION)}
        />
        <BottomSheet
          label="New Range"
          handleCallback={() => setShowForm(RANGE_OPTION)}
        />
      </div>
    </div>
  );
}
