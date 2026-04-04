"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "ghost" | "link";
  size?: "sm" | "default" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cian-500/40 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-cian-600 text-white hover:bg-cian-700 shadow-sm",
          variant === "secondary" && "border border-sand-300 bg-white text-sand-700 hover:bg-sand-100",
          variant === "destructive" && "bg-red-500 text-white hover:bg-red-600",
          variant === "ghost" && "text-sand-600 hover:bg-sand-100 hover:text-sand-800",
          variant === "link" && "text-cian-600 underline-offset-4 hover:underline",
          size === "sm" && "h-8 px-3 text-xs",
          size === "default" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
