from flask import Blueprint, request
from ..services.order_service import OrderService
from ..middleware.auth_middleware import admin_required
from ..utils.response import success, error

orders_bp = Blueprint("orders", __name__)


# ── Admin: List all orders ────────────────────────────────────────────────────
@orders_bp.route("/", methods=["GET"])
@admin_required
def list_orders():
    page           = request.args.get("page", 1, type=int)
    per_page       = request.args.get("per_page", 20, type=int)
    status         = request.args.get("status")
    search         = request.args.get("q")
    date_from      = request.args.get("date_from")
    date_to        = request.args.get("date_to")
    payment_method = request.args.get("payment_method")
    payment_status = request.args.get("payment_status")
    sort           = request.args.get("sort", "date_desc")

    orders, meta = OrderService.get_all(
        page=page, per_page=per_page, status=status, search=search,
        date_from=date_from, date_to=date_to, 
        payment_method=payment_method, payment_status=payment_status, sort=sort
    )
    return success(orders, meta=meta)


# ── Admin: Get single order ───────────────────────────────────────────────────
@orders_bp.route("/<string:order_number>", methods=["GET"])
@admin_required
def get_order(order_number):
    data, err = OrderService.get_by_order_number(order_number.upper())
    if err:
        return error(err, 404)
    return success(data)


# ── Admin: Update order status ────────────────────────────────────────────────
@orders_bp.route("/<int:order_id>/status", methods=["PATCH"])
@admin_required
def update_status(order_id):
    body = request.get_json(silent=True) or {}
    status = body.get("status", "").strip()
    if not status:
        return error("status field is required", 422)
    data, err = OrderService.update_status(order_id, status)
    if err:
        return error(err, 400)
    return success(data, f"Order status updated to '{status}'")


# ── Admin: Gift card review ───────────────────────────────────────────────────
@orders_bp.route("/gift-cards/<int:submission_id>/review", methods=["PATCH"])
@admin_required
def review_gift_card(submission_id):
    from ..services.checkout_payment_service import GiftCardService
    body = request.get_json(silent=True) or {}
    approved = bool(body.get("approved", False))
    notes = body.get("notes")
    data, err = GiftCardService.review(submission_id, approved, notes)
    if err:
        return error(err, 404)
    return success(data, "Gift card reviewed")


# ── Admin: List gift card submissions ─────────────────────────────────────────
@orders_bp.route("/gift-cards", methods=["GET"])
@admin_required
def list_gift_cards():
    from ..models.gift_card import GiftCardSubmission
    status = request.args.get("status")
    query = GiftCardSubmission.query.order_by(GiftCardSubmission.submitted_at.desc())
    if status:
        query = query.filter_by(status=status)
    items = query.all()
    return success([g.to_dict() for g in items])
