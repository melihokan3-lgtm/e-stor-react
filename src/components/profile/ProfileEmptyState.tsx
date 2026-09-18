import type { ReactNode } from "react";

interface ProfileEmptyStateProps {
  children: ReactNode;
  compact?: boolean;
  largeRadius?: boolean;
  className?: string;
}

export default function ProfileEmptyState({ children, compact = false, largeRadius = false, className = "" }: ProfileEmptyStateProps) {
  return (
    <div className={`${largeRadius ? "rounded-[20px]" : "rounded-2xl"} border border-dashed border-[#ddd] ${compact ? "p-8" : "p-10"} text-center ${className}`}>
      {children}
    </div>
  );
}
