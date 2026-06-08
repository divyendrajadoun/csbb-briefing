import useSpeech from "../hooks/useSpeech";

export default function VoiceButton({ onResult }) {
  const { isListening, transcript, startListening, stopListening } = useSpeech();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(onResult);
    }
  };

  return (
    <button
      type="button"
      className={`voice-btn ${isListening ? "listening" : ""}`}
      onClick={handleClick}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? "⏹" : "🎤"}
      {transcript && <span className="transcript-preview">{transcript}</span>}
    </button>
  );
}
