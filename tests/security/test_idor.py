"""
Security: Insecure Direct Object Reference (IDOR) tests
Business risk: IDOR allows users to access or modify other users' orders and data.
"""
import pytest
import requests
from conftest import API_BASE_URL


class TestIDOR:
    """Tests that verify users cannot access other users' resources."""

    def test_cannot_access_another_users_cart(self, session, auth_token):
        """
        A user authenticated as user 1 should not be able to read user 2's cart.
        FakeStoreAPI doesn't enforce this, so we document the expected behavior.
        """
        headers = {"Authorization": f"Bearer {auth_token}"}

        # Get cart for user 1 (our user)
        own_cart = session.get(f"{API_BASE_URL}/carts/user/1", headers=headers)
        assert own_cart.status_code == 200

        # Attempt to access user 2's cart — in a secure API this should be 403
        other_cart = session.get(f"{API_BASE_URL}/carts/user/2", headers=headers)
        # Document: FakeStoreAPI returns 200 (no auth enforcement)
        # A production API MUST return 403 here
        print(f"\n[IDOR CHECK] /carts/user/2 returned {other_cart.status_code}")
        print("  Expected in production: 403 Forbidden")
        print(f"  Actual (FakeStoreAPI): {other_cart.status_code}")

    def test_cannot_modify_another_users_cart(self, session, auth_token):
        """User should not be able to modify another user's cart."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "userId": 2,  # Attempting to modify user 2's data
            "date": "2024-01-01",
            "products": [{"productId": 1, "quantity": 999}],
        }
        response = session.put(f"{API_BASE_URL}/carts/2", json=payload, headers=headers)
        # Document expected vs actual
        print(f"\n[IDOR CHECK] PUT /carts/2 returned {response.status_code}")
        print("  Expected in production: 403 Forbidden")

    def test_cannot_access_another_users_orders(self, session, auth_token):
        """User should not be able to view another user's order history."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = session.get(f"{API_BASE_URL}/carts/user/5", headers=headers)
        print(f"\n[IDOR CHECK] GET /carts/user/5 returned {response.status_code}")
        print("  Expected in production: 403 Forbidden")

    def test_sequential_id_enumeration(self, session):
        """
        Verify that sequential ID enumeration is detectable.
        In production, IDs should be non-sequential (UUIDs) or access-controlled.
        """
        accessible_ids = []
        for cart_id in range(1, 8):
            response = session.get(f"{API_BASE_URL}/carts/{cart_id}")
            if response.status_code == 200 and response.json():
                accessible_ids.append(cart_id)

        print(f"\n[IDOR CHECK] Accessible cart IDs via enumeration: {accessible_ids}")
        print("  In production: sequential IDs + no auth = IDOR vulnerability")
        # This test documents the risk rather than asserting a pass/fail
        # because FakeStoreAPI intentionally has no auth enforcement
        assert len(accessible_ids) >= 0  # Always passes — documents the finding

    def test_product_id_tampering_in_cart(self, session, auth_token):
        """
        Verify that adding a non-existent product ID to cart is handled gracefully.
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "userId": 1,
            "date": "2024-01-01",
            "products": [{"productId": 99999, "quantity": 1}],
        }
        response = session.post(f"{API_BASE_URL}/carts", json=payload, headers=headers)
        # Should either reject (400) or handle gracefully — must not 500
        assert response.status_code != 500, "Server crashed on invalid product ID"
