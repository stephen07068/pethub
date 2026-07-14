from flask import Blueprint, request
from ..services.cart_service import CartService
from ..utils.response import success, error

cart_bp = Blueprint("cart", __name__)


def _token():
    """Extract cart token from header or JSON body."""
    return (
        request.headers.get("X-Cart-Token")
        or (request.get_json(silent=True) or {}).get("cart_token")
        or request.args.get("cart_token")
    )


@cart_bp.route("/", methods=["GET"])
def get_cart():
    token = _token()
    if not token:
        # Auto-create a new cart
        cart, _ = CartService.get_or_create(None)
        return success(
            CartService.get_cart(cart.token)[0],
            "New cart created",
            201,
            meta={"cart_token": cart.token},
        )
    data, err = CartService.get_cart(token)
    if err:
        cart, _ = CartService.get_or_create(None)
        return success(
            CartService.get_cart(cart.token)[0],
            "New cart created",
            201,
            meta={"cart_token": cart.token},
        )
    return success(data, meta={"cart_token": token})


@cart_bp.route("/new", methods=["POST"])
def new_cart():
    cart, _ = CartService.get_or_create(None)
    data, _ = CartService.get_cart(cart.token)
    return success(data, "Cart created", 201, meta={"cart_token": cart.token})


@cart_bp.route("/items", methods=["POST"])
def add_item():
    token = _token()
    if not token:
        return error("Cart token required", 400)
    body = request.get_json(silent=True) or {}
    product_id = body.get("product_id")
    quantity = body.get("quantity", 1)
    if not product_id:
        return error("product_id is required", 422)
    data, err = CartService.add_item(token, int(product_id), int(quantity))
    if err:
        # Stock/validation errors → 422, not-found → 404
        if "not found" in err.lower() or "not available" in err.lower():
            return error(err, 404)
        return error(err, 422)
    return success(data, "Item added to cart", meta={"cart_token": token})


@cart_bp.route("/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    token = _token()
    if not token:
        return error("Cart token required", 400)
    body = request.get_json(silent=True) or {}
    quantity = body.get("quantity")
    if quantity is None:
        return error("quantity is required", 422)
    data, err = CartService.update_item(token, item_id, int(quantity))
    if err:
        return error(err, 400)
    return success(data, "Cart updated", meta={"cart_token": token})


@cart_bp.route("/items/<int:item_id>", methods=["DELETE"])
def remove_item(item_id):
    token = _token()
    if not token:
        return error("Cart token required", 400)
    data, err = CartService.remove_item(token, item_id)
    if err:
        return error(err, 404)
    return success(data, "Item removed", meta={"cart_token": token})


@cart_bp.route("/clear", methods=["DELETE"])
def clear_cart():
    token = _token()
    if not token:
        return error("Cart token required", 400)
    data, err = CartService.clear_cart(token)
    if err:
        return error(err, 404)
    return success(data, "Cart cleared", meta={"cart_token": token})


@cart_bp.route("/validate", methods=["POST"])
def validate_cart():
    token = _token()
    if not token:
        return error("Cart token required", 400)
    data, errors = CartService.validate_cart(token)
    if errors:
        return error("Cart validation failed", 422,
                     errors=errors if isinstance(errors, list) else [errors])
    return success(data, "Cart is valid")
