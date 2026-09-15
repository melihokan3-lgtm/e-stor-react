import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "ghost";
}

export default function Button({ tone = "primary", className = "", ...props }: ButtonProps) {
  const toneClass = tone === "primary"
    ? "inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return <button className={`${toneClass} ${className}`.trim()} {...props} />;
}
