"use client";

export default function OfflineStatus() {
  // Only render in browser
  if (typeof window === "undefined") return null;

  // Check if we're offline
  const isOffline = typeof window !== "undefined" && !navigator.onLine;
  
  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-orange-800">
              You&apos;re currently offline
            </h3>
            <p className="mt-1 text-sm text-orange-700">
              You can continue using the app offline. Your data is being saved locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
