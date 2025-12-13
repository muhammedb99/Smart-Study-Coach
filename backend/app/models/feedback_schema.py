from pydantic import BaseModel

class ExerciseFeedback(BaseModel):
    question: str
    difficulty: str
    success: bool
