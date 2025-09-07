/* eslint-disable @typescript-eslint/no-explicit-any */
// Background sync service that runs independently
// This service is designed to work like iCloud sync - minimal, non-intrusive

class BackgroundSyncService {
  private syncWorker: ServiceWorker | null = null;
  private readonly SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeBackgroundSync();
  }

  private async initializeBackgroundSync() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      // Register service worker for background sync
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Set up periodic background sync if supported
      if ("periodicSync" in registration) {
        await this.setupPeriodicSync(registration);
      } else {
        // Fallback to setTimeout-based sync
        this.setupFallbackSync();
      }

      console.log("Background sync service initialized");
    } catch (error) {
      console.error("Failed to initialize background sync:", error);
      // Fallback to setTimeout-based sync
      this.setupFallbackSync();
    }
  }

  private async setupPeriodicSync(registration: ServiceWorkerRegistration) {
    try {
      // Request permission for periodic background sync
      const status = await navigator.permissions.query({
        name: "periodic-background-sync" as PermissionName,
      });

      if (status.state === "granted") {
        // Register periodic sync
        //@ts-expect-error: will fix this later
        await registration.periodicSync.register("golf-buddy-sync", {
          minInterval: this.SYNC_INTERVAL_MS,
        });
        console.log("Periodic background sync registered");
      } else {
        console.log(
          "Periodic background sync permission denied, using fallback"
        );
        this.setupFallbackSync();
      }
    } catch (error) {
      console.error("Periodic sync setup failed:", error);
      this.setupFallbackSync();
    }
  }

  private setupFallbackSync() {
    // Fallback: use setTimeout for periodic sync
    const performSync = async () => {
      try {
        // Check if sync is enabled
        const syncEnabled =
          localStorage.getItem("golf_buddy_sync_enabled") === "true";
        if (!syncEnabled) {
          // Schedule next check
          setTimeout(performSync, this.SYNC_INTERVAL_MS);
          return;
        }

        // Perform sync
        await this.performBackgroundSync();

        // Schedule next sync
        setTimeout(performSync, this.SYNC_INTERVAL_MS);
      } catch (error) {
        console.error("Background sync failed:", error);
        // Retry in 1 hour on error
        setTimeout(performSync, 60 * 60 * 1000);
      }
    };

    // Start the sync cycle
    setTimeout(performSync, this.SYNC_INTERVAL_MS);
  }

  private async performBackgroundSync() {
    try {
      // Set syncing status
      localStorage.setItem("golf_buddy_sync_status", "syncing");

      // Collect sync data
      const syncData = await this.collectSyncData();

      // Send to cloud
      const success = await this.sendToCloud(syncData);

      if (success) {
        localStorage.setItem("golf_buddy_last_sync", new Date().toISOString());
        localStorage.setItem("golf_buddy_sync_status", "success");
        localStorage.removeItem("golf_buddy_last_error");
        console.log("Background sync completed successfully");
      } else {
        throw new Error("Cloud sync failed");
      }
    } catch (error) {
      console.error("Background sync error:", error);
      localStorage.setItem("golf_buddy_sync_status", "error");
      localStorage.setItem(
        "golf_buddy_last_error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  private async collectSyncData() {
    // Import dynamically to avoid SSR issues
    const { profileDB } = await import("./profile-db");
    const { db } = await import("./db");

    const deviceId = localStorage.getItem("golf_buddy_device_id") || "unknown";

    // Collect data from IndexedDB
    const profiles = profileDB ? await profileDB.getAllProfiles() : [];
    const courses = db ? await db.courses.toArray() : [];
    const games = db ? await db.games.toArray() : [];
    const scores = db ? await db.scores.toArray() : [];

    return {
      profiles,
      courses,
      games,
      scores,
      metadata: {
        deviceId,
        lastSync:
          localStorage.getItem("golf_buddy_last_sync") ||
          new Date().toISOString(),
        version: "1.0.0",
        syncType: "background",
      },
    };
  }

  private async sendToCloud(data: any): Promise<boolean> {
    const syncBaseUrl =
      process.env.NEXT_PUBLIC_SYNC_ENDPOINT || "http://localhost:8000/api";

    try {
      // Use the new cursor-based sync API
      // Step 1: Check sync state
      const cursors = this.getCursors();
      const stateResponse = await fetch(`${syncBaseUrl}/sync/state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursors }),
      });

      if (!stateResponse.ok) {
        throw new Error(
          `HTTP ${stateResponse.status}: ${stateResponse.statusText}`
        );
      }

      const syncState = await stateResponse.json();

      if (syncState.inSync) {
        console.log("Data is already in sync");
        return true;
      }

      // Step 2: Push changes
      const pushResponse = await fetch(`${syncBaseUrl}/sync/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!pushResponse.ok) {
        throw new Error(
          `HTTP ${pushResponse.status}: ${pushResponse.statusText}`
        );
      }

      const pushResult = await pushResponse.json();
      this.setCursors(pushResult.serverCursors);

      // Step 3: Pull changes
      const pullResponse = await fetch(`${syncBaseUrl}/sync/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursors: pushResult.serverCursors, limit: 100 }),
      });

      if (!pullResponse.ok) {
        throw new Error(
          `HTTP ${pullResponse.status}: ${pullResponse.statusText}`
        );
      }

      const pullResult = await pullResponse.json();
      await this.applyChanges(pullResult.changes);
      this.setCursors(pullResult.serverCursors);

      return true;
    } catch (error) {
      console.error("Failed to sync with cloud:", error);
      return false;
    }
  }

  private getCursors(): any {
    const cursors = localStorage.getItem("golf_buddy_sync_cursors");
    return cursors ? JSON.parse(cursors) : {};
  }

  private setCursors(cursors: any) {
    localStorage.setItem("golf_buddy_sync_cursors", JSON.stringify(cursors));
  }

  private async applyChanges(changes: any): Promise<void> {
    // Import dynamically to avoid SSR issues
    const { db } = await import("./db");

    if (changes.courses?.length > 0 && db) {
      await db.courses.bulkPut(changes.courses);
    }

    if (changes.games?.length > 0 && db) {
      await db.games.bulkPut(changes.games);
    }

    if (changes.scores?.length > 0 && db) {
      await db.scores.bulkPut(changes.scores);
    }
  }

  // Public API for manual sync trigger
  async triggerSync(): Promise<void> {
    await this.performBackgroundSync();
  }

  // Cleanup
  destroy() {
    // Cleanup logic if needed
  }
}

// Initialize background sync service only in browser environment
if (typeof window !== "undefined") {
  // Initialize after a delay to avoid blocking app startup
  setTimeout(() => {
    new BackgroundSyncService();
  }, 5000); // 5 second delay
}
