"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SerLogo } from "@/components/AppShell";
import { useSer } from "@/lib/store";

/**
 * Sign in — Elsevier-style, demo-friendly.
 * One card: email + password (both prefilled with demo credentials),
 * a mock "Continue with Google", and a register toggle that only adds a name.
 * Any credentials work; nothing is sent anywhere.
 */

function nameFromEmail(email: string): string {
  const raw = email.split("@")[0].replace(/[._\-0-9]+/g, " ").trim() || "Demo";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function SignInPage() {
  const { state } = useSer();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@ser.app");
  const [password, setPassword] = useState("demo1234");
  const [hint, setHint] = useState("");

  // Already signed in → straight to the dashboard.
  useEffect(() => {
    if (state.currentUser) router.replace("/dashboard");
  }, [state.currentUser, router]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (mode === "register" && name.trim().length < 2) {
      setHint("Please tell us your name 🌷");
      return;
    }
    if (!email.trim().includes("@")) {
      setHint("That email doesn't look right — anything with @ works in the demo.");
      return;
    }
    if (password.trim().length < 4) {
      setHint("Password needs 4+ characters — any characters will do.");
      return;
    }
    setHint("");
    const displayName = mode === "register" ? name.trim() : nameFromEmail(email);
    router.push(`/welcome?name=${encodeURIComponent(displayName)}&email=${encodeURIComponent(email.trim())}`);
  };

  const google = () => {
    setHint("");
    router.push(`/welcome?name=${encodeURIComponent("Demo Student")}&email=${encodeURIComponent("demo@ser.app")}`);
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="fade-up w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <SerLogo />
          <p className="script text-[17px]">Study with real people, not just a timer.</p>
        </div>

        <div className="glass-strong pearl-edge p-7 sm:p-8">
          <h1 className="font-display text-[1.7rem] font-semibold">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-soft">
            {mode === "signin"
              ? "Welcome back — the desk is warm, someone is waiting."
              : "One quick account, then one screen about how you study."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            {mode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-ink-faint">Name</span>
                <input className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-ink-faint">Email</span>
              <input
                className="field"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={mode === "signin"}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                Password
                <button
                  type="button"
                  className="text-[11px] font-semibold normal-case text-aqua-deep hover:underline"
                  onClick={() => setHint("Demo tip: any email + any password (4+ characters) works 😊")}
                >
                  Forgot password?
                </button>
              </span>
              <input
                className="field"
                type="password"
                placeholder="Any 4+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {hint && (
              <p className="fade-up rounded-2xl bg-rose-soft/80 px-4 py-2.5 text-[12.5px] font-semibold text-rose-500">
                {hint}
              </p>
            )}

            <button type="submit" className="btn btn-primary sheen w-full px-6 py-3.5 text-[15px]">
              {mode === "signin" ? "Sign in" : "Create account"} →
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            <span className="h-px flex-1 bg-white/80" />
            or
            <span className="h-px flex-1 bg-white/80" />
          </div>

          <button
            type="button"
            onClick={google}
            className="btn btn-soft w-full gap-3 px-6 py-3 text-[14px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1l-3.9 3C3.1 21.3 7.2 24 12 24z" />
              <path fill="#FBBC05" d="M5 14.3c-.3-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3l-3.9-3C.4 8.3 0 10.1 0 12s.4 3.7 1.1 5.3l3.9-3z" />
              <path fill="#EA4335" d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.3-3.2C18 1.6 15.2 0 12 0 7.2 0 3.1 2.7 1.1 6.7l3.9 3c1-2.9 3.8-5 7-5z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-[13px] text-ink-soft">
            {mode === "signin" ? "New to Ser? " : "Already have an account? "}
            <button
              type="button"
              className="font-bold text-aqua-deep hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "register" : "signin");
                setHint("");
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/85 bg-white/60 px-3.5 py-1.5 text-[12px] font-bold text-ink-soft backdrop-blur">
            🧪 Demo mode — prefilled credentials, any input works
          </span>
          <p className="script text-[15px]">Real people. Real focus. Better you. ✦</p>
        </div>
      </div>
    </div>
  );
}
