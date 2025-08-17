"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoginCredentials, RegisterCredentials } from "@/lib/auth";

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState<
    LoginCredentials | RegisterCredentials
  >({
    email: "",
    password: "",
    ...(isLogin ? {} : { name: "" }),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      if (isLogin) {
        await login(credentials as LoginCredentials);
      } else {
        await register(credentials as RegisterCredentials);
      }
      router.push("/games");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setCredentials({
      email: credentials.email,
      password: "",
      ...(isLogin ? { name: "" } : {}),
    });
    clearError();
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {isLogin ? "Welcome Back" : "Join Golf Buddy"}
          </h1>
          <p className="text-slate-600">
            {isLogin
              ? "Sign in to continue tracking your golf game"
              : "Create an account to start your golf journey"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={(credentials as RegisterCredentials).name || ""}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* First Time User Info */}
          {!isLogin && (
            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-2">
                <strong>Welcome to Golf Buddy!</strong>
              </p>
              <p className="text-xs text-amber-700">
                Create your account to start tracking your golf games and
                improving your swing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
