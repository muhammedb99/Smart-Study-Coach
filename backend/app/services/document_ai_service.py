from app.services.openai_document_service import summarize_with_openai

def summarize_document(text: str) -> dict:
    result = summarize_with_openai(text)

    return {
        "summary": result.get("summary", ""),
        "key_points": result.get("key_points", []),
        "practice_questions": result.get("practice_questions", []),
        "provider": "openai"
    }