"""
Placeholder payment services.
These implement a clean interface so real payment gateways can be
swapped in (Phase 2) without touching routes or controllers.
"""
import uuid


class PaymentService:

    @staticmethod
    def verify_crypto(coin: str, tx_hash: str, expected_amount: float):
        """
        Placeholder: verify a crypto transaction by hash.
        In production, query the chain's RPC / explorer API.
        """
        if not tx_hash:
            return False, "Transaction hash is required"
        # Simulate: accept any non-empty hash
        return True, "Transaction accepted (simulation)"

    @staticmethod
    def apple_pay_session(validation_url: str, domain: str):
        """
        Placeholder: Apple Pay merchant session.
        In production, use Apple Pay merchant validation endpoint.
        """
        return {
            "status": "placeholder",
            "message": "Apple Pay integration pending",
            "session_id": str(uuid.uuid4()),
        }, None

    @staticmethod
    def google_pay_session(total: float, currency="USD"):
        """
        Placeholder: Google Pay payment token.
        In production, integrate with Google Pay API.
        """
        return {
            "status": "placeholder",
            "message": "Google Pay integration pending",
            "token": str(uuid.uuid4()),
            "amount": total,
            "currency": currency,
        }, None

    @staticmethod
    def redeem_gift_card(code: str):
        """
        Placeholder: validate and redeem a gift card code.
        In production, query a gift card service.
        """
        if not code or len(code) < 4:
            return None, "Invalid gift card code"
        # Simulate: any code with length >= 4 is valid
        return {
            "status": "placeholder",
            "message": "Gift card accepted (simulation)",
            "code": code,
            "balance": 50.00,
        }, None
