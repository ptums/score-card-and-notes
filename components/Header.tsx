"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import OfflineStatus from "./OfflineStatus";

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    if (typeof window !== "undefined") {
      router.push(path);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b-2 border-amber-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Back Button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              router.back();
            }
          }}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-white hover:bg-amber-100 transition-colors duration-200 border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer"
          aria-label="Go back to previous screen"
        >
          <svg
            className="w-6 h-6 text-slate-800"
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
        </button>

        {/* App Title */}
        <div className="flex items-center space-x-2 px-3 py-1">
          <h1 className="text-xl font-bold text-slate-800">Your Golf Buddy</h1>
        </div>

        {/* Right side - Offline Status and Menu */}
        <div className="flex items-center space-x-3">
          <OfflineStatus />

          {/* Mobile Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  setIsMenuOpen(!isMenuOpen);
                }
              }}
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-white hover:bg-amber-100 transition-colors duration-200 border-2 border-amber-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <svg
                className="w-6 h-6 text-slate-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border-2 z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        handleNavigation("/games");
                      }
                    }}
                    className="w-full px-6 py-4 text-left text-lg font-bold text-slate-800 hover:bg-amber-50 transition-colors duration-200 focus:outline-none focus:bg-amber-50 focus:ring-2 focus:ring-orange-500 focus:ring-inset cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Home
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        handleNavigation("/swing-tips");
                      }
                    }}
                    className="w-full px-6 py-4 text-left text-lg font-bold text-slate-800 hover:bg-amber-50 transition-colors duration-200 focus:outline-none focus:bg-amber-50 focus:ring-2 focus:ring-orange-500 focus:ring-inset cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Swing Tips
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        handleNavigation("/practice-drills");
                      }
                    }}
                    className="w-full px-6 py-4 text-left text-lg font-bold text-slate-800 hover:bg-amber-50 transition-colors duration-200 focus:outline-none focus:bg-amber-50 focus:ring-2 focus:ring-orange-500 focus:ring-inset cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Practice Drills
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        handleNavigation("/api-docs");
                      }
                    }}
                    className="w-full px-6 py-4 text-left text-lg font-bold text-slate-800 hover:bg-amber-50 transition-colors duration-200 focus:outline-none focus:bg-amber-50 focus:ring-2 focus:ring-orange-500 focus:ring-inset cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      API Docs
                    </div>
                  </button>

                  {/* Authentication Section */}
                  {isAuthenticated ? (
                    <>
                      <div className="border-t-2 border-amber-200 my-2"></div>

                      {/* User Info */}
                      <div className="px-6 py-3 bg-amber-50">
                        <div className="text-sm text-slate-600">
                          <p className="font-medium text-slate-800">
                            {user?.name}
                          </p>
                          <p className="text-xs">{user?.email}</p>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          if (typeof window !== "undefined") {
                            router.push("/sign-in");
                          }
                        }}
                        className="w-full px-6 py-4 text-left text-lg font-bold text-red-600 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-inset cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign Out
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t-2 border-amber-200 my-2"></div>

                      {/* Sign In Button */}
                      <button
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            handleNavigation("/sign-in");
                          }
                        }}
                        className="w-full px-6 py-4 text-left text-lg font-bold text-orange-600 hover:bg-orange-50 transition-colors duration-200 focus:outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:ring-inset cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign In
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
