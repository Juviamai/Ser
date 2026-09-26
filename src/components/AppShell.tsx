"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSer } from "@/lib/store";
import Backdrop from "./Backdrop";
import { Avatar, ScriptNote, Toast } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/find-buddy", label: "Find a Study Buddy", icon: "👥" },
  { href: "/meet-irl", label: "Meet IRL", icon: "🏫" },
  { href: "/guardian", label: "AI Guardian", icon: "🤖" },
  { href: "/profile#history", label: "My Sessions", icon: "🗓️", match: "/profile" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/find-buddy", "/meet-irl", "/guardian", "/profile"].includes(n.href)
);

export function SerLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="iridescent-animated inline-flex size-8 items-center justify-center rounded-[0.9rem] text-sm font-black text-white shadow-[0_4px_16px_rgba(63,158,186,.4)]"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,.18)" }}
      >
        S
      </span>
      {!compact && (
        <span className="font-display text-[1.4rem] font-semibold tracking-tight">
          Ser <span className="text-iridescent">✦</span>
        </span>
      )}
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { state, actions } = useSer();
  const pathname = usePathname();
  const router = useRouter();
  const me = state.currentUser;
  const unread = state.conversations.reduce((n, c) => n + c.unread, 0);

  // Gate: every screen except onboarding requires a profile.
  useEffect(() => {
    if (!me && pathname !== "/onboarding") router.replace("/onboarding");
  }, [me, pathname, router]);

  return (
    <div className="relative min-h-dvh">
      <Backdrop />

      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/45 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="transition-transform hover:scale-[1.02]">
            <SerLogo />
          </Link>

          <div className="flex items-center gap-2.5">
            {me && (
              <span className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[13px] font-bold text-ink-soft backdrop-blur sm:inline-flex">
                🔥 {me.streak}-day streak
              </span>
            )}
            <Link
              href="/messages"
              className="relative inline-flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/60 text-lg backdrop-blur transition hover:bg-white/90"
              aria-label="Messages"
            >
              💬
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-rose text-[10px] font-black text-white shadow">
                  {unread}
                </span>
              )}
            </Link>
            <Link href="/profile" aria-label="Profile">
              <Avatar name={me?.name ?? "You"} seed={me?.avatarSeed} size={40} verified={me?.verifiedStudent} />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-[1440px] gap-6 px-4 pt-6 sm:px-6">
        {/* desktop sidebar */}
        <aside className="sticky top-24 hidden h-fit w-60 shrink-0 lg:block">
          <nav className="glass pearl-edge flex flex-col gap-1 p-4">
            <p className="script mb-2 px-2 text-[16px] leading-snug">
              Study with real people,
              <br />
              not just a timer.
            </p>
            {NAV.map((item) => {
              const active = pathname.startsWith(item.match ?? item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-semibold transition-all ${
                    active
                      ? "bg-white/90 text-aqua-deep shadow-[0_4px_18px_rgba(66,90,160,.12)] ring-1 ring-white"
                      : "text-ink-soft hover:bg-white/65 hover:text-ink"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.label === "Messages" && unread > 0 && (
                    <span className="ml-auto rounded-full bg-rose px-1.5 py-0.5 text-[10px] font-black text-white">{unread}</span>
                  )}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-white/60 pt-3 text-center">
              <ScriptNote className="text-[19px]">Better Together ✦</ScriptNote>
            </div>
          </nav>
        </aside>

        {/* page content */}
        <main className="min-w-0 flex-1 pb-28 lg:pb-12">
          {me ? (
            children
          ) : (
            <div className="glass pearl-edge flex flex-col items-center gap-4 p-12 text-center">
              <span className="iridescent-animated size-10 rounded-full pulse-glow" />
              <p className="text-sm text-ink-soft">Taking you to onboarding…</p>
            </div>
          )}
        </main>
      </div>

      {/* mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/70 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur-xl lg:hidden">
        <div className="flex justify-around">
          {MOBILE_NAV.map((item) => {
            const active = pathname.startsWith(item.match ?? item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10.5px] font-bold transition-all ${
                  active ? "text-aqua-deep" : "text-ink-faint"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full text-lg transition-all ${
                    active ? "iridescent scale-105 shadow-[0_4px_14px_rgba(63,158,186,.4)]" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {item.label.split(" ").slice(-1)}
              </Link>
            );
          })}
        </div>
      </nav>

      <Toast message={actions.toast} />
    </div>
  );
}
