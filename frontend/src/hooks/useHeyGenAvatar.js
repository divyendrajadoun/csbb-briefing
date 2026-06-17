import { useState, useRef, useCallback } from "react";
import { LiveAvatarSession, SessionEvent } from "@heygen/liveavatar-web-sdk";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function useHeyGenAvatar() {
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const sessionRef = useRef(null);
  const readyRef = useRef(false);

  const initAvatar = useCallback(async (videoEl) => {
    if (sessionRef.current) return; // already initialized
    setAvatarError(null);
    setAvatarReady(false);

    try {
      const res = await fetch(`${API_URL}/heygen/session-token`, { method: "POST" });
      const data = await res.json();
      if (data.error || !data.token) {
        throw new Error(data.error || "No token returned");
      }

      const session = new LiveAvatarSession(data.token, { voiceChat: false });
      sessionRef.current = session;

      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        session.attach(videoEl);
        readyRef.current = true;
        setAvatarReady(true);
      });

      session.on(SessionEvent.SESSION_DISCONNECTED, () => {
        readyRef.current = false;
        setAvatarReady(false);
      });

      await session.start();
    } catch (err) {
      console.error("HeyGen SDK init failed:", err);
      setAvatarError(err.message || "SDK init failed");
      setAvatarReady(false);
    }
  }, []);

  // Use ref for ready check so this callback never changes reference
  // Returns true if avatar handled it, false otherwise
  const speak = useCallback((text) => {
    if (sessionRef.current && readyRef.current && text) {
      sessionRef.current.message(text);
      return true;
    }
    return false;
  }, []);

  const destroyAvatar = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.stop();
      } catch {}
      sessionRef.current = null;
    }
    readyRef.current = false;
    setAvatarReady(false);
    setAvatarError(null);
  }, []);

  return { initAvatar, speak, destroyAvatar, avatarReady, avatarError };
}
