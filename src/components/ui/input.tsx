"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 placeholder:text-sand-400 focus:border-cian-500 focus:outline-none focus:ring-2 focus:ring-cian-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
