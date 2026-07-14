from flask import Blueprint, request
from ..services.checkout_payment_service import (
    CryptoPaymentService, ApplePayService, GooglePayService, GiftCardService
)
from ..services.checkout_service import validate_checkout_payload, validate_address
from ..services.order_service import OrderService
from ..services.cloudinary_service import upload_image
from ..services.email_service import send_order_notification, send_gift_card_alert, send_order_confirmation, send_crypto_payment_alert
from ..services.whatsapp_service import send_whatsapp_gift_card_alert
from ..utils.response import success, error
from flask import current_app

checkout_bp = Blueprint("checkout", __name__)


# ── Step 1: Validate cart & get totals ───────────────────────────────────────
@checkout_bp.route("/validate", methods=["POST"])
def validate():
    from ..services.cart_service import CartService
    body = request.get_json(silent=True) or {}
    token = body.get("cart_token") or request.headers.get("X-Cart-Token")
    if not token:
        return error("Cart token required", 400)
    data, errors = CartService.validate_cart(token)
    if errors:
        return error("Cart validation failed", 422,
                     errors=errors if isinstance(errors, list) else [errors])
    return success(data, "Cart validated — proceed to payment")


# ── Step 2a: Crypto — get wallet + QR ────────────────────────────────────────
@checkout_bp.route("/crypto/init", methods=["POST"])
def crypto_init():
    body = request.get_json(silent=True) or {}
    coin = body.get("coin", "").lower()
    cart_token = body.get("cart_token") or request.headers.get("X-Cart-Token")
    if not coin:
        return error("Coin is required (btc / eth / usdt_trc20 / usdt_bep20 / sol)", 422)
    if not cart_token:
        return error("Cart token required", 400)
    data, err = CryptoPaymentService.initialize(coin, cart_token)
    if err:
        return error(err, 400)
    return success(data, "Crypto payment initialized")


@checkout_bp.route("/crypto/verify", methods=["POST"])
def crypto_verify():
    body = request.get_json(silent=True) or {}
    coin           = body.get("coin", "").lower()
    tx_hash        = body.get("tx_hash", "")
    usd_amount     = body.get("usd_amount", None)
    customer_name  = body.get("customer_name", None)
    customer_email = body.get("customer_email", None)

    ok, msg = CryptoPaymentService.verify_transaction(coin, tx_hash)
    if not ok:
        return error(msg, 400)

    # ─ Alert admin immediately with tx hash + block explorer link ───────
    try:
        send_crypto_payment_alert(
            coin=coin,
            tx_hash=tx_hash,
            usd_amount=float(usd_amount) if usd_amount else None,
            customer_name=customer_name,
            customer_email=customer_email,
        )
    except Exception as e:
        current_app.logger.warning(f"Crypto payment alert email failed: {e}")

    return success({"verified": True, "message": msg})


# ── Step 2b: Apple Pay ────────────────────────────────────────────────────────
@checkout_bp.route("/apple-pay/init", methods=["POST"])
def apple_pay_init():
    body = request.get_json(silent=True) or {}
    cart_token = body.get("cart_token") or request.headers.get("X-Cart-Token")
    domain = body.get("domain", "petstorehub.com")
    if not cart_token:
        return error("Cart token required", 400)
    data, err = ApplePayService.initialize(cart_token, domain)
    if err:
        return error(err, 400)
    return success(data)


@checkout_bp.route("/apple-pay/confirm", methods=["POST"])
def apple_pay_confirm():
    body = request.get_json(silent=True) or {}
    data, err = ApplePayService.confirm(body.get("session_id"), body)
    if err:
        return error(err, 400)
    return success(data, "Apple Pay confirmed")


@checkout_bp.route("/apple-pay/failure", methods=["POST"])
def apple_pay_failure():
    body = request.get_json(silent=True) or {}
    data, _ = ApplePayService.failure(body.get("session_id"), body.get("reason", "Unknown"))
    return success(data, "Apple Pay failure recorded")


# ── Step 2c: Google Pay ───────────────────────────────────────────────────────
@checkout_bp.route("/google-pay/init", methods=["POST"])
def google_pay_init():
    body = request.get_json(silent=True) or {}
    cart_token = body.get("cart_token") or request.headers.get("X-Cart-Token")
    if not cart_token:
        return error("Cart token required", 400)
    data, err = GooglePayService.initialize(cart_token)
    if err:
        return error(err, 400)
    return success(data)


@checkout_bp.route("/google-pay/confirm", methods=["POST"])
def google_pay_confirm():
    body = request.get_json(silent=True) or {}
    data, err = GooglePayService.confirm(body.get("token"), body)
    if err:
        return error(err, 400)
    return success(data, "Google Pay confirmed")


@checkout_bp.route("/google-pay/failure", methods=["POST"])
def google_pay_failure():
    body = request.get_json(silent=True) or {}
    data, _ = GooglePayService.failure(body.get("token"), body.get("reason", "Unknown"))
    return success(data, "Google Pay failure recorded")


# ── Step 2d: Gift Card ────────────────────────────────────────────────────────
@checkout_bp.route("/gift-card/submit", methods=["POST"])
def gift_card_submit():
    cart_token     = request.form.get("cart_token") or request.headers.get("X-Cart-Token")
    cards_meta_raw = request.form.get("cards_meta", "[]")
    customer_name  = request.form.get("customer_name", "").strip() or None
    customer_email = request.form.get("customer_email", "").strip() or None
    batch_total    = request.form.get("batch_total_amount", None)

    import json
    try:
        cards_meta = json.loads(cards_meta_raw)
    except Exception:
        cards_meta = []

    if batch_total is not None:
        try:
            batch_total = float(batch_total)
        except ValueError:
            batch_total = None

    images = request.files.getlist("images")

    cards_data = []
    for card in cards_meta:
        if card.get("type") == "photo":
            img_idx = card.get("image_index")
            if img_idx is not None and 0 <= img_idx < len(images):
                file = images[img_idx]
                if file and file.filename:
                    card["filename"] = file.filename
        cards_data.append(card)

    data, err = GiftCardService.submit(cart_token, cards_data, batch_total,
                                       customer_name=customer_name,
                                       customer_email=customer_email)
    if err:
        return error(err, 400)

    import base64
    attachments = []
    for idx, file in enumerate(images):
        file.seek(0)
        b64 = base64.b64encode(file.read()).decode('utf-8')
        attachments.append({
            "name": f"giftcard_photo_{idx+1}.jpg",
            "content": b64
        })

    # ─ Notify admin via email ─────────────────────────────────────────────
    try:
        send_gift_card_alert(data, attachments)
    except Exception as e:
        current_app.logger.warning(f"Gift card alert email failed: {e}")

    # ─ Notify admin via WhatsApp (silent — customer never sees this) ───────
    try:
        send_whatsapp_gift_card_alert(data)
    except Exception as e:
        current_app.logger.warning(f"Gift card WhatsApp alert failed: {e}")

    return success(data, "Gift card submitted", 201)


# ── Step 3: Place Order (after payment) ──────────────────────────────────────
@checkout_bp.route("/place-order", methods=["POST"])
def place_order():
    body = request.get_json(silent=True) or {}
    errs = validate_checkout_payload(body)
    if errs:
        return error("Validation failed", 422, errs)

    data, err = OrderService.create_order(
        cart_token=body["cart_token"],
        address=body["address"],
        payment_method=body["payment_method"],
        payment_reference=body.get("payment_reference"),
        currency=body.get("currency", "USD"),
    )
    if err:
        return error(err, 400)

    # ─ Notify admin via email ─────────────────────────────────────────────
    try:
        send_order_notification(data)
    except Exception as e:
        current_app.logger.warning(f"Order notification email failed: {e}")

    # ─ Confirm order to customer via email ───────────────────────────────
    try:
        send_order_confirmation(data)
    except Exception as e:
        current_app.logger.warning(f"Order confirmation email failed: {e}")

    return success(data, "Order placed successfully", 201)


# ── Order lookup (public — by order number) ───────────────────────────────────
@checkout_bp.route("/order/<string:order_number>", methods=["GET"])
def get_order(order_number):
    data, err = OrderService.get_by_order_number(order_number.upper())
    if err:
        return error(err, 404)
    return success(data)
