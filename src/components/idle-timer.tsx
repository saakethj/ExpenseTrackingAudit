"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const IDLE_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export function IdleTimer() {
  const router = useRouter();

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    async function handleTimeout() {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login?reason=timeout");
    }

    function reset() {
      clearTimeout(timer);
      timer = setTimeout(() => void handleTimeout(), IDLE_MS);
    }

    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [router]);

  return null;
}
