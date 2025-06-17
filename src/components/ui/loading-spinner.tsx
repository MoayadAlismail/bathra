import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size],
          className
        )}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};
