// app/games/page.tsx
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import Link from "next/link";

export default function GamesList() {
  // 1️⃣ load & enrich games with course name, formatted date, and finalScore
  const games = useLiveQuery(async () => {
    const raw = await db.games.toArray();
    const courses = await db.courses.toArray();
    const courseMap = new Map(courses.map((c) => [c.id, c.name]));

    const uniqueGames = raw.filter(
      (game, index, self) =>
        game.courseId &&
        index === self.findIndex((g) => g.courseId === game.courseId)
    );

    return uniqueGames.map((g) => ({
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
    estimateSize: () => 120, // Increased height for better spacing
    overscan: 5,
  });

  // Delete game function
  const handleDeleteGame = async (gameId: number) => {
    console.log(gameId);
    try {
      // Use a transaction to ensure atomicity and proper live query updates
      await db.transaction("rw", db.games, db.scores, async () => {
        // Delete all scores associated with this game
        await db.scores.where("gameId").equals(gameId).delete();
        // Delete the game
        await db.games.delete(gameId);
      });

      // The transaction completion will automatically trigger useLiveQuery to refetch
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  // if we have games, we'd list them here
  if (games && games.length > 0) {
    return (
      <div
        ref={parentRef}
        className="overflow-y-auto pb-32" // Increased padding for buttons
        style={{ height: "calc(100vh - 80px)" }} // Adjusted for header height
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
                key={`game-${game.id}-${virtualRow.index}`}
                style={{
                  position: "absolute",
                  top: virtualRow.start,
                  width: "100%",
                }}
                className="px-6 py-2"
              >
                <div className="bg-white rounded-xl shadow-lg border-2 border-amber-100 flex items-center justify-between p-6 mb-4 hover:shadow-xl transition-shadow duration-200">
                  <Link
                    href={`/game?courseId=${game.courseId}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-slate-800 leading-tight">
                        {game.courseName}
                      </div>
                      <div className="text-base text-slate-600 font-medium">
                        Date Played: {game.datePlayed}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-md border-2 border-orange-200">
                      <span className="text-white font-bold text-lg">
                        {game.finalScore}
                      </span>
                    </div>
                    <div className="border-l-2 border-slate-200 h-12 mx-2"></div>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="w-12 h-12 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-2 border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete game"
                      aria-label={`Delete game at ${game.courseName}`}
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
    );
  }
}
