"use client";
import { LogOut } from "lucide-react";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = "Dashboard" }: TopbarProps) {
  return (
    <header className="h-16 border-b border-sand-200 bg-white flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-sand-800" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cian-600 flex items-center justify-center text-white text-xs font-semibold">
            CA
          </div>
          <span className="text-sm text-sand-600 hidden sm:block">Admin</span>
        </div>
        <button className="text-sand-400 hover:text-sand-600 transition-colors p-1.5 rounded-lg hover:bg-sand-100">
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
