"use client";
import { useUser, SignOutButton } from "@clerk/nextjs";

export default function UserMenu() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <header className="w-full  px-4 py-3">
      <div className="flex items-center justify-end">
        <SignOutButton>
          <button
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Sign Out"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </SignOutButton>
      </div>
    </header>
  );
}
