"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  weddingDate: string;
}

function calcTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex flex-col items-center rounded-lg px-3 py-3 sm:px-5 sm:py-4"
      style={{
        backgroundColor: "var(--wedding-secondary)",
        border: "1px solid var(--wedding-accent)",
        borderColor: `color-mix(in srgb, var(--wedding-accent) 25%, transparent)`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <span
        className="text-3xl sm:text-4xl md:text-5xl font-semibold tabular-nums"
        style={{
          color: "var(--wedding-primary)",
          fontFamily: "var(--wedding-font-heading)",
          lineHeight: 1.1,
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1.5 opacity-50"
        style={{ color: "var(--wedding-text)", fontFamily: "var(--wedding-font-body)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function Countdown({ weddingDate }: CountdownProps) {
  const target = new Date(weddingDate);
  const isValidDate = !isNaN(target.getTime());
  const [timeLeft, setTimeLeft] = useState(isValidDate ? calcTimeLeft(target) : null);

  useEffect(() => {
    if (!isValidDate) return;
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  if (!isValidDate || !timeLeft) {
    return (
      <div className="text-center py-8">
        <p
          className="text-lg opacity-60"
          style={{
            fontFamily: "var(--wedding-font-body)",
            color: "var(--wedding-text)",
          }}
        >
          Em breve mais informações sobre a data.
        </p>
      </div>
    );
  }

  if (timeLeft.expired) {
    return (
      <div className="text-center py-8">
        <p
          className="text-2xl sm:text-3xl"
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: "var(--wedding-primary)",
          }}
        >
          O grande dia chegou!
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 py-8">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <div className="flex flex-col gap-1.5 -mt-3 opacity-25">
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--wedding-primary)" }}
        />
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--wedding-primary)" }}
        />
      </div>
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <div className="flex flex-col gap-1.5 -mt-3 opacity-25">
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--wedding-primary)" }}
        />
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--wedding-primary)" }}
        />
      </div>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <div className="flex flex-col gap-1.5 -mt-3 opacity-25">
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--wedding-primary)" }}
        />
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--wedding-primary)" }}
        />
      </div>
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  );
}
