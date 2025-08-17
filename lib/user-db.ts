import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

interface UserDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: {
      "by-email": string;
    };
  };
}

class UserDatabase {
  private db: IDBPDatabase<UserDB> | null = null;
  private readonly DB_NAME = "GolfBuddyUsers";
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<UserDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create users store
          const userStore = db.createObjectStore("users", { keyPath: "id" });

          // Create email index for fast lookups
          userStore.createIndex("by-email", "email", { unique: true });
        },
      });
    } catch (error) {
      console.error("Failed to initialize user database:", error);
      throw new Error("User database initialization failed");
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<UserDB>> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  // Simple password hashing (in production, use proper crypto)
  private async hashPassword(password: string): Promise<string> {
    // Use Web Crypto API for proper hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "golf-buddy-salt-2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const computedHash = await this.hashPassword(password);
    return computedHash === hash;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const db = await this.ensureDB();

    // Check if user already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate input
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error("All fields are required");
    }

    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    if (!this.isValidEmail(userData.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: await this.hashPassword(userData.password),
      name: userData.name.trim(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    try {
      await db.add("users", newUser);
      return newUser;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw new Error("Failed to create user account");
    }
  }

  async authenticateUser(credentials: UserCredentials): Promise<User> {
    const db = await this.ensureDB();

    const user = await this.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isValidPassword = await this.verifyPassword(
      credentials.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Update last login time
    const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
    await db.put("users", updatedUser);

    return updatedUser;
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await this.ensureDB();

    try {
      return (await db.get("users", id)) || null;
    } catch (error) {
      console.error("Failed to get user by ID:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.ensureDB();

    try {
      const emailIndex = db.transaction("users").store.index("by-email");
      return (await emailIndex.get(email.toLowerCase().trim())) || null;
    } catch (error) {
      console.error("Failed to get user by email:", error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const db = await this.ensureDB();

    const user = await this.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = { ...user, ...updates };

    try {
      await db.put("users", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw new Error("Failed to update user");
    }
  }

  async deactivateUser(id: string): Promise<void> {
    await this.updateUser(id, { isActive: false });
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.ensureDB();

    try {
      await db.delete("users", id);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw new Error("Failed to delete user");
    }
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.ensureDB();

    try {
      return await db.getAll("users");
    } catch (error) {
      console.error("Failed to get all users:", error);
      return [];
    }
  }

  async getUserCount(): Promise<number> {
    const db = await this.ensureDB();

    try {
      return await db.count("users");
    } catch (error) {
      console.error("Failed to get user count:", error);
      return 0;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Database maintenance
  async clearDatabase(): Promise<void> {
    const db = await this.ensureDB();

    try {
      await db.clear("users");
    } catch (error) {
      console.error("Failed to clear database:", error);
      throw new Error("Failed to clear database");
    }
  }

  async exportUsers(): Promise<User[]> {
    return await this.getAllUsers();
  }

  async importUsers(users: User[]): Promise<void> {
    const db = await this.ensureDB();

    try {
      const tx = db.transaction("users", "readwrite");

      for (const user of users) {
        await tx.store.put(user);
      }

      await tx.done;
    } catch (error) {
      console.error("Failed to import users:", error);
      throw new Error("Failed to import users");
    }
  }
}

// Export singleton instance
export const userDB = new UserDatabase();

// Initialize database when module is imported
userDB.init().catch(console.error);
