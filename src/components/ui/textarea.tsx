"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 placeholder:text-sand-400 focus:border-cian-500 focus:outline-none focus:ring-2 focus:ring-cian-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
