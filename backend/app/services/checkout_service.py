"""Address + order creation service."""
from ..utils.response import error


REQUIRED_ADDRESS_FIELDS = [
    "full_name", "email", "phone",
    "country", "state", "city",
    "street_address", "postal_code",
]


def validate_address(data: dict) -> dict:
    """Returns dict of field→error. Empty dict = valid."""
    errors = {}
    for field in REQUIRED_ADDRESS_FIELDS:
        if not data.get(field, "").strip():
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    if data.get("email") and "@" not in data["email"]:
        errors["email"] = "Invalid email address"
    return errors


def validate_checkout_payload(data: dict) -> dict:
    errors = {}
    if not data.get("cart_token"):
        errors["cart_token"] = "Cart token is required"
    if not data.get("payment_method"):
        errors["payment_method"] = "Payment method is required"
    valid_methods = {
        "btc", "eth", "usdt_trc20", "usdt_bep20", "sol",
        "apple_pay", "google_pay", "gift_card",
    }
    if data.get("payment_method") and data["payment_method"] not in valid_methods:
        errors["payment_method"] = f"Invalid payment method. Choose from: {', '.join(sorted(valid_methods))}"
    address_errors = validate_address(data.get("address", {}))
    if address_errors:
        errors["address"] = address_errors
    return errors
