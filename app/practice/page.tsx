"use client";
import { useState } from "react";
import clubDrillsData from "@/lib/club-drills.json";
import AuthGuard from "@/components/AuthGuard";
import ClubTitle from "@/components/ImprovementTemplate/ClubTitle";
import ImprovementSubTitle from "@/components/ImprovementTemplate/ImprovementSubTitle";
import ListContainer from "@/components/ImprovementTemplate/ListContainer";
import ImprovementTitleTask from "@/components/ImprovementTemplate/ImprovementTitleTask";
import PageTitle from "@/components/ImprovementTemplate/PageTitle";

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
    <AuthGuard>
      <>
        <div className="container flex-col mx-auto p-6">
          {/* Drill Carousel - appears above club selection when a club is selected */}
          {selectedClubData && (
            <div className="mb-10">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-2 border-amber-100">
                <div className="flex items-center justify-between">
                  <ClubTitle title={selectedClubData.club} />
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-600">
                      {currentDrillIndex + 1} of{" "}
                      {selectedClubData.drills.length}
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
                        <ImprovementSubTitle title={drill.name} />
                        <p className="text-base text-slate-700 mb-6 leading-relaxed">
                          {drill.description}
                        </p>
                        <ListContainer>
                          <div className="space-y-2">
                            <ul className="flex flex-col gap-3">
                              <li className="flex gap-3 items-start">
                                <ImprovementTitleTask
                                  title="Focus:"
                                  task={drill.focus}
                                />
                              </li>
                              <li className="flex gap-3 items-start">
                                <ImprovementTitleTask
                                  title="Reps:"
                                  task={drill.recommendedReps}
                                />
                              </li>
                              <li className="flex gap-3 items-start">
                                <ImprovementTitleTask
                                  title="Difficulty:"
                                  task={drill.difficulty}
                                />
                              </li>
                            </ul>
                          </div>
                        </ListContainer>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={prevDrill}
                    disabled={currentDrillIndex === 0}
                    className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors font-semibold text-base"
                  >
                    <svg
                      className="w-5 h-5"
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

                  <div className="flex gap-2">
                    {selectedClubData.drills.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentDrillIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentDrillIndex
                            ? "bg-blue-600"
                            : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextDrill}
                    disabled={
                      currentDrillIndex === selectedClubData.drills.length - 1
                    }
                    className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors font-semibold text-base"
                  >
                    Next
                    <svg
                      className="w-5 h-5"
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
          <div className="mb-8 flex flex-col justify-center items-center w-full">
            <PageTitle
              title="Practice Drills"
              description="Select a club and select a practice drills."
            />
            <div className="space-y-4 w-full max-w-lg">
              {clubDrills.map((club) => (
                <label
                  key={club.club}
                  className={`flex items-center justify-center w-full text-black py-3 rounded font-bold cursor-pointer text-center transition-all duration-200 ${
                    selectedClub === club.club
                      ? "bg-orange-500 active:bg-orange-300"
                      : "bg-white hover:shadow-md border-2 border-slate-300 hover:border-orange-300"
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
                  <span className="font-bold text-xl">{club.club}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </>
    </AuthGuard>
  );
};

export default Practice;
