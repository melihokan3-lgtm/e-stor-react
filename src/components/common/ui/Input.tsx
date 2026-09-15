import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export default function Input({ invalid = false, className = "", ...props }: InputProps) {
  const stateClass = invalid ? "border-red-500 focus:border-red-500" : "focus:border-brand";
  return (
    <input
      className={`min-w-0 outline-none transition-colors ${stateClass} ${className}`.trim()}
      {...props}
    />
  );
}
