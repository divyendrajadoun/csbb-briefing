import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY", "")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "briefing@schoolofai.ai")
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
VISION_MODEL = "llama-4-scout-17b-16e-instruct"
MAX_TOKENS = 4096
MAX_UPLOAD_MB = 10

DATA_DIR = Path(__file__).resolve().parent / "data"
AUDIT_LOG_PATH = Path(__file__).resolve().parent / "audit.jsonl"
