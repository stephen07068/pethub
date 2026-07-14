"""
Payment gateway services — one class per method.
Each service exposes: initialize() and confirm() so real integrations
can be swapped in during Phase 2B without touching routes.
"""
import uuid
from flask import current_app
from ..services.wallet_service import get_wallet_address, generate_qr
from ..services.cart_service import CartService


# ─── Coin metadata ────────────────────────────────────────────────────────────
COIN_META = {
    "btc":        {"name": "Bitcoin",      "symbol": "BTC",  "network": "Bitcoin",  "currency": "BTC"},
    "eth":        {"name": "Ethereum",     "symbol": "ETH",  "network": "ERC20",    "currency": "ETH"},
    "usdt_trc20": {"name": "USDT (TRC20)", "symbol": "USDT", "network": "TRC20",    "currency": "USDT"},
    "usdt_bep20": {"name": "USDT (BEP20)", "symbol": "USDT", "network": "BEP20",    "currency": "USDT"},
    "sol":        {"name": "Solana",       "symbol": "SOL",  "network": "Solana",   "currency": "SOL"},
}

# Approximate exchange rates (static — Phase 2B fetches live rates)
_RATES_USD = {"BTC": 65000, "ETH": 3500, "SOL": 150, "USDT": 1}


def _to_crypto(usd_amount: float, symbol: str) -> float:
    rate = _RATES_USD.get(symbol, 1)
    return round(usd_amount / rate, 8)


# ─── Crypto Payment Service ───────────────────────────────────────────────────
class CryptoPaymentService:

    @staticmethod
    def initialize(coin: str, cart_token: str):
        """Return wallet address, QR URL, and amount to pay."""
        coin = coin.lower()
        meta = COIN_META.get(coin)
        if not meta:
            return None, f"Unsupported coin: {coin}"

        address, err = get_wallet_address(coin)
        if err:
            return None, err

        validated, errors = CartService.validate_cart(cart_token)
        if errors:
            return None, errors if isinstance(errors, str) else "; ".join(errors)

        usd_total = validated["grand_total"]
        symbol = meta["symbol"]
        crypto_amount = _to_crypto(usd_total, symbol)

        return {
            "coin": coin,
            "name": meta["name"],
            "symbol": symbol,
            "network": meta["network"],
            "address": address,
            "qr_url": f"/api/wallets/{coin}/qr",
            "usd_amount": usd_total,
            "crypto_amount": crypto_amount,
            "currency": meta["currency"],
            "status": "pending",
            "payment_reference": str(uuid.uuid4()),  # track this session
        }, None

    @staticmethod
    def verify_transaction(coin: str, tx_hash: str):
        """
        Placeholder blockchain verification.
        Phase 2B: query block explorer API (Blockstream, Etherscan, etc.)
        """
        if not tx_hash or len(tx_hash) < 8:
            return False, "Invalid transaction hash"
        # Simulation: any non-empty hash >= 8 chars is accepted
        return True, "Transaction accepted (simulation — add blockchain API in Phase 2B)"


# ─── Apple Pay Service ────────────────────────────────────────────────────────
class ApplePayService:

    @staticmethod
    def initialize(cart_token: str, domain: str = None):
        validated, errors = CartService.validate_cart(cart_token)
        if errors:
            return None, errors if isinstance(errors, str) else "; ".join(errors)
        return {
            "status": "placeholder",
            "session_id": str(uuid.uuid4()),
            "amount": validated["grand_total"],
            "currency": "USD",
            "merchant_name": "PetStore Hub",
            "message": "Apple Pay live credentials required for production (Phase 2B)",
        }, None

    @staticmethod
    def confirm(session_id: str, payment_data: dict):
        """Called by the Apple Pay JS after the user approves the payment."""
        return {
            "success": True,
            "session_id": session_id,
            "payment_reference": str(uuid.uuid4()),
            "status": "verified",
        }, None

    @staticmethod
    def failure(session_id: str, reason: str):
        return {"session_id": session_id, "status": "failed", "reason": reason}, None


# ─── Google Pay Service ───────────────────────────────────────────────────────
class GooglePayService:

    @staticmethod
    def initialize(cart_token: str):
        validated, errors = CartService.validate_cart(cart_token)
        if errors:
            return None, errors if isinstance(errors, str) else "; ".join(errors)
        return {
            "status": "placeholder",
            "token": str(uuid.uuid4()),
            "amount": validated["grand_total"],
            "currency": "USD",
            "merchant_id": "BCR2DN4EXAMPLE",
            "merchant_name": "PetStore Hub",
            "message": "Google Pay live credentials required for production (Phase 2B)",
        }, None

    @staticmethod
    def confirm(token: str, payment_data: dict):
        return {
            "success": True,
            "token": token,
            "payment_reference": str(uuid.uuid4()),
            "status": "verified",
        }, None

    @staticmethod
    def failure(token: str, reason: str):
        return {"token": token, "status": "failed", "reason": reason}, None


# ─── Gift Card Service ────────────────────────────────────────────────────────
class GiftCardService:

    @staticmethod
    def submit(cart_token: str, cards_data: list, batch_total_amount: float = None,
               customer_name: str = None, customer_email: str = None):
        from ..extensions import db
        from ..models.gift_card import GiftCardSubmission

        if not cards_data or len(cards_data) == 0:
            return None, "Please provide at least one gift card (code or photo)."

        # Validate cards
        for card in cards_data:
            if card.get("type") == "code":
                code = card.get("code", "")
                if not code or len(code.strip()) < 4:
                    return None, "All gift card codes must be at least 4 characters long."
                card["code"] = code.strip().upper()

        sub = GiftCardSubmission(
            cards_data=cards_data,
            batch_total_amount=batch_total_amount,
            customer_name=customer_name,
            customer_email=customer_email,
            status="pending",
        )
        db.session.add(sub)
        db.session.commit()

        return {
            "submission_id": sub.id,
            "id": sub.id,
            "cards_data": sub.cards_data,
            "batch_total_amount": sub.batch_total_amount,
            "customer_name": sub.customer_name,
            "customer_email": sub.customer_email,
            "status": sub.status,
            "message": "Gift card submitted for review. You will receive an email once approved.",
            "payment_reference": f"GC-{sub.id}-{str(uuid.uuid4())[:8].upper()}",
        }, None

    @staticmethod
    def review(submission_id: int, approved: bool, notes: str = None):
        from datetime import datetime, timezone
        from ..extensions import db
        from ..models.gift_card import GiftCardSubmission
        from ..services.email_service import send_gift_card_approved, send_gift_card_rejected

        sub = GiftCardSubmission.query.get(submission_id)
        if not sub:
            return None, "Submission not found"
        sub.status = "approved" if approved else "rejected"
        sub.reviewed_at = datetime.now(timezone.utc)
        sub.review_notes = notes
        db.session.commit()

        # Notify customer by email
        result = sub.to_dict()
        try:
            if approved:
                send_gift_card_approved(result)
            else:
                send_gift_card_rejected(result)
        except Exception:
            pass  # Email failure should not block the review response

        return result, None
