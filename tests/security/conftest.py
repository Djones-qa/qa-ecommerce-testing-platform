"""
Security test configuration and shared fixtures.

UI target:  https://www.saucedemo.com  (login/auth bypass tests)
API target: https://jsonplaceholder.typicode.com  (IDOR, XSS, injection tests)
"""
import pytest
import requests

BASE_URL = "https://www.saucedemo.com"
API_BASE_URL = "https://fakestoreapi.com"   # kept for reference; tests use JSON_API_URL
JSON_API_URL = "https://jsonplaceholder.typicode.com"

XSS_PAYLOADS = [
    "<script>alert('xss')</script>",
    "javascript:alert(1)",
    "<img src=x onerror=alert(1)>",
    "';alert('xss');//",
    "<svg onload=alert(1)>",
    '"><script>alert(document.cookie)</script>',
]

SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1--",
    "admin'--",
    "' UNION SELECT * FROM users--",
    "1; DROP TABLE users--",
]

# FakeStoreAPI returns 403 from CI runner IPs — treat as rejection
REJECTION_CODES = (400, 401, 403, 422)


@pytest.fixture(scope="session")
def session():
    """Reusable requests session."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s
