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
    <div className="flex flex-col items-center">
      <span
        className="text-3xl sm:text-4xl md:text-5xl font-light tabular-nums"
        style={{ color: "var(--wedding-primary)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1 opacity-60"
        style={{ color: "var(--wedding-text)", fontFamily: "var(--wedding-font-body)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function Countdown({ weddingDate }: CountdownProps) {
  const target = new Date(weddingDate);
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

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
    <div className="flex items-center justify-center gap-4 sm:gap-8 py-8">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <span
        className="text-2xl opacity-30 -mt-4"
        style={{ color: "var(--wedding-primary)" }}
      >
        :
      </span>
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <span
        className="text-2xl opacity-30 -mt-4"
        style={{ color: "var(--wedding-primary)" }}
      >
        :
      </span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span
        className="text-2xl opacity-30 -mt-4"
        style={{ color: "var(--wedding-primary)" }}
      >
        :
      </span>
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  );
}
