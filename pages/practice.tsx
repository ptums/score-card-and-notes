import BottomSheet from "@/components/BottomSheet";
import router from "next/router";
import { useState } from "react";
import clubDrillsData from "@/lib/club_drills.json";

interface Drill {
  name: string;
  description: string;
  focus: string;
  recommendedReps: string;
  difficulty: string;
}

interface ClubDrill {
  club: string;
  drills: Drill[];
}

const Practice = () => {
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);

  const clubDrills: ClubDrill[] = clubDrillsData.clubDrills;
  const selectedClubData = clubDrills.find(
    (club) => club.club === selectedClub
  );

  const handleClubSelect = (club: string) => {
    setSelectedClub(club);
    setCurrentDrillIndex(0); // Reset to first drill when selecting a new club

    // Scroll to top to show the drill card
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextDrill = () => {
    if (
      selectedClubData &&
      currentDrillIndex < selectedClubData.drills.length - 1
    ) {
      setCurrentDrillIndex(currentDrillIndex + 1);
    }
  };

  const prevDrill = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(currentDrillIndex - 1);
    }
  };

  return (
    <>
      <div className="container flex-col  mx-auto">
        {/* Drill Carousel - appears above club selection when a club is selected */}
        {selectedClubData && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedClubData.club}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {currentDrillIndex + 1} of {selectedClubData.drills.length}
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentDrillIndex * 100}%)`,
                  }}
                >
                  {selectedClubData.drills.map((drill, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          {drill.name}
                        </h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {drill.description}
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              Focus:
                            </span>
                            <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                              {drill.focus}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              Reps:
                            </span>
                            <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded-full">
                              {drill.recommendedReps}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              Level:
                            </span>
                            <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                              {drill.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Navigation */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={prevDrill}
                  disabled={currentDrillIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <div className="flex gap-1">
                  {selectedClubData.drills.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDrillIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentDrillIndex
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextDrill}
                  disabled={
                    currentDrillIndex === selectedClubData.drills.length - 1
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                >
                  Next
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Club Selection */}
        <div className="mb-6 flex flex-col justify-center items-center w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Select a Club
          </h2>
          <div className="space-y-3 w-full max-w-md">
            {clubDrills.map((club) => (
              <label
                key={club.club}
                className={`flex items-center justify-center p-4  rounded font-bold cursor-pointer  w-full text-center ${
                  selectedClub === club.club
                    ? "bg-orange-500 active:bg-orange-300 shadow-sm"
                    : "bg-white hover:shadow-sm border-1 border-gray-400 font-bold"
                }`}
              >
                <input
                  type="radio"
                  name="club"
                  value={club.club}
                  checked={selectedClub === club.club}
                  onChange={(e) => handleClubSelect(e.target.value)}
                  className="sr-only"
                />
                <span className="font-semibold text-lg">{club.club}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <BottomSheet
        label="Game Tips"
        handleCallback={() => router.push("/game-tips")}
        position="fixed bottom-15 left-0 bg-white border-t-1 border-gray-200"
        colorClasses="bg-teal-500 active:bg-teal-300"
      />
      <BottomSheet
        label="Home"
        handleCallback={() => router.push("/games?new_player=0")}
        position="fixed bottom-0 left-0 bg-white"
        colorClasses="bg-orange-500 active:bg-orange-300"
      />
    </>
  );
};

export default Practice;
