"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSer } from "@/lib/store";

/** Entry point — sends you to onboarding or straight to your dashboard. */
export default function Entry() {
  const { state } = useSer();
  const router = useRouter();

  useEffect(() => {
    router.replace(state.currentUser ? "/dashboard" : "/onboarding");
  }, [state.currentUser, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="iridescent-animated size-10 rounded-full pulse-glow" />
    </div>
  );
}
