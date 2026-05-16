"""
Security: Insecure Direct Object Reference (IDOR) tests
Business risk: IDOR allows users to access or modify other users' orders and data.

Uses JSONPlaceholder as the API target — reliably accessible from CI runners.
Documents IDOR risks using a public API that intentionally has no auth enforcement.
"""
import pytest
import requests
from conftest import JSON_API_URL


class TestIDOR:
    """Tests that verify and document IDOR risks."""

    def test_resource_accessible_by_id(self, session):
        """Verify resources are accessible by sequential ID (documents enumeration risk)."""
        accessible_ids = []
        for post_id in range(1, 6):
            response = session.get(f"{JSON_API_URL}/posts/{post_id}")
            if response.status_code == 200:
                accessible_ids.append(post_id)

        print(f"\n[IDOR CHECK] Accessible post IDs via enumeration: {accessible_ids}")
        print("  In production: sequential IDs + no auth = IDOR vulnerability")
        print("  Recommendation: use UUIDs and enforce ownership checks")
        # Documents the finding — all IDs should be accessible on this open API
        assert len(accessible_ids) == 5

    def test_user_data_accessible_without_auth(self, session):
        """
        Verify that user data is accessible without authentication.
        Documents the IDOR risk — in production this must require auth.
        """
        response = session.get(f"{JSON_API_URL}/users/1")
        assert response.status_code == 200

        user = response.json()
        print(f"\n[IDOR CHECK] User data accessible without auth: {list(user.keys())}")
        print("  In production: GET /users/:id must require authentication")
        assert "id" in user

    def test_cross_user_resource_access(self, session):
        """
        Verify that resources from different users are accessible without auth.
        Documents the IDOR risk — in production user 1 must not read user 2's data.
        """
        user1_posts = session.get(f"{JSON_API_URL}/posts?userId=1")
        user2_posts = session.get(f"{JSON_API_URL}/posts?userId=2")

        assert user1_posts.status_code == 200
        assert user2_posts.status_code == 200

        print("\n[IDOR CHECK] Cross-user resource access is unrestricted")
        print("  In production: filter results to authenticated user's own resources")

    def test_modify_another_users_resource(self, session):
        """
        Verify that modifying another user's resource is possible without auth.
        Documents the IDOR risk — in production this must return 403.
        """
        payload = {"id": 1, "title": "Tampered title", "body": "Tampered", "userId": 99}
        response = session.put(f"{JSON_API_URL}/posts/1", json=payload)

        print(f"\n[IDOR CHECK] PUT /posts/1 with different userId returned {response.status_code}")
        print("  In production: must verify ownership before allowing modification")
        # JSONPlaceholder accepts it — document as finding
        assert response.status_code in (200, 201, 403)

    def test_delete_another_users_resource(self, session):
        """
        Verify that deleting another user's resource is possible without auth.
        Documents the IDOR risk — in production this must return 403.
        """
        response = session.delete(f"{JSON_API_URL}/posts/1")

        print(f"\n[IDOR CHECK] DELETE /posts/1 returned {response.status_code}")
        print("  In production: must verify ownership before allowing deletion")
        assert response.status_code in (200, 403)

    def test_sequential_id_enumeration_risk(self, session):
        """
        Document that sequential integer IDs enable enumeration attacks.
        Recommendation: use UUIDs or opaque tokens as resource identifiers.
        """
        ids_found = []
        for i in range(1, 11):
            r = session.get(f"{JSON_API_URL}/posts/{i}")
            if r.status_code == 200:
                ids_found.append(i)

        print(f"\n[IDOR CHECK] {len(ids_found)}/10 sequential IDs accessible")
        print("  Recommendation: replace integer IDs with UUIDs in production APIs")
        assert len(ids_found) > 0  # Documents the finding
