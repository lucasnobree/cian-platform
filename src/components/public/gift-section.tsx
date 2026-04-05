"use client";

import { Gift } from "lucide-react";

interface GiftSectionProps {
  coupleName: string;
}

export function GiftSection({ coupleName }: GiftSectionProps) {
  return (
    <section className="w-full flex items-center justify-center py-16 px-4">
      <div
        className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm"
        style={{
          backgroundColor: "var(--bg-color, #FEFDFB)",
          borderColor: "color-mix(in srgb, var(--primary-color, #0D9488) 20%, transparent)",
        }}
      >
        {/* Decorative icon */}
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: "color-mix(in srgb, var(--primary-color, #0D9488) 10%, transparent)",
          }}
        >
          <Gift
            size={28}
            strokeWidth={1.5}
            style={{ color: "var(--primary-color, #0D9488)" }}
          />
        </div>

        {/* Couple name */}
        <p
          className="text-sm font-medium uppercase tracking-widest mb-3"
          style={{ color: "color-mix(in srgb, var(--primary-color, #0D9488) 70%, #000)" }}
        >
          {coupleName}
        </p>

        {/* Main message */}
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--text-color, #1a1a1a)" }}
        >
          Lista de presentes disponivel em breve
        </h3>

        {/* Subtitle */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: "color-mix(in srgb, var(--text-color, #1a1a1a) 60%, transparent)" }}
        >
          Estamos preparando uma forma especial para voce presentear os noivos.
          Fique de olho!
        </p>

        {/* Decorative dots */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: "var(--primary-color, #0D9488)",
                opacity: 0.3 + i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
