"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-[#FF6B5E] text-white hover:bg-[#ef5d50]",
  secondary: "bg-white text-[#191919] border border-[#E4E1D8] hover:bg-[#F5F3EF]",
  danger: "bg-[#E24B4A] text-white hover:bg-[#c93d3c]",
  ghost: "bg-transparent text-[#8A877D] hover:bg-black/5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-[6px] px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
