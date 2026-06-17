ROLES = {
    "cs": {
        "label": "Chief Secretary",
        "allowed_tools": [
            "get_schedule",
            "get_scheme_status",
            "get_alerts",
            "get_pending_files",
            "get_officer_profile",
            "submit_for_approval",
            "search_knowledge_base",
            "send_briefing_email",
        ],
    },
    "ps": {
        "label": "Principal Secretary",
        "allowed_tools": [
            "get_schedule",
            "get_scheme_status",
            "get_alerts",
            "get_pending_files",
            "get_officer_profile",
            "submit_for_approval",
            "search_knowledge_base",
            "send_briefing_email",
        ],
    },
    "support_cell": {
        "label": "Support Cell",
        "allowed_tools": [
            "get_schedule",
            "get_scheme_status",
            "get_alerts",
            "search_knowledge_base",
        ],
    },
}


def get_allowed_tools(role: str) -> list[str]:
    return ROLES.get(role, ROLES["support_cell"])["allowed_tools"]
