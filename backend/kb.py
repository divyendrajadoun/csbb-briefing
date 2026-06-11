import base64
import fitz  # PyMuPDF
from groq import Groq
from config import GROQ_API_KEY, VISION_MODEL

_groq = Groq(api_key=GROQ_API_KEY)

OCR_PROMPT = (
    "Extract ALL text from this image exactly as written. "
    "The text may be in Hindi, English, or both. "
    "Return only the extracted text, nothing else."
)


def _ocr_image(image_bytes: bytes, mime: str = "image/png") -> str:
    b64 = base64.b64encode(image_bytes).decode()
    resp = _groq.chat.completions.create(
        model=VISION_MODEL,
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": OCR_PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            ],
        }],
    )
    return resp.choices[0].message.content or ""


def _extract_pdf(contents: bytes) -> list[dict]:
    doc = fitz.open(stream=contents, filetype="pdf")
    chunks = []
    for i, page in enumerate(doc, 1):
        text = page.get_text().strip()
        if len(text) < 50:
            # Scanned/handwritten page — render to image and OCR
            pix = page.get_pixmap(dpi=200)
            text = _ocr_image(pix.tobytes("png"), "image/png")
        chunks.append({"page": i, "text": text})
    doc.close()
    return chunks


def extract_text_from_upload(
    filename: str, contents: bytes, content_type: str
) -> list[dict]:
    lower = filename.lower()

    if lower.endswith(".pdf") or content_type == "application/pdf":
        return _extract_pdf(contents)

    if content_type.startswith("image/"):
        text = _ocr_image(contents, content_type)
        return [{"page": 1, "text": text}]

    # Plain text / markdown / other text files
    text = contents.decode("utf-8", errors="replace")
    return [{"page": 1, "text": text}]
