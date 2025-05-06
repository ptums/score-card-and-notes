import { db } from "@/lib/db";
import { useEffect, useState } from "react";

export default function RangeFlow() {
  const [rangeId, setRangeId] = useState<number | null>(null);
  const [selectedYards, setSelectedYards] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);

  // Load existing record on mount
  useEffect(() => {
    (async () => {
      const all = await db.ranges.toArray();
      if (all.length > 0) {
        const rec = all[0];
        setRangeId(rec.id!);
        setSelectedYards(rec.yards);
        setRating(rec.rating);
      }
    })();
  }, []);

  // Helper to upsert yards
  const handleYardsSelect = async (yards: string) => {
    setSelectedYards(yards);
    if (rangeId == null) {
      const id = await db.ranges.add({ yards, rating: rating ?? 0 });
      setRangeId(id);
    } else {
      await db.ranges.update(rangeId, { yards });
    }
  };

  // Helper to upsert rating
  const handleRatingSelect = async (value: number) => {
    setRating(value);
    if (rangeId == null) {
      const id = await db.ranges.add({ yards: selectedYards, rating: value });
      setRangeId(id);
    } else {
      await db.ranges.update(rangeId, { rating: value });
    }
  };

  // 3️⃣ UI
  const yardsOptions = ["0-100", "100-150", "150-200", "200-250"];
  const ratingOptions = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col h-full">
      {/* Yards row */}
      <div className="px-6 py-4">
        <span className="block text-slate-950 mb-2 font-bold">Yards</span>
        <div className="flex space-x-2">
          {yardsOptions.map((opt) => {
            const active = selectedYards === opt;
            return (
              <button
                key={opt}
                onClick={() => handleYardsSelect(opt)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                  ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-orange-300 text-slate-950"
                  }
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating row */}
      <div className="px-6 py-4">
        <span className="block text-slate-950 mb-2 font-bold">Rating</span>
        <div className="flex space-x-2">
          {ratingOptions.map((n) => {
            const active = rating === n;
            return (
              <button
                key={n}
                onClick={() => handleRatingSelect(n)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                  ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-orange-300 text-slate-950"
                  }
                `}
                disabled={!selectedYards}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
