import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { profileDB } from "./profile-db";

// Generic hook for IndexedDB operations
const useIndexedDBQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    // Retry logic for IndexedDB operations
    retry: (failureCount, error) => {
      // Don't retry if it's a database closed error
      if (
        error instanceof Error &&
        error.message.includes("DatabaseClosedError")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching all courses
export const useCourses = () => {
  return useIndexedDBQuery(["courses"], async () => {
    if (!db) throw new Error("Database not available");
    return await db.courses.toArray();
  });
};

// Hook for fetching courses by profile
export const useCoursesByProfile = (profileId: string | null) => {
  return useIndexedDBQuery(
    ["courses", "profile", profileId],
    async () => {
      if (!db || !profileId)
        throw new Error("Database or profile not available");
      return await db.courses.where("profileId").equals(profileId).toArray();
    },
    {
      enabled: !!profileId,
    }
  );
};

// Hook for fetching all games
export const useGames = () => {
  return useIndexedDBQuery(["games"], async () => {
    if (!db) throw new Error("Database not available");
    return await db.games.toArray();
  });
};

// Hook for fetching games by course
export const useGamesByCourse = (courseId: number | null) => {
  return useIndexedDBQuery(
    ["games", "course", courseId],
    async () => {
      if (!db || !courseId) throw new Error("Database or course not available");
      return await db.games.where("courseId").equals(courseId).toArray();
    },
    {
      enabled: !!courseId,
    }
  );
};

// Hook for fetching the most recent game for a course
export const useMostRecentGame = (courseId: number | null) => {
  return useIndexedDBQuery(
    ["games", "mostRecent", courseId],
    async () => {
      if (!db || !courseId) throw new Error("Database or course not available");
      const games = await db.games
        .where("courseId")
        .equals(courseId)
        .sortBy("date");

      // Return the most recent game (last in the sorted array)
      return games[games.length - 1] || null;
    },
    {
      enabled: !!courseId,
    }
  );
};

// Hook for fetching scores by game
export const useScoresByGame = (gameId: number | null) => {
  return useIndexedDBQuery(
    ["scores", "game", gameId],
    async () => {
      if (!db || !gameId) throw new Error("Database or game not available");
      return await db.scores.where("gameId").equals(gameId).toArray();
    },
    {
      enabled: !!gameId,
    }
  );
};

// Hook for fetching user profile
export const useProfile = () => {
  return useIndexedDBQuery(["profile"], async () => {
    if (!profileDB) throw new Error("Profile database not available");
    const profiles = await profileDB.getAllProfiles();
    return profiles[0] || null; // Return first profile
  });
};

// Mutation hook for creating a new course
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      rounds,
      profileId,
    }: {
      name: string;
      rounds: 9 | 18;
      profileId: string;
    }) => {
      if (!db) throw new Error("Database not available");
      return await db.courses.add({ name, rounds, profileId });
    },
    onSuccess: () => {
      // Invalidate and refetch courses
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// Mutation hook for creating a new game
export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      profileId,
    }: {
      courseId: number;
      profileId: string;
    }) => {
      if (!db) throw new Error("Database not available");
      return await db.games.add({
        courseId,
        date: new Date(),
        finalNote: "",
        finalScore: 0,
        scores: [],
      });
    },
    onSuccess: (newGameId, variables) => {
      // Invalidate and refetch games for this course
      queryClient.invalidateQueries({
        queryKey: ["games", "course", variables.courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["games", "mostRecent", variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

// Mutation hook for updating a game
export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      updates,
    }: {
      gameId: number;
      updates: Partial<{ finalScore: number; finalNote: string }>;
    }) => {
      if (!db) throw new Error("Database not available");
      return await db.games.update(gameId, updates);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch games
      queryClient.invalidateQueries({ queryKey: ["games"] });
      // Also invalidate specific game queries
      queryClient.invalidateQueries({
        queryKey: ["games", "game", variables.gameId],
      });
    },
  });
};

// Mutation hook for adding/updating a score
export const useUpsertScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      hole,
      scoreData,
    }: {
      gameId: number;
      hole: number;
      scoreData: { par?: string; score?: string; putts?: number };
    }) => {
      if (!db) throw new Error("Database not available");

      const existing = await db.scores
        .where("gameId")
        .equals(gameId)
        .and((r) => r.hole === hole)
        .first();

      if (existing?.id) {
        return await db.scores.update(existing.id, scoreData);
      } else {
        return await db.scores.add({
          gameId,
          hole,
          par: scoreData.par ?? "",
          score: scoreData.score ?? "",
          putts: scoreData.putts ?? 0,
        });
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch scores for this game
      queryClient.invalidateQueries({
        queryKey: ["scores", "game", variables.gameId],
      });
      // Also invalidate games since scores affect game totals
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

// Hook for fetching enriched games data (with course names)
export const useEnrichedGames = (profileId: string | null) => {
  const { data: games, ...gamesQuery } = useGames();
  const { data: courses, ...coursesQuery } = useCoursesByProfile(profileId);

  const isLoading = gamesQuery.isLoading || coursesQuery.isLoading;
  const error = gamesQuery.error || coursesQuery.error;

  const enrichedGames =
    games && courses
      ? games.map((game) => {
          const course = courses.find((c) => c.id === game.courseId);
          return {
            id: game.id!,
            courseId: game.courseId,
            courseName: course?.name ?? "",
            datePlayed: game.date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            finalScore: game.finalScore ?? 0,
            finalNote: game.finalNote ?? "",
          };
        })
      : [];

  return {
    data: enrichedGames,
    isLoading,
    error,
    refetch: () => {
      gamesQuery.refetch();
      coursesQuery.refetch();
    },
  };
};
