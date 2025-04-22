// components/PhoneNumberInput.tsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "../lib/db"; // adjust path if needed

const PHONE_LENGTH = 10;

export default function PhoneNumberInput() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(PHONE_LENGTH).fill(""));
  const timerRef = useRef<number | null>(null);

  // 1) If they've already signed up, skip ahead
  useEffect(() => {
    (async () => {
      const count = await db.users.count();
      if (count > 0) {
        router.push("/games?new_player=0");
      }
    })();
  }, [router]);

  // 2) Autofocus first box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 3) Handle digit entry + auto‑advance
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value;
    if (/^\d$/.test(val)) {
      setDigits((d) => {
        const nd = [...d];
        nd[idx] = val;
        return nd;
      });
      if (idx < PHONE_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    } else if (val === "") {
      // allow backspace clearing
      setDigits((d) => {
        const nd = [...d];
        nd[idx] = "";
        return nd;
      });
    }
  };

  // 4) Backspace to previous box
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && digits[idx] === "" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // 5) Debounce submit when all filled
  useEffect(() => {
    if (digits.every((d) => d !== "")) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(async () => {
        const phoneNumber = digits.join("");
        await db.users.clear();
        await db.users.add({
          account: phoneNumber,
          game: [],
        });
        router.push("/games?new_player=1");
      }, 1500);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [digits, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-sans mb-6">Enter your phone number</h1>
      <div className="flex space-x-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            ref={(el) => {
              if (el) {
                inputRefs.current[idx] = el;
              }
            }}
            className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-sans focus:border-blue-500 focus:outline-none"
          />
        ))}
      </div>
    </div>
  );
}
