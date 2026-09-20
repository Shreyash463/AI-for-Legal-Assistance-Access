import re
from datetime import datetime, timezone
from pathlib import Path
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health_check_dynamic_timestamp():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "timestamp" in data
    # Parse returned timestamp to verify it is valid ISO 8601
    parsed_time = datetime.fromisoformat(data["timestamp"])
    now_utc = datetime.now(timezone.utc)
    # Check that the timestamp is within 30 seconds of current system time
    diff = abs((now_utc - parsed_time).total_seconds())
    assert diff < 30, f"Timestamp is stale or hardcoded: {data['timestamp']}"

def test_codebase_has_no_hardcoded_comparison_deadlines():
    """Verify that Python backend files do not contain hardcoded deadline comparison logic."""
    backend_dir = Path(__file__).resolve().parent.parent / "backend"
    suspicious_patterns = [
        r"202[0-9]-[0-1][0-9]-[0-3][0-9]",  # e.g. '2024-12-31'
        r"datetime\s*\(\s*202[0-9]",         # e.g. datetime(2024, ...)
        r"deadline\s*=\s*['\"]202",          # e.g. deadline = '202...'
    ]
    for py_file in backend_dir.rglob("*.py"):
        content = py_file.read_text(encoding="utf-8")
        for pat in suspicious_patterns:
            matches = re.findall(pat, content)
            assert len(matches) == 0, f"Found suspicious hardcoded date pattern '{pat}' in {py_file.name}: {matches}"

def test_graceful_date_handling_in_contracts():
    """Verify contracts containing various date formats process smoothly without crashing."""
    sample_text = """
SECTION 1: COMMENCEMENT
This agreement is effective October 1st, 2025 and ends on 12/31/2026.
Another notice required on or before the 15th of each month.
"""
    response = client.post(
        "/api/documents/analyze-text",
        json={"text": sample_text, "filename": "date_test.txt"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["section_count"] >= 1
