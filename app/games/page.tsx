"use client";
import GamesList from "@/components/GamesList";
import NewCourseForm from "@/components/NewCourseForm";
import { useState, useEffect } from "react";
import { db } from "../../lib/db";
import BottomSheet from "@/components/BottomSheet";

export default function Games() {
  const [showForm, setShowForm] = useState(false);
  const [hasExistingGames, setHasExistingGames] = useState<boolean | null>(
    null
  );

  // Check if there are existing games
  useEffect(() => {
    const checkExistingGames = async () => {
      try {
        if (!db) {
          console.log("Database not available, showing new course form");
          setHasExistingGames(false);
          return;
        }

        console.log("Checking for existing games...");
        const gamesCount = await db.games.count();
        console.log("Games count:", gamesCount);
        setHasExistingGames(gamesCount > 0);
      } catch (error) {
        console.error("Error checking existing games:", error);
        // If there's an error, assume no games exist and show the form
        setHasExistingGames(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (hasExistingGames === null) {
        console.warn("Games check timed out, showing new course form");
        setHasExistingGames(false);
      }
    }, 3000); // 3 second timeout

    checkExistingGames();

    return () => clearTimeout(timeoutId);
  }, [hasExistingGames]);

  // Show loading while checking data
  if (hasExistingGames === null) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Checking your golf games...</p>
          <button
            onClick={() => setHasExistingGames(false)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Skip Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show form for new players or when explicitly requested */}
      {showForm || !hasExistingGames ? (
        <div>
          <NewCourseForm />
        </div>
      ) : (
        <div className="relative min-h-screen bg-amber-50">
          <GamesList />
          <BottomSheet
            label="New Game"
            handleCallback={() => setShowForm(true)}
            position="fixed bottom-0 left-0 bg-white/80 border-t-2 border-amber-200"
            colorClasses="bg-orange-600 active:bg-orange-500 text-white font-semibold"
          />
        </div>
      )}
    </>
  );
}
