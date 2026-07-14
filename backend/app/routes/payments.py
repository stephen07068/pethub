from flask import Blueprint, request
from ..services.payment_service import PaymentService
from ..utils.response import success, error

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/crypto/verify", methods=["POST"])
def verify_crypto():
    data = request.get_json(silent=True) or {}
    ok, err = PaymentService.verify_crypto(
        data.get("coin"),
        data.get("tx_hash"),
        data.get("amount")
    )
    if err:
        if not ok:
            return error(err, 400)
        return success(message=err) # Simulation success
    return success(message="Verified")


@payments_bp.route("/apple-pay/session", methods=["POST"])
def apple_pay_session():
    data = request.get_json(silent=True) or {}
    res, err = PaymentService.apple_pay_session(
        data.get("validation_url"),
        data.get("domain")
    )
    if err:
        return error(err, 400)
    return success(res)


@payments_bp.route("/google-pay/session", methods=["POST"])
def google_pay_session():
    data = request.get_json(silent=True) or {}
    res, err = PaymentService.google_pay_session(data.get("total"))
    if err:
        return error(err, 400)
    return success(res)


@payments_bp.route("/gift-card/redeem", methods=["POST"])
def redeem_gift_card():
    data = request.get_json(silent=True) or {}
    res, err = PaymentService.redeem_gift_card(data.get("code"))
    if err:
        return error(err, 400)
    return success(res)
