"""
Security test configuration and shared fixtures.
"""
import pytest
import requests

BASE_URL = "https://www.saucedemo.com"
API_BASE_URL = "https://fakestoreapi.com"

VALID_CREDENTIALS = {
    "username": "standard_user",
    "password": "secret_sauce",
}

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


@pytest.fixture(scope="session")
def session():
    """Reusable requests session."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(session):
    """Obtain a valid auth token from FakeStoreAPI."""
    response = session.post(
        f"{API_BASE_URL}/auth/login",
        json={"username": "mor_2314", "password": "83r5^_"},
    )
    assert response.status_code == 200
    return response.json().get("token")
