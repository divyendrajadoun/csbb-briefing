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
        ],
    },
    "support_cell": {
        "label": "Support Cell",
        "allowed_tools": [
            "get_schedule",
            "get_scheme_status",
            "get_alerts",
        ],
    },
}


def get_allowed_tools(role: str) -> list[str]:
    return ROLES.get(role, ROLES["support_cell"])["allowed_tools"]
