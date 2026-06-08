import json
import time
from config import AUDIT_LOG_PATH


def log_event(event_type: str, role: str, session_id: str, data: dict):
    entry = {
        "timestamp": time.time(),
        "event_type": event_type,
        "role": role,
        "session_id": session_id,
        "data": data,
    }
    with open(AUDIT_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
