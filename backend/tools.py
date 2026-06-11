import json
from datetime import datetime
from config import DATA_DIR

# --- Load data ---

def _load(name: str):
    with open(DATA_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)


# --- Tool Schemas (OpenAI/Groq format) ---

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_schedule",
            "description": "Get the Chief Secretary's calendar/schedule for a given date or date range. Returns meetings, events, and appointments.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format. Defaults to today if not provided.",
                    },
                    "date_end": {
                        "type": "string",
                        "description": "Optional end date for range query (YYYY-MM-DD).",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_scheme_status",
            "description": "Get status, metrics, and lagging districts for a government scheme. Supported schemes: MGNREGA, PMAY-G, JJM, JEEViKA, PM POSHAN.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scheme_id": {
                        "type": "string",
                        "description": "Scheme identifier: mgnrega, pmay_g, jjm, jeevika, midday_meal",
                    },
                },
                "required": ["scheme_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_alerts",
            "description": "Get current situational alerts sorted by severity. Includes weather, flood, health, SLA breaches, law & order, and infrastructure alerts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "severity": {
                        "type": "string",
                        "description": "Optional filter: critical, high, medium, low",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pending_files",
            "description": "Get files/proposals pending CS approval, with ageing information. Restricted to CS and PS roles.",
            "parameters": {
                "type": "object",
                "properties": {
                    "priority": {
                        "type": "string",
                        "description": "Optional filter: high, medium, low",
                    },
                    "department": {
                        "type": "string",
                        "description": "Optional filter by department name",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_officer_profile",
            "description": "Look up an officer by name, post, or district. Returns service details, contact, and posting history. Restricted to CS and PS roles.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search by officer name, post title, or district name",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "submit_for_approval",
            "description": "Submit an action for human approval (meeting cancellation, MoM draft, broadcast message). The action is HELD and NOT executed until human approval. Restricted to CS and PS roles.",
            "parameters": {
                "type": "object",
                "properties": {
                    "action_type": {
                        "type": "string",
                        "description": "Type of action: meeting_cancellation, mom_draft, broadcast",
                    },
                    "title": {
                        "type": "string",
                        "description": "Short title for the approval item",
                    },
                    "details": {
                        "type": "string",
                        "description": "Full details/content of what needs approval",
                    },
                },
                "required": ["action_type", "title", "details"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search the user's uploaded knowledge base (handwritten notes, PDFs, images, text files). Returns matching text chunks with filename and page number. Use this when the user asks about content they have uploaded.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keywords to find in uploaded documents",
                    },
                },
                "required": ["query"],
            },
        },
    },
]


def get_tool_names():
    """Return list of tool names for role filtering."""
    return [t["function"]["name"] for t in TOOL_SCHEMAS]


# --- Tool Handlers ---

def get_schedule(date: str = None, date_end: str = None) -> dict:
    calendar = _load("calendar.json")
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")

    if date_end:
        results = [day for day in calendar if date <= day["date"] <= date_end]
    else:
        results = [day for day in calendar if day["date"] == date]

    if not results:
        return {"found": False, "message": f"No events found for {date}", "source": "CS Calendar System"}

    return {"found": True, "schedule": results, "source": "CS Calendar System"}


def get_scheme_status(scheme_id: str) -> dict:
    schemes = _load("schemes.json")
    for scheme in schemes:
        if scheme["id"] == scheme_id.lower():
            return {"found": True, "scheme": scheme, "source": f"{scheme['name']} MIS Dashboard"}

    available = [s["id"] for s in schemes]
    return {"found": False, "message": f"Scheme '{scheme_id}' not found. Available: {available}", "source": "Scheme MIS"}


def get_alerts(severity: str = None) -> dict:
    alerts = _load("alerts.json")
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}

    if severity:
        alerts = [a for a in alerts if a["severity"] == severity.lower()]

    alerts.sort(key=lambda a: severity_order.get(a["severity"], 99))
    return {"alerts": alerts, "count": len(alerts), "source": "State Situation Room"}


def get_pending_files(priority: str = None, department: str = None) -> dict:
    files = _load("pending_files.json")

    if priority:
        files = [f for f in files if f["priority"] == priority.lower()]
    if department:
        files = [f for f in files if department.lower() in f["department"].lower()]

    files.sort(key=lambda f: f["age_days"], reverse=True)
    return {"files": files, "count": len(files), "source": "CS File Tracking System"}


def get_officer_profile(query: str) -> dict:
    officers = _load("officers.json")
    query_lower = query.lower()

    results = [
        o for o in officers
        if query_lower in o["name"].lower()
        or query_lower in o["current_post"].lower()
        or (o["district"] and query_lower in o["district"].lower())
    ]

    if not results:
        return {"found": False, "message": f"No officer found matching '{query}'", "source": "HR-MIS"}

    return {"found": True, "officers": results, "source": "HR-MIS, GAD"}


def submit_for_approval(action_type: str, title: str, details: str) -> dict:
    return {
        "status": "HELD_FOR_APPROVAL",
        "message": f"Action '{title}' has been queued for human approval. It will NOT be executed until explicitly approved.",
        "action_type": action_type,
        "title": title,
        "details": details,
        "source": "Workflow Engine",
    }


# --- Knowledge Base ---

# Populated by main.py: session_id -> list of {"filename", "text", "page"}
knowledge_bases: dict[str, list] = {}


def search_knowledge_base(query: str, session_id: str = None) -> dict:
    chunks = knowledge_bases.get(session_id, [])
    if not chunks:
        return {"found": False, "message": "No documents uploaded yet.", "source": "Knowledge Base"}

    keywords = query.lower().split()
    scored = []
    for chunk in chunks:
        text_lower = chunk["text"].lower()
        hits = sum(1 for kw in keywords if kw in text_lower)
        if hits > 0:
            scored.append((hits, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:5]

    if not top:
        return {"found": False, "message": f"No matches for '{query}' in uploaded documents.", "source": "Knowledge Base"}

    results = [
        {"filename": c["filename"], "page": c["page"], "excerpt": c["text"][:500]}
        for _, c in top
    ]
    return {"found": True, "results": results, "source": "Knowledge Base (uploaded docs)"}


# --- Dispatcher ---

TOOL_HANDLERS = {
    "get_schedule": get_schedule,
    "get_scheme_status": get_scheme_status,
    "get_alerts": get_alerts,
    "get_pending_files": get_pending_files,
    "get_officer_profile": get_officer_profile,
    "submit_for_approval": submit_for_approval,
    "search_knowledge_base": search_knowledge_base,
}


def execute_tool(name: str, arguments: dict, session_id: str = None) -> str:
    handler = TOOL_HANDLERS.get(name)
    if not handler:
        return json.dumps({"error": f"Unknown tool: {name}"})
    if name == "search_knowledge_base":
        arguments = {**(arguments or {}), "session_id": session_id}
    result = handler(**(arguments or {}))
    return json.dumps(result, ensure_ascii=False)
