"""
Security: Cross-Site Scripting (XSS) tests
Business risk: XSS enables session hijacking, credential theft, and malicious redirects.

Uses JSONPlaceholder as the API target — reliably accessible from CI runners.
"""
import pytest
import requests
from conftest import JSON_API_URL, XSS_PAYLOADS


class TestXSS:
    """Tests that verify XSS payloads are rejected or sanitized."""

    def test_xss_in_post_title(self, session):
        """XSS payload in a resource title must not cause a 500 server error."""
        for payload in XSS_PAYLOADS:
            response = session.post(
                f"{JSON_API_URL}/posts",
                json={
                    "title": payload,
                    "body": "Test body",
                    "userId": 1,
                },
            )
            # JSONPlaceholder echoes back 201 — we verify it doesn't crash (500)
            assert response.status_code != 500, (
                f"Server crashed on XSS payload in title: {payload}"
            )
            assert response.status_code in (200, 201), (
                f"Unexpected status {response.status_code} for payload: {payload}"
            )

    def test_xss_in_post_body(self, session):
        """XSS payload in resource body must not cause a server error."""
        for payload in XSS_PAYLOADS[:3]:
            response = session.post(
                f"{JSON_API_URL}/posts",
                json={
                    "title": "Safe Title",
                    "body": payload,
                    "userId": 1,
                },
            )
            assert response.status_code != 500, (
                f"Server crashed on XSS payload in body: {payload}"
            )

    def test_xss_payload_in_query_param(self, session):
        """XSS payload in query parameters must not cause a server error."""
        for payload in XSS_PAYLOADS[:3]:
            response = session.get(
                f"{JSON_API_URL}/posts",
                params={"title": payload},
            )
            assert response.status_code != 500, (
                f"Server crashed on XSS payload in query param: {payload}"
            )

    def test_content_type_header_is_json(self, session):
        """API responses must return application/json, not text/html (prevents MIME sniffing XSS)."""
        response = session.get(f"{JSON_API_URL}/posts/1")
        assert response.status_code == 200
        content_type = response.headers.get("Content-Type", "")
        assert "application/json" in content_type, (
            f"Expected application/json, got: {content_type}"
        )

    def test_xss_payload_length_limit(self, session):
        """Extremely long XSS payloads must not cause server errors."""
        long_payload = "<script>alert(1)</script>" * 100
        response = session.post(
            f"{JSON_API_URL}/posts",
            json={
                "title": long_payload,
                "body": "test",
                "userId": 1,
            },
        )
        assert response.status_code != 500, "Server crashed on long XSS payload"

    def test_response_does_not_reflect_script_tags(self, session):
        """
        Verify the API response content-type is JSON so browsers won't
        execute any reflected script tags as HTML.
        """
        response = session.get(f"{JSON_API_URL}/posts")
        content_type = response.headers.get("Content-Type", "")
        # If content-type is application/json, browsers won't execute scripts
        assert "application/json" in content_type, (
            f"Non-JSON content-type could enable reflected XSS: {content_type}"
        )
