from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class ExerciseHistory(Base):
    __tablename__ = "exercise_history"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    solution = Column(String, nullable=True)
    difficulty = Column(String, nullable=False)
    success = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
