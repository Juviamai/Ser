"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { Avatar, Modal, RepPill, StarPicker, VerifiedBadge } from "@/components/ui";
import { fmtClock, shortName } from "@/lib/format";
import { useSer } from "@/lib/store";

/**
 * Study Room — you and one partner, a shared timer, and focus status.
 * Camera is real (getUserMedia) when allowed; if it isn't, the room falls
 * back to calm avatar tiles — camera-off is always a first-class choice.
 * The partner is simulated for the prototype: they mostly stay focused.
 */

type MyStatus = "focus" | "pause" | "question";

const PARTNER_STATES = [
  { label: "Focused", emoji: "🌊", tone: "text-aqua-deep bg-aqua-soft/80" },
  { label: "Focused", emoji: "🌊", tone: "text-aqua-deep bg-aqua-soft/80" },
  { label: "Deep focus", emoji: "🎧", tone: "text-aqua-deep bg-aqua-soft/80" },
  { label: "Focused", emoji: "🌊", tone: "text-aqua-deep bg-aqua-soft/80" },
  { label: "Stretching (2 min)", emoji: "🧘", tone: "text-ink-soft bg-white/70" },
  { label: "Solving out loud", emoji: "✏️", tone: "text-ink-soft bg-white/70" },
];

export default function StudyRoomPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="glass m-6 p-10 text-center text-sm text-ink-soft">Opening your study room…</div>}>
        <StudyRoom />
      </Suspense>
    </AppShell>
  );
}

function StudyRoom() {
  const { state, actions } = useSer();
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("s");

  const session = useMemo(
    () => state.sessions.find((x) => x.id === sessionId),
    [state.sessions, sessionId]
  );
  const partner = useMemo(() => {
    const pid = session?.participants.find((p) => p !== "me");
    return state.users.find((u) => u.id === pid) ?? null;
  }, [session, state.users]);

  const totalSecs = (session?.plannedMinutes ?? 50) * 60;
  const [remaining, setRemaining] = useState(totalSecs);
  const [running, setRunning] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [note, setNote] = useState("");

  // camera state
  const [camOn, setCamOn] = useState(state.settings.cameraDefaultOn);
  const [camError, setCamError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [myStatus, setMyStatus] = useState<MyStatus>("focus");
  const [partnerState, setPartnerState] = useState(PARTNER_STATES[0]);

  // shared timer
  useEffect(() => {
    if (!running || ratingOpen) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setRatingOpen(true); // time's up — rate your partner
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, ratingOpen]);

  // partner presence simulation — steady focus with human wobbles
  useEffect(() => {
    const t = setInterval(() => {
      setPartnerState(PARTNER_STATES[Math.floor(Math.random() * PARTNER_STATES.length)]);
    }, 17000);
    return () => clearInterval(t);
  }, []);

  // real camera with graceful fallback to avatar tile
  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (camOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (cancelled) {
            stream.getTracks().forEach((tr) => tr.stop());
            return;
          }
          streamRef.current = stream;
          setCamError(false);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
          setCamOn(false);
          setCamError(true);
        }
      } else {
        stopCam();
        setCamError(false);
      }
    })();
    return () => {
      cancelled = true;
      stopCam();
    };
  }, [camOn, stopCam]);

  if (!session || !partner) {
    return (
      <div className="glass m-2 p-10 text-center">
        <p className="text-sm text-ink-soft">This room has ended.</p>
        <button className="btn btn-primary mt-4 px-6 py-2.5 text-sm" onClick={() => router.push("/dashboard")}>
          Back home
        </button>
      </div>
    );
  }

  const submitRating = () => {
    if (stars < 1) return;
    actions.endAndRateSession(session.id, stars as 1 | 2 | 3 | 4 | 5, note.trim() || undefined);
    actions.showToast("Thank you! Your rating shapes their Study Reputation ⭐");
    setRatingOpen(false);
    router.push("/dashboard");
  };

  const progress = 1 - remaining / totalSecs;

  return (
    <div className="space-y-5">
      {/* header + timer */}
      <div className="glass pearl-edge fade-up flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-ink-faint">Study room · {session.subject}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            You & {shortName(partner.name)}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <VerifiedBadge compact />
            <RepPill score={partner.reputation.score} />
          </div>
        </div>

        {/* shared timer ring */}
        <div className="flex items-center gap-4">
          <div
            className="relative flex size-24 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#4fd8c6 ${progress * 360}deg, rgba(255,255,255,.65) 0deg)`,
            }}
          >
            <div className="flex size-[76px] flex-col items-center justify-center rounded-full bg-white/90 backdrop-blur">
              <span className="font-mono text-lg font-bold tabular-nums">{fmtClock(remaining)}</span>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-faint">shared</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="btn btn-soft px-4 py-2 text-[13px]" onClick={() => setRunning((r) => !r)}>
              {running ? "⏸ Pause" : "▶ Resume"}
            </button>
            <button className="btn btn-primary px-4 py-2 text-[13px]" onClick={() => setRatingOpen(true)}>
              End & rate
            </button>
          </div>
        </div>
      </div>

      {/* video panels */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* me */}
        <div className="glass pearl-edge fade-up overflow-hidden" style={{ animationDelay: "60ms" }}>
          <div className="relative aspect-[4/3] bg-gradient-to-br from-aqua-soft/70 via-white/50 to-blush/50">
            {camOn && !camError ? (
              <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3">
                <Avatar name={state.currentUser!.name} seed={state.currentUser!.avatarSeed} size={84} />
                <p className="text-[13px] font-semibold text-ink-soft">
                  {camError ? "Camera unavailable — avatar mode" : "Camera off — avatar mode"}
                </p>
              </div>
            )}
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
              <span className="rounded-full bg-ink/35 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">
                You {micOn ? "🎙️" : "🔇"}
              </span>
              <span className={`rounded-full px-3 py-1 text-[12px] font-bold backdrop-blur ${statusStyle(myStatus).tone}`}>
                {statusStyle(myStatus).emoji} {statusStyle(myStatus).label}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3.5">
            <button className={`chip ${camOn ? "chip-on" : ""}`} onClick={() => setCamOn(!camOn)}>
              📷 {camOn ? "Camera on" : "Camera off"}
            </button>
            <button className={`chip ${micOn ? "chip-on" : ""}`} onClick={() => setMicOn(!micOn)}>
              {micOn ? "🎙️ Mic on" : "🔇 Mic muted"}
            </button>
            <span className="mx-1 hidden h-4 w-px bg-white/80 sm:block" />
            {(["focus", "pause", "question"] as MyStatus[]).map((s) => (
              <button key={s} className={`chip ${myStatus === s ? "chip-on" : ""}`} onClick={() => setMyStatus(s)}>
                {statusStyle(s).emoji} {statusStyle(s).label}
              </button>
            ))}
          </div>
        </div>

        {/* partner */}
        <div className="glass pearl-edge fade-up overflow-hidden" style={{ animationDelay: "120ms" }}>
          <div className="relative aspect-[4/3] bg-gradient-to-br from-blush/50 via-white/40 to-lilac/60">
            {/* stylized "video" — a soft study ambience with their avatar */}
            <div className="flex size-full flex-col items-center justify-center gap-3">
              <span className="absolute left-4 top-4 text-xl" title="Their room: library corner">📚 ☕</span>
              <Avatar name={partner.name} seed={partner.avatarSeed} size={84} />
              <p className="text-[13px] font-semibold text-ink-soft">{shortName(partner.name)} · in session</p>
            </div>
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
              <span className="rounded-full bg-ink/35 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">
                {shortName(partner.name)} 🎙️
              </span>
              <span className={`rounded-full px-3 py-1 text-[12px] font-bold backdrop-blur ${partnerState.tone}`}>
                {partnerState.emoji} {partnerState.label}
              </span>
            </div>
            {running && (
              <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider text-aqua-deep backdrop-blur">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> live
              </span>
            )}
          </div>
          <div className="p-3.5 text-[13px] text-ink-soft">
            💬 “{partnerState.label === "Focused" ? "Right there with you — keep going." : "Still here, just switching positions."}”
            <span className="ml-2 text-ink-faint">— leave a note when you rate them</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs italic text-ink-faint">
        You keep each other going — that&apos;s the whole point. 🌷
      </p>

      {/* rating modal */}
      <Modal open={ratingOpen} title="How was studying together?" onClose={() => setRatingOpen(false)}>
        <div className="flex items-center gap-3">
          <Avatar name={partner.name} seed={partner.avatarSeed} size={48} />
          <div>
            <p className="font-extrabold">{shortName(partner.name)}</p>
            <p className="text-xs text-ink-faint">Your rating becomes their Study Reputation</p>
          </div>
        </div>
        <div className="mt-5">
          <StarPicker value={stars} onChange={setStars} />
        </div>
        <textarea
          className="field mt-4 min-h-20 resize-none"
          placeholder="Optional note — “great focus, right on time”"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={140}
        />
        <div className="mt-5 flex gap-2.5">
          <button className="btn btn-soft flex-1 py-3 text-sm" onClick={() => setRatingOpen(false)}>
            Keep studying
          </button>
          <button className="btn btn-primary flex-1 py-3 text-sm" onClick={submitRating} disabled={stars < 1}>
            Submit rating
          </button>
        </div>
      </Modal>
    </div>
  );
}

function statusStyle(s: MyStatus) {
  switch (s) {
    case "focus":
      return { label: "Focused", emoji: "🌊", tone: "text-aqua-deep bg-white/75" };
    case "pause":
      return { label: "Short pause", emoji: "☕", tone: "text-ink-soft bg-white/75" };
    case "question":
      return { label: "Quick question", emoji: "🙋", tone: "text-rose-500 bg-white/75" };
  }
}
