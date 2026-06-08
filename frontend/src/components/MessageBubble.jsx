export default function MessageBubble({ message }) {
  if (message.type === "user") {
    return (
      <div className="message user-message">
        <div className="message-content">{message.text}</div>
      </div>
    );
  }

  if (message.type === "assistant") {
    return (
      <div className="message assistant-message">
        <div className="message-content">{message.text}</div>
      </div>
    );
  }

  if (message.type === "tool_call") {
    return (
      <div className="message tool-message">
        <div className="message-content">
          <span className="tool-badge">{message.tool}</span>
          <span className="tool-input">
            {JSON.stringify(message.input)}
          </span>
        </div>
      </div>
    );
  }

  if (message.type === "error") {
    return (
      <div className="message error-message">
        <div className="message-content">{message.text}</div>
      </div>
    );
  }

  return null;
}
