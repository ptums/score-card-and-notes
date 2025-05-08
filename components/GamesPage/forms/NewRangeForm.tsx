// components/NewRangeForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";

export default function NewRangeForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [numBalls, setNumBalls] = useState("");
  const [totalYards, setTotalYards] = useState("");
  const [rangeId, setRangeId] = useState<number | null>(null);

  const ballsOptions = ["20+", "50+", "75+", "100+", "150+", "175+", "200+"];

  // 1️⃣ When rangeId, name & numBalls are set, wait 1.5s then redirect
  useEffect(() => {
    if (rangeId != null && name.trim() !== "" && numBalls !== "") {
      const handle = window.setTimeout(() => {
        router.push(`/game?rangeId=${rangeId}&option=range`);
      }, 1500);
      return () => clearTimeout(handle);
    }
  }, [rangeId, name, numBalls, router]);

  // 2️⃣ On form submit, add the Range and store its id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !numBalls || !totalYards) return;

    // get (or create) user
    const [user] = await db.users.toArray();
    const userId = user?.id ?? 0;

    // add to IndexedDB
    const id = await db.ranges.add({
      userId,
      name: name.trim(),
      numBallsPerBucket: numBalls, // stored as string
      totalYards: Number(totalYards), // stored as number

      averageYardHit: 0,
      ballsHit: [],
    });

    // set state to trigger the redirect effect
    setRangeId(id);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      {/* Range Name */}
      <div>
        <label htmlFor="rangeName" className="block text-lg font-bold mb-2">
          Range Name
        </label>
        <input
          id="rangeName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded"
        />
      </div>

      {/* Balls per Bucket */}
      <div>
        <span className="block text-lg font-bold mb-2">Balls per Bucket</span>
        <div className="flex flex-wrap gap-2">
          {ballsOptions.map((opt) => {
            const active = numBalls === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => setNumBalls(opt)}
                className={`
                  px-4 py-2 rounded-full font-bold
                  ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-orange-300 text-black"
                  }
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Yards */}
      <div>
        <label htmlFor="totalYards" className="block text-lg font-bold mb-2">
          Total Yards
        </label>
        <input
          id="totalYards"
          type="number"
          value={totalYards}
          onChange={(e) => setTotalYards(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded"
        />
      </div>

      {/* Save button */}
      <button
        type="submit"
        className="w-full bg-orange-500 active:bg-orange-300 text-black font-bold py-3 rounded"
      >
        Save Range
      </button>
    </form>
  );
}
