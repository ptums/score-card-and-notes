"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

export default function NewGameInput() {
  const router = useRouter();

  // load existing games
  const games = useLiveQuery(() => db.games.toArray(), []);

  // form state
  const [courseName, setCourseName] = useState("");
  const [selectedRounds, setSelectedRounds] = useState<9 | 18 | null>(null);

  // ref to auto‑focus
  const inputRef = useRef<HTMLInputElement>(null);

  // focus the course input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // when both name + rounds are set, wait 1.5s then save & redirect
  useEffect(() => {
    if (selectedRounds !== null && courseName.trim() !== "") {
      const handle = window.setTimeout(async () => {
        // 1) create the Course record
        const courseId = await db.courses.add({
          name: courseName.trim(),
          rounds: selectedRounds,
        });

        // 2) redirect to your single‑game page
        router.push(`/game/${courseId}`);
      }, 1500);

      return () => clearTimeout(handle);
    }
  }, [selectedRounds, courseName, router]);

  // button handler
  const onRoundsClick = (r: 9 | 18) => {
    setSelectedRounds(r);
  };

  // if we have games, we’d list them here
  if (games && games.length > 0) {
    console.log(games);
    return <div>Well get there..</div>;
  }

  // no games → show “Add new course” form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col">
        <label
          htmlFor="course"
          className="mb-2 font-sans text-lg w-full text-left"
        >
          Course
        </label>
        <input
          id="course"
          ref={inputRef}
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="w-full bg-white max-w-md p-3 mb-6 border-2 rounded-xl font-sans focus:outline-none focus:border-yellow-500 text-cyan-900 font-semibold"
        />

        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => onRoundsClick(9)}
            disabled={!courseName.trim()}
            className="w-20 h-20 font-bold font-sans text-4xl bg-white border-2 rounded-xl text-green-400 border-green-400 disabled:opacity-80 cursor-pointer
"
          >
            9
          </button>
          <button
            onClick={() => onRoundsClick(18)}
            disabled={!courseName.trim()}
            className="w-20 h-20 font-bold font-sans text-4xl bg-white border-2 rounded-xl text-red-500 text-bold border-red-500 disabled:opacity-80 cursor-pointer
"
          >
            18
          </button>
        </div>
      </div>
    </div>
  );
}
