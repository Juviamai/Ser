"use client";

/** Shared UI kit — avatars, stars, badges, modal, toggle. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { initials, seedHue } from "@/lib/format";

/* ─────────────────────────── Avatar (privacy-safe) ──────────────────────── */

export function Avatar({
  name,
  seed,
  size = 44,
  ring = true,
  online = false,
  verified = false,
}: {
  name: string;
  seed?: string;
  size?: number;
  ring?: boolean;
  online?: boolean;
  verified?: boolean;
}) {
  const hue = seedHue(seed ?? name);
  // Deterministic gradient from the seed — same person, same avatar, no photos.
  const c1 = `hsl(${hue} 70% 82%)`;
  const c2 = `hsl(${(hue + 70) % 360} 72% 88%)`;
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={`inline-flex items-center justify-center rounded-full font-bold text-ink/70 ${ring ? "ring-2 ring-white/80" : ""}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.34,
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          boxShadow: "inset 0 1px 2px rgba(255,255,255,.9), 0 3px 10px rgba(46,58,79,.12)",
        }}
        aria-hidden
      >
        {initials(name)}
      </span>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]"
          style={{ width: size * 0.26, height: size * 0.26 }}
        />
      )}
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-1 flex items-center justify-center rounded-full bg-white text-[9px] shadow-sm"
          style={{ width: size * 0.4, height: size * 0.4 }}
          title="Verified student"
        >
          <svg viewBox="0 0 24 24" width={size * 0.3} height={size * 0.3} aria-hidden>
            <circle cx="12" cy="12" r="11" fill="#5b8def" />
            <path d="M6.5 12.5l3.5 3.5 7-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  );
}

/* ───────────────────────────── Stars / ratings ──────────────────────────── */

const STAR_LABELS: Record<number, string> = {
  5: "Focused & on time",
  4: "Mostly focused",
  3: "Okay",
  2: "Distracted",
  1: "Not focused",
};

export function StarsDisplay({
  value,
  size = 14,
}: {
  value: number; // e.g. 4.8
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i + 1));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="text-ink/15" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-amber-400" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6z" />
    </svg>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              size={34}
              className={i <= shown ? "text-amber-400 drop-shadow-[0_2px_6px_rgba(251,191,36,.45)]" : "text-ink/15"}
            />
          </button>
        ))}
      </div>
      <p className="text-sm font-medium text-ink-soft min-h-5">
        {shown ? STAR_LABELS[shown] : "Tap to rate"}
      </p>
    </div>
  );
}

/* ───────────────────────────────── Badges ───────────────────────────────── */

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-white/90 bg-white/60 px-2 py-0.5 text-[11px] font-bold text-aqua-deep backdrop-blur"
      title="Student status verified — real details stay private"
    >
      🎓 {compact ? "Verified" : "Verified Student"}
    </span>
  );
}

export function RepPill({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/90 bg-white/60 px-2 py-0.5 text-[11px] font-bold text-ink-soft backdrop-blur">
      ⭐ {score.toFixed(1)}
    </span>
  );
}

export function DotBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft">
      <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />
      {children}
    </span>
  );
}

/** Soft status pills — green / yellow / blue like the reference. */
export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "yellow" | "blue" | "pink" | "neutral";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    green: "bg-emerald-100/85 text-emerald-700",
    yellow: "bg-amber-100/85 text-amber-700",
    blue: "bg-sky-100/85 text-sky-700",
    pink: "bg-rose-soft text-rose-500",
    neutral: "bg-white/70 text-ink-soft",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Handwritten microcopy used in quiet corners of the layout. */
export function ScriptNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`script text-[17px] leading-tight ${className}`}>{children}</span>;
}

/* ───────────────────────────────── Section ──────────────────────────────── */

export function SectionTitle({
  title,
  action,
  icon,
}: {
  title: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-[15px] font-extrabold uppercase tracking-[0.14em] text-ink-faint">
        {icon && <span className="mr-1.5 not-italic">{icon}</span>}
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ───────────────────────────────── Modal ────────────────────────────────── */

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="glass-strong pearl-edge fade-up relative z-10 w-full max-w-md rounded-[1.75rem] p-6">
        {title && <h3 className="mb-3 font-display text-xl font-semibold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────────── Toggle ───────────────────────────────── */

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-faint">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 ${checked ? "iridescent" : "bg-ink/10"}`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow-md transition-all duration-200 ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </label>
  );
}

/* ───────────────────────────────── Toast ────────────────────────────────── */

export function Toast({ message }: { message: string | null }) {
  const [visible, setVisible] = useState(false);
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (message && message !== lastRef.current) {
      lastRef.current = message;
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2800);
      return () => clearTimeout(t);
    }
    if (!message) lastRef.current = null;
  }, [message]);

  if (!message || !visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-8">
      <div className="glass-strong pearl-edge fade-up rounded-full px-5 py-3 text-sm font-semibold text-ink shadow-xl">
        {message}
      </div>
    </div>
  );
}
