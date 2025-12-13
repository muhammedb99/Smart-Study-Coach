from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExerciseHistoryResponse(BaseModel):
    id: int
    question: str
    difficulty: str

    solution: Optional[str] = None
    success: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
