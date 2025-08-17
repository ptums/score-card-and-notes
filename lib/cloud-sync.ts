/* eslint-disable @typescript-eslint/no-explicit-any */
import { profileDB } from "./profile-db";
import { db } from "./db";

export interface SyncStatus {
  lastSync: string | null;
  isEnabled: boolean;
  isSyncing: boolean;
  lastError: string | null;
  nextSyncTime: string | null;
}

export interface SyncData {
  profiles: any[];
  courses: any[];
  games: any[];
  scores: any[];
  metadata: {
    deviceId: string;
    lastSync: string;
    version: string;
  };
}

class CloudSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SYNC_ENDPOINT =
    process.env.NEXT_PUBLIC_SYNC_ENDPOINT || "https://api.golfbuddy.com/sync";
  private readonly DEVICE_ID_KEY = "golf_buddy_device_id";

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    if (typeof window === "undefined") return;

    // Generate or retrieve device ID
    this.ensureDeviceId();

    // Check if sync is enabled
    if (this.isSyncEnabled()) {
      this.scheduleNextSync();
    }
  }

  private ensureDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  private isSyncEnabled(): boolean {
    return localStorage.getItem("golf_buddy_sync_enabled") === "true";
  }

  private setSyncEnabled(enabled: boolean) {
    localStorage.setItem("golf_buddy_sync_enabled", enabled.toString());
  }

  private getLastSyncTime(): string | null {
    return localStorage.getItem("golf_buddy_last_sync");
  }

  private setLastSyncTime(time: string) {
    localStorage.setItem("golf_buddy_last_sync", time);
  }

  private scheduleNextSync() {
    if (this.syncInterval) {
      clearTimeout(this.syncInterval);
    }

    const lastSync = this.getLastSyncTime();
    const nextSync = lastSync
      ? new Date(new Date(lastSync).getTime() + this.SYNC_INTERVAL_MS)
      : new Date(Date.now() + this.SYNC_INTERVAL_MS);

    const delay = nextSync.getTime() - Date.now();

    this.syncInterval = setTimeout(() => {
      this.performSync();
    }, delay);

    // Store next sync time for UI display
    localStorage.setItem("golf_buddy_next_sync", nextSync.toISOString());
  }

  async performSync(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (!this.isSyncEnabled()) return false;

    try {
      // Set syncing status
      localStorage.setItem("golf_buddy_sync_status", "syncing");

      // Collect all data
      const syncData = await this.collectSyncData();

      // Send to cloud
      const success = await this.sendToCloud(syncData);

      if (success) {
        this.setLastSyncTime(new Date().toISOString());
        localStorage.setItem("golf_buddy_sync_status", "success");
        this.scheduleNextSync();
        return true;
      } else {
        throw new Error("Cloud sync failed");
      }
    } catch (error) {
      console.error("Sync error:", error);
      localStorage.setItem("golf_buddy_sync_status", "error");
      localStorage.setItem(
        "golf_buddy_last_error",
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }

  private async collectSyncData(): Promise<SyncData> {
    const deviceId = this.ensureDeviceId();

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
        lastSync: this.getLastSyncTime() || new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  private async sendToCloud(data: SyncData): Promise<boolean> {
    try {
      const response = await fetch(this.SYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to send data to cloud:", error);
      return false;
    }
  }

  // Public API
  async enableSync(): Promise<void> {
    this.setSyncEnabled(true);
    this.scheduleNextSync();

    // Perform initial sync
    await this.performSync();
  }

  async disableSync(): Promise<void> {
    this.setSyncEnabled(false);
    if (this.syncInterval) {
      clearTimeout(this.syncInterval);
      this.syncInterval = null;
    }
    localStorage.removeItem("golf_buddy_next_sync");
  }

  async forceSync(): Promise<boolean> {
    return this.performSync();
  }

  getSyncStatus(): SyncStatus {
    return {
      lastSync: this.getLastSyncTime(),
      isEnabled: this.isSyncEnabled(),
      isSyncing: localStorage.getItem("golf_buddy_sync_status") === "syncing",
      lastError: localStorage.getItem("golf_buddy_last_error"),
      nextSyncTime: localStorage.getItem("golf_buddy_next_sync"),
    };
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearTimeout(this.syncInterval);
    }
  }
}

// Export singleton instance only in browser environment
export const cloudSync =
  typeof window !== "undefined" ? new CloudSyncService() : null;

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (cloudSync) {
      cloudSync.destroy();
    }
  });
}
