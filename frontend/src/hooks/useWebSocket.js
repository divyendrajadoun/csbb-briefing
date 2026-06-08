import { useState, useRef, useCallback, useEffect } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

export default function useWebSocket(role) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_URL}/${role}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "connected":
          setSessionId(data.session_id);
          setMessages([]);
          break;

        case "thinking":
          setIsThinking(true);
          break;

        case "tool_call":
          setMessages((prev) => [
            ...prev,
            { type: "tool_call", tool: data.tool, input: data.input },
          ]);
          break;

        case "message_complete":
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            { type: "assistant", text: data.text },
          ]);
          break;

        case "error":
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            { type: "error", text: data.message },
          ]);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSessionId(null);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  }, [role]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      setMessages((prev) => [...prev, { type: "user", text }]);

      wsRef.current.send(
        JSON.stringify({
          type: "user_message",
          text,
          session_id: sessionId,
        })
      );
    },
    [sessionId]
  );

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { messages, isConnected, isThinking, sessionId, connect, disconnect, sendMessage };
}
