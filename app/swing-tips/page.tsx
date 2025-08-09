"use client";

import SwingTipsData from "@/lib/game-tips.json";
import AuthGuard from "@/components/AuthGuard";
import ImprovementTask from "@/components/ImprovementTemplate/ImprovementTask";
import ClubTitle from "@/components/ImprovementTemplate/ClubTitle";
import ListContainer from "@/components/ImprovementTemplate/ListContainer";
import ImprovementSubTitle from "@/components/ImprovementTemplate/ImprovementSubTitle";
import ImprovementTitleTask from "@/components/ImprovementTemplate/ImprovementTitleTask";
import { useState } from "react";
import PageTitle from "@/components/ImprovementTemplate/PageTitle";

interface LieAdjustment {
  target: string;
  grip: string;
  swing: string;
}

interface LieAdjustments {
  teeBox?: LieAdjustment;
  fairway?: LieAdjustment;
  rough?: LieAdjustment;
  bunker?: LieAdjustment;
  green?: LieAdjustment;
  fringe?: LieAdjustment;
  uneven?: LieAdjustment;
  uphillLie?: LieAdjustment;
  downhillLie?: LieAdjustment;
}

interface SwingTip {
  club: string;
  ballPosition: string;
  stanceWidth: string;
  weightDistribution: string;
  notes: string;
  lieAdjustments: LieAdjustments;
}

const SwingTips = () => {
  const tips: SwingTip[] = SwingTipsData as unknown as SwingTip[];
  const [selectedClub, setSelectedClub] = useState<SwingTip | null>(null);

  const handleClubSelect = (club: string) => {
    const clubData = tips.find((tip) => tip.club === club);
    if (clubData) {
      setSelectedClub(clubData);
    }

    // Scroll to top to show the drill card
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AuthGuard>
      <div className="container flex-col mx-auto p-6">
        {selectedClub && (
          <div className="mb-10">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-200 border-2 border-amber-100">
                <ClubTitle title={selectedClub?.club} />

                <div className="space-y-6">
                  <div>
                    <ImprovementTask
                      title="Ball Position"
                      description={selectedClub.ballPosition}
                    />
                  </div>

                  <div>
                    <ImprovementTask
                      title="Stance Width"
                      description={selectedClub.stanceWidth}
                    />
                  </div>

                  <div>
                    <ImprovementTask
                      title="Weight Distribution"
                      description={selectedClub.weightDistribution}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4 text-slate-800">
                      Lie Adjustments
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(selectedClub.lieAdjustments).map(
                        ([key, value]) => (
                          <ListContainer key={key}>
                            <ImprovementSubTitle
                              title={key.replace(/([A-Z])/g, " $1").trim()}
                            />
                            <div className="space-y-2">
                              <ul className="flex flex-col gap-3">
                                <li className="flex gap-3 items-start">
                                  <ImprovementTitleTask
                                    title="Target"
                                    task={value.target}
                                  />
                                </li>
                                <li className="flex gap-3 items-start">
                                  <ImprovementTitleTask
                                    title="Grip"
                                    task={value.grip}
                                  />
                                </li>
                                <li className="flex gap-3 items-start">
                                  <ImprovementTitleTask
                                    title="Swing"
                                    task={value.swing}
                                  />
                                </li>
                              </ul>
                            </div>
                          </ListContainer>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mb-8 flex flex-col justify-center items-center w-full">
          <PageTitle
            title="Swing Tips"
            description="Select a club to see the swing tips for that club."
          />

          <div className="space-y-4 w-full max-w-lg">
            {tips.map((tip) => (
              <label
                key={tip.club}
                className={`flex items-center justify-center w-full text-black py-3 rounded font-bold cursor-pointer text-center transition-all duration-200 ${
                  selectedClub?.club === tip.club
                    ? "bg-orange-500 active:bg-orange-300"
                    : "bg-white hover:shadow-md border-2 border-slate-300 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="club"
                  value={tip.club}
                  checked={selectedClub?.club === tip.club}
                  onChange={(e) => handleClubSelect(e.target.value)}
                  className="sr-only"
                />
                <span className="font-bold text-xl">{tip.club}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SwingTips;
