import BottomSheet from "@/components/BottomSheet";
import router from "next/router";
import gameTipsData from "../lib/game-tips.json";

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

interface GameTip {
  club: string;
  ballPosition: string;
  stanceWidth: string;
  weightDistribution: string;
  notes: string;
  lieAdjustments: LieAdjustments;
}

const GameTips = () => {
  const tips: GameTip[] = gameTipsData as unknown as GameTip[];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Golf Club Setup Guide
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-orange-600 mb-2">
                  {tip.club}
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Ball Position
                  </h3>
                  <p className="text-sm text-gray-600">{tip.ballPosition}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Stance Width
                  </h3>
                  <p className="text-sm text-gray-600">{tip.stanceWidth}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Weight Distribution
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tip.weightDistribution}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Lie Adjustments
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(tip.lieAdjustments).map(([key, value]) => (
                      <div key={key}>
                        <h4 className="text-xs font-semibold text-gray-700 capitalize mb-1">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <div className="space-y-1 text-xs">
                          <ul className="flex flex-col gap-1">
                            <li className="flex gap-1">
                              <span className="text-gray-500">Target:</span>
                              <span className="text-gray-600">
                                {value.target}
                              </span>
                            </li>
                            <li className="flex gap-1">
                              <span className="text-gray-500">Grip:</span>
                              <span className="text-gray-600">
                                {value.grip}
                              </span>
                            </li>
                            <li className="flex gap-1">
                              <span className="text-gray-500">Swing:</span>
                              <span className="text-gray-600">
                                {value.swing}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <BottomSheet
          label="Back"
          handleCallback={() => router.back()}
          position="fixed bottom-0 left-0 bg-white border-t-1 border-gray-200"
          colorClasses="bg-teal-500 active:bg-teal-300 "
        />
      </div>
    </div>
  );
};

export default GameTips;
