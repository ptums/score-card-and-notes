"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to Your Golf Buddy
        </h1>
        <p className="text-gray-600 mb-8">
          Start tracking your golf games and improving your swing.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => {
              router.push("/games");
            }}
            className="w-full max-w-xs bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
