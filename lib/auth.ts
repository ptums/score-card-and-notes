import { jwtDecode } from "jwt-decode";
import { userDB } from "./user-db";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthToken {
  user: User;
  exp: number;
  iat: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Local storage keys
const TOKEN_KEY = "golf_buddy_auth_token";
const USER_KEY = "golf_buddy_user";

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);

      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      }
    } catch (error) {
      console.error("Error loading auth from storage:", error);
      this.clearAuth();
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;

    try {
      if (this.token && this.user) {
        localStorage.setItem(TOKEN_KEY, this.token);
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
      } else {
        this.clearStorage();
      }
    } catch (error) {
      console.error("Error saving auth to storage:", error);
    }
  }

  private clearStorage() {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  private generateToken(user: User): string {
    // Simple token generation for demo purposes
    // In production, you'd want proper JWT signing
    const payload = {
      user,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      iat: Math.floor(Date.now() / 1000),
    };

    return btoa(JSON.stringify(payload));
  }

  private validateToken(token: string): boolean {
    try {
      const decoded = jwtDecode<AuthToken>(token);
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp < now) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    try {
      // Authenticate user with real database
      const dbUser = await userDB.authenticateUser(credentials);

      // Convert DB user to auth user format
      const authUser: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        createdAt: dbUser.createdAt,
        lastLoginAt: dbUser.lastLoginAt,
      };

      const token = this.generateToken(authUser);

      this.token = token;
      this.user = authUser;
      this.saveToStorage();

      return { user: authUser, token };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }

  async register(
    credentials: RegisterCredentials
  ): Promise<{ user: User; token: string }> {
    try {
      // Create user in real database
      const dbUser = await userDB.createUser({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });

      // Convert DB user to auth user format
      const authUser: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        createdAt: dbUser.createdAt,
        lastLoginAt: dbUser.lastLoginAt,
      };

      const token = this.generateToken(authUser);

      this.token = token;
      this.user = authUser;
      this.saveToStorage();

      return { user: authUser, token };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    this.clearStorage();
  }

  isAuthenticated(): boolean {
    if (!this.token || !this.user) {
      return false;
    }

    return this.validateToken(this.token);
  }

  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return this.user;
  }

  getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return this.token;
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    this.clearStorage();
  }

  // Refresh token if needed
  refreshToken(): boolean {
    if (!this.token) {
      return false;
    }

    if (this.validateToken(this.token)) {
      return true;
    }

    this.clearAuth();
    return false;
  }

  // Check if database has any users
  async hasUsers(): Promise<boolean> {
    try {
      const count = await userDB.getUserCount();
      return count > 0;
    } catch (error) {
      console.error("Error checking user count:", error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Utility functions
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    return false;
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};
