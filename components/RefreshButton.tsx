"use client";

import { useState } from "react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function RefreshButton({
  onRefresh,
  className = "",
  size = "md",
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`
        ${sizeClasses[size]}
        bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300
        text-white rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        ${className}
      `}
      title="Refresh app data"
    >
      {isRefreshing ? (
        <div className="animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <span>🔄</span>
      )}
    </button>
  );
}
