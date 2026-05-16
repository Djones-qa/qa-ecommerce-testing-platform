"""
Security: Authentication bypass tests
Business risk: Auth bypass allows unauthorized access to accounts and orders.

Note: FakeStoreAPI may return 403 from CI runner IPs (rate limiting / geo-blocking).
All tests accept 403 as a valid "rejected" response alongside 400/401.
"""
import pytest
import requests
from conftest import API_BASE_URL, SQL_INJECTION_PAYLOADS, XSS_PAYLOADS

# Codes that indicate the server rejected the request (not granted access)
REJECTION_CODES = (400, 401, 403, 422)


class TestAuthBypass:
    """Tests that verify authentication cannot be bypassed."""

    def test_login_with_sql_injection_username(self, session):
        """SQL injection in username field must not grant access."""
        for payload in SQL_INJECTION_PAYLOADS:
            response = session.post(
                f"{API_BASE_URL}/auth/login",
                json={"username": payload, "password": "anything"},
            )
            assert response.status_code in REJECTION_CODES, (
                f"SQL injection payload '{payload}' returned unexpected status {response.status_code}"
            )
            if response.status_code == 200:
                body = response.text
                assert "token" not in body.lower(), (
                    f"SQL injection payload '{payload}' may have bypassed auth"
                )

    def test_login_with_empty_credentials(self, session):
        """Empty credentials must not grant access."""
        response = session.post(
            f"{API_BASE_URL}/auth/login",
            json={"username": "", "password": ""},
        )
        assert response.status_code in REJECTION_CODES

    def test_login_with_null_credentials(self, session):
        """Null credentials must not grant access."""
        response = session.post(
            f"{API_BASE_URL}/auth/login",
            json={"username": None, "password": None},
        )
        assert response.status_code in REJECTION_CODES

    def test_login_with_very_long_username(self, session):
        """Extremely long input must not cause server error (500)."""
        long_username = "A" * 10000
        response = session.post(
            f"{API_BASE_URL}/auth/login",
            json={"username": long_username, "password": "password"},
        )
        assert response.status_code != 500, "Server crashed on long username input"

    def test_login_response_does_not_leak_user_data(self, session):
        """Failed login must not reveal whether username exists (user enumeration)."""
        response_bad_user = session.post(
            f"{API_BASE_URL}/auth/login",
            json={"username": "nonexistent_user_xyz", "password": "wrong"},
        )
        response_bad_pass = session.post(
            f"{API_BASE_URL}/auth/login",
            json={"username": "mor_2314", "password": "wrong_password"},
        )
        # Both should return same status code (no user enumeration)
        # If both are 403 (rate-limited), that's also acceptable
        assert response_bad_user.status_code == response_bad_pass.status_code, (
            "Different status codes for bad username vs bad password — enables user enumeration"
        )

    def test_login_xss_in_credentials(self, session):
        """XSS payloads in credentials must not be executed or stored unsanitized."""
        for payload in XSS_PAYLOADS[:3]:
            response = session.post(
                f"{API_BASE_URL}/auth/login",
                json={"username": payload, "password": "password"},
            )
            assert response.status_code in REJECTION_CODES, (
                f"XSS payload in username returned unexpected status {response.status_code}"
            )
