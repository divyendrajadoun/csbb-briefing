import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY", "")
MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS = 4096

DATA_DIR = Path(__file__).resolve().parent / "data"
AUDIT_LOG_PATH = Path(__file__).resolve().parent / "audit.jsonl"
