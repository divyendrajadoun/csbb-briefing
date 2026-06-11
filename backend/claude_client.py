import json
from groq import Groq
from config import GROQ_API_KEY, MODEL, MAX_TOKENS
from tools import TOOL_SCHEMAS, execute_tool, knowledge_bases
from roles import get_allowed_tools
from system_prompt import get_system_prompt


client = Groq(api_key=GROQ_API_KEY)


async def process_message(
    user_text: str,
    role: str,
    role_label: str,
    conversation_history: list,
    send_callback,
    session_id: str = None,
    groq_api_key_override: str = None,
):
    """
    Process a user message through Groq with tool use.
    send_callback(event_type, data) is called to send results back.
    """
    groq_client = Groq(api_key=groq_api_key_override) if groq_api_key_override else client

    allowed = get_allowed_tools(role)
    tools = [t for t in TOOL_SCHEMAS if t["function"]["name"] in allowed]
    kb_count = len(knowledge_bases.get(session_id, []))
    system = get_system_prompt(role, role_label, kb_count=kb_count)

    conversation_history.append({"role": "user", "content": user_text})

    # Build messages with system prompt
    messages = [{"role": "system", "content": system}] + conversation_history

    # Tool-use loop
    max_retries = 2
    while True:
        for attempt in range(max_retries + 1):
            try:
                response = groq_client.chat.completions.create(
                    model=MODEL,
                    max_tokens=MAX_TOKENS,
                    tools=tools if tools else None,
                    tool_choice="auto" if tools else None,
                    messages=messages,
                )
                break
            except Exception as e:
                if "tool_use_failed" in str(e) and attempt < max_retries:
                    continue
                if "tool_use_failed" in str(e):
                    # Fall back to no tools
                    response = groq_client.chat.completions.create(
                        model=MODEL,
                        max_tokens=MAX_TOKENS,
                        messages=messages,
                    )
                    break
                raise

        choice = response.choices[0]
        assistant_msg = choice.message

        # Build the assistant message dict for history
        msg_dict = {"role": "assistant", "content": assistant_msg.content or ""}
        if assistant_msg.tool_calls:
            msg_dict["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in assistant_msg.tool_calls
            ]

        conversation_history.append(msg_dict)
        messages.append(msg_dict)

        # If no tool calls, send the final text
        if not assistant_msg.tool_calls:
            await send_callback("message_complete", {"text": assistant_msg.content or ""})
            return

        # Execute each tool call
        for tc in assistant_msg.tool_calls:
            func_name = tc.function.name
            func_args = json.loads(tc.function.arguments)

            await send_callback("tool_call", {
                "tool": func_name,
                "input": func_args,
            })

            result_str = execute_tool(func_name, func_args, session_id=session_id)

            tool_msg = {
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result_str,
            }
            conversation_history.append(tool_msg)
            messages.append(tool_msg)

        # Loop continues — model will process tool results
