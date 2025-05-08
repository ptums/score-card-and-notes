import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ball, Range, db } from "@/lib/db";

import type { Rating } from "@/utils/types";
import { useRouter } from "next/router";

export default function RangeFlow() {
  const router = useRouter();
  const rangeIdQuery = router?.query?.rangeId as string;
  const rangeId = parseInt(rangeIdQuery);

  const [range, setRange] = useState<Range | null>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [current, setCurrent] = useState(0);
  const [selectedYards, setSelectedYards] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  // load Range and its Ball entries
  useEffect(() => {
    if (!rangeId) return;
    (async () => {
      const r = await db.ranges.get(rangeId);
      if (r) setRange(r);
      const bs = await db.balls.where("rangeId").equals(rangeId).toArray();
      setBalls(bs);
      // initialize selection from first ball if it exists
      if (bs[0]) {
        setSelectedYards(bs[0].yards);
        setSelectedRating(bs[0].rating);
      }
    })();
  }, [rangeId]);

  // recompute and persist stats whenever balls change
  useEffect(() => {
    if (!range || !rangeId) return;
    const totalYards = balls.reduce(
      (sum, b) => sum + (parseInt(b.yards, 10) || 0),
      0
    );
    const average = balls.length > 0 ? totalYards / balls.length : 0;

    // update the Range record
    db.ranges.update(rangeId, {
      totalYards: totalYards,
      averageYardHit: average,
    });

    // update local state
    setRange({
      ...range,
      totalYards: totalYards,
      averageYardHit: average,
    });
  }, [balls, range, rangeId]);

  if (!range) {
    return <p>Loading…</p>;
  }

  const holes = parseInt(range.numBallsPerBucket.replace("+", ""), 10) || 0;
  const yardsOptions = [
    "10+",
    "20+",
    "50+",
    "75+",
    "100+",
    "150+",
    "175+",
    "200+",
  ];
  const ratingOptions: Rating[] = [1, 2, 3, 4, 5];

  const handleNext = async () => {
    if (!rangeId || !selectedYards || selectedRating === null) return;

    const existing = balls[current];
    const updatedBalls = [...balls];

    if (existing && existing.id) {
      // update existing
      await db.balls.update(existing.id, {
        yards: selectedYards,
        rating: selectedRating,
      });
      updatedBalls[current] = {
        ...existing,
        yards: selectedYards,
        rating: selectedRating,
      };
    } else {
      // add new
      const id = await db.balls.add({
        rangeId,
        yards: selectedYards,
        rating: selectedRating,
      });
      const newBall: Ball = {
        id,
        rangeId,
        yards: selectedYards,
        rating: selectedRating,
      };
      updatedBalls[current] = newBall;
    }

    setBalls(updatedBalls);

    const nextIndex = current + 1;
    if (nextIndex < holes) {
      setCurrent(nextIndex);
      const nextBall = updatedBalls[nextIndex];
      if (nextBall) {
        setSelectedYards(nextBall.yards);
        setSelectedRating(nextBall.rating);
      } else {
        setSelectedYards("");
        setSelectedRating(null);
      }
    }
  };

  const handlePrev = () => {
    if (current === 0) return;
    const prevIndex = current - 1;
    setCurrent(prevIndex);
    const prevBall = balls[prevIndex];
    if (prevBall) {
      setSelectedYards(prevBall.yards);
      setSelectedRating(prevBall.rating);
    }
  };

  return (
    <>
      {/* header */}
      <div className="flex justify-between px-6 py-4 text-slate-950">
        <h1 className="text-xl font-bold">{range.name}</h1>
        <p className="text-lg">
          <span className="font-bold">Total Yards:</span> {range.totalYards}
        </p>
        <p className="text-lg">
          <span className="font-bold">Average:</span>{" "}
          {range.averageYardHit.toFixed(1)}
        </p>

        <p className="text-base">
          <Link
            href="/games?new_player=0"
            className="inline-flex items-center underline"
          >
            Home
          </Link>
        </p>
      </div>

      {/* single ball card */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="bg-white rounded-lg p-4 shadow relative">
          <p className="float-right font-bold">{current + 1}</p>

          {/* Yards row */}
          <div className="mb-6">
            <span className="block text-slate-950 mb-2 font-bold">Yards</span>
            <div className="flex space-x-2 flex-wrap">
              {yardsOptions.map((y) => {
                const active = selectedYards === y;
                return (
                  <button
                    key={y}
                    onClick={() => setSelectedYards(y)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-orange-300 text-black"
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating row */}
          <div className="mb-6">
            <span className="block text-slate-950 mb-2 font-bold">Rating</span>
            <div className="flex space-x-2">
              {ratingOptions.map((r) => {
                const active = selectedRating === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRating(r)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-orange-300 text-black"
                    }`}
                    disabled={!selectedYards}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* navigation */}
      <div className="flex justify-between px-6 py-4 bg-dusk">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="text-black font-bold disabled:opacity-50 p-4 active:bg-orange-300 bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={handleNext}
          disabled={current >= holes - 1}
          className="text-black font-bold disabled:opacity-50 active:bg-orange-300 p-4 bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
