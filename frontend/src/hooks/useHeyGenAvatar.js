import { useState, useRef, useCallback } from "react";
import { LiveAvatarSession, SessionEvent } from "@heygen/liveavatar-web-sdk";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function useHeyGenAvatar() {
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const sessionRef = useRef(null);

  const initAvatar = useCallback(async (videoEl) => {
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
        setAvatarReady(true);
      });

      session.on(SessionEvent.SESSION_DISCONNECTED, () => {
        setAvatarReady(false);
      });

      await session.start();
    } catch (err) {
      console.error("HeyGen SDK init failed:", err);
      setAvatarError(err.message || "SDK init failed");
      setAvatarReady(false);
    }
  }, []);

  const speak = useCallback((text) => {
    if (sessionRef.current && avatarReady && text) {
      sessionRef.current.message(text);
    }
  }, [avatarReady]);

  const destroyAvatar = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.stop();
      } catch {}
      sessionRef.current = null;
    }
    setAvatarReady(false);
    setAvatarError(null);
  }, []);

  return { initAvatar, speak, destroyAvatar, avatarReady, avatarError };
}
