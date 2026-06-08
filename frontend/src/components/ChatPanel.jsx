import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import VoiceButton from "./VoiceButton";

export default function ChatPanel({ messages, isThinking, onSend }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  const handleVoiceResult = (text) => {
    if (text.trim()) {
      onSend(text.trim());
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isThinking && (
          <div className="message assistant-message thinking">
            <div className="message-content">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="input-bar" onSubmit={handleSubmit}>
        <VoiceButton onResult={handleVoiceResult} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message or use mic..."
          className="text-input"
        />
        <button type="submit" className="send-btn">
          Send
        </button>
      </form>
    </div>
  );
}
