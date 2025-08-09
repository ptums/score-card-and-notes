"use client";
import GamesList from "@/components/GamesList";
import NewCourseForm from "@/components/NewCourseForm";
import { useState, useEffect } from "react";
import { db } from "../../lib/db";
import AuthGuard from "@/components/AuthGuard";
import BottomSheet from "@/components/BottomSheet";

export default function Games() {
  const [showForm, setShowForm] = useState(false);
  const [hasExistingGames, setHasExistingGames] = useState<boolean | null>(
    null
  );

  // Check if there are existing games
  useEffect(() => {
    const checkExistingGames = async () => {
      const gamesCount = await db.games.count();
      setHasExistingGames(gamesCount > 0);
    };

    checkExistingGames();
  }, []);

  // Show loading while checking data
  if (hasExistingGames === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <>
        {/* Show form for new players or when explicitly requested */}
        {showForm || !hasExistingGames ? (
          <NewCourseForm />
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
    </AuthGuard>
  );
}
