import { useState, useRef, useCallback } from "react";

export default function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startListening = useCallback((onResult) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);

      if (current.isFinal && onResult) {
        onResult(text);
        setTranscript("");
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const audioRef = useRef(null);
  const unlockedRef = useRef(false);

  // Unlock audio playback on first user interaction
  const unlockAudio = useCallback(() => {
    if (unlockedRef.current) return;
    const silent = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
    silent.play().then(() => { unlockedRef.current = true; }).catch(() => {});
  }, []);

  const speak = useCallback(async (text, sessionId) => {
    if (!text) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, session_id: sessionId || "" }),
      });

      if (!res.ok) throw new Error("TTS request failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch (err) {
      console.error("ElevenLabs TTS error:", err);
    }
  }, []);

  return { isListening, transcript, startListening, stopListening, speak, unlockAudio };
}
