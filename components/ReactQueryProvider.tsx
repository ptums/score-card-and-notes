"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized for IndexedDB operations
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            refetchOnReconnect: false, // Don't refetch on network reconnect
            retry: (failureCount, error) => {
              // Don't retry if it's a database closed error
              if (
                error instanceof Error &&
                error.message.includes("DatabaseClosedError")
              ) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
          },
          mutations: {
            // Optimized for IndexedDB mutations
            retry: (failureCount, error) => {
              // Don't retry mutations on database errors
              if (
                error instanceof Error &&
                error.message.includes("DatabaseClosedError")
              ) {
                return false;
              }
              // Retry mutations up to 2 times
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
