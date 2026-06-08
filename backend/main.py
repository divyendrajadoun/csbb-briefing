import json
import uuid
import httpx
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from roles import ROLES
from audit import log_event
from claude_client import process_message
from config import ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID

app = FastAPI(title="CSBB - CS Bihar Voice Bot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store conversation histories per session
sessions: dict[str, list] = {}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "csbb"}


@app.get("/roles")
async def list_roles():
    return {k: v["label"] for k, v in ROLES.items()}


@app.post("/tts")
async def text_to_speech(request: Request):
    body = await request.json()
    text = body.get("text", "")
    if not text:
        return {"error": "No text provided"}

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()

    return StreamingResponse(
        iter([resp.content]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"},
    )


@app.websocket("/ws/{role}")
async def websocket_endpoint(websocket: WebSocket, role: str):
    if role not in ROLES:
        await websocket.close(code=4001, reason="Invalid role")
        return

    await websocket.accept()
    role_label = ROLES[role]["label"]
    session_id = str(uuid.uuid4())

    await websocket.send_json({
        "type": "connected",
        "session_id": session_id,
        "role": role,
        "role_label": role_label,
    })

    # Get or create conversation history for this session
    sessions[session_id] = []

    async def send_callback(event_type: str, data: dict):
        await websocket.send_json({"type": event_type, **data})

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") != "user_message":
                continue

            user_text = msg.get("text", "").strip()
            if not user_text:
                continue

            log_event("user_message", role, session_id, {"text": user_text})

            await websocket.send_json({"type": "thinking"})

            await process_message(
                user_text=user_text,
                role=role,
                role_label=role_label,
                conversation_history=sessions[session_id],
                send_callback=send_callback,
            )

            log_event("assistant_response", role, session_id, {"history_len": len(sessions[session_id])})

    except WebSocketDisconnect:
        log_event("disconnect", role, session_id, {})
        sessions.pop(session_id, None)
    except Exception as e:
        log_event("error", role, session_id, {"error": str(e)})
        await websocket.send_json({"type": "error", "message": str(e)})
        sessions.pop(session_id, None)


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
