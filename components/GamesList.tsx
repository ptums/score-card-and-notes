// app/games/page.tsx
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import Link from "next/link";
import BottomSheet from "./BottomSheet";
import { useRouter } from "next/navigation";
import UserMenu from "./UserMenu";

export default function GamesList({
  setShowForm,
}: {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  // 1️⃣ load & enrich games with course name, formatted date, and finalScore
  const games = useLiveQuery(async () => {
    const raw = await db.games.toArray();
    const courses = await db.courses.toArray();
    const courseMap = new Map(courses.map((c) => [c.id, c.name]));
    return raw.map((g) => ({
      id: g.id!,
      courseId: g.courseId,
      courseName: courseMap.get(g.courseId) ?? "",
      datePlayed: g.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      finalScore: g.finalScore ?? 0,
    }));
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: games?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // Delete game function
  const handleDeleteGame = async (gameId: number) => {
    try {
      // Delete all scores associated with this game
      await db.scores.where("gameId").equals(gameId).delete();
      // Delete the game
      await db.games.delete(gameId);
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  // if we have games, we'd list them here
  if (games && games.length > 0) {
    return (
      <div className="relative min-h-screen bg-background">
        <UserMenu />
        {/* virtualized list */}
        <div
          ref={parentRef}
          className="overflow-y-auto pb-24" // pad for button
          style={{ height: "calc(100vh - 64px)" }} // Subtract header height
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
                  <div className="bg-white rounded-lg flex items-center justify-between p-4 mb-4 shadow">
                    <Link
                      href={`/game?courseId=${game.courseId}`}
                      className="flex-1"
                    >
                      <div>
                        <div className="font-bold text-text">
                          {game.courseName}
                        </div>
                        <div className="text-sm text-text">
                          Date Played: {game.datePlayed}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center">
                        <span className="text-black font-bold">
                          {game.finalScore}
                        </span>
                      </div>
                      <div className="border-l border-gray-200 h-8 mx-2"></div>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        title="Delete game"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <BottomSheet
          label="Practice Drills"
          handleCallback={() => router.push("/practice")}
          position="fixed bottom-15 left-0"
          colorClasses="bg-teal-500 active:bg-teal-300"
        />
        <BottomSheet
          label="New Game"
          handleCallback={() => setShowForm(true)}
          position="fixed bottom-0 left-0"
          colorClasses="bg-orange-500 active:bg-orange-300"
        />
      </div>
    );
  }
}
