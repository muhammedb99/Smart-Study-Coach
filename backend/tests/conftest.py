import sys
import os
import pytest
from fastapi.testclient import TestClient

# מוסיף את תיקיית backend ל-PYTHONPATH
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(_file_)))
sys.path.insert(0, BASE_DIR)

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)