export default function StatusBar({ isConnected, sessionId }) {
  return (
    <div className={`status-bar ${isConnected ? "connected" : "disconnected"}`}>
      <span className="status-dot" />
      <span className="status-text">
        {isConnected ? "Connected" : "Disconnected"}
      </span>
      {sessionId && (
        <span className="session-id">Session: {sessionId.slice(0, 8)}</span>
      )}
    </div>
  );
}
