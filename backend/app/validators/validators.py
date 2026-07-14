from ..utils.response import error


def validate_login(data):
    errors = {}
    if not data.get("email"):
        errors["email"] = "Email is required"
    if not data.get("password"):
        errors["password"] = "Password is required"
    return errors


def validate_product(data):
    errors = {}
    if not data.get("name"):
        errors["name"] = "Product name is required"
    if data.get("price") is None:
        errors["price"] = "Price is required"
    else:
        try:
            p = float(data["price"])
            if p < 0:
                errors["price"] = "Price must be non-negative"
        except (ValueError, TypeError):
            errors["price"] = "Price must be a number"
    if not data.get("category_id"):
        errors["category_id"] = "Category is required"
    if data.get("stock") is not None:
        try:
            s = int(data["stock"])
            if s < 0:
                errors["stock"] = "Stock must be non-negative"
        except (ValueError, TypeError):
            errors["stock"] = "Stock must be an integer"
    return errors


def validate_category(data):
    errors = {}
    if not data.get("name"):
        errors["name"] = "Category name is required"
    return errors


def validate_settings(data):
    errors = {}
    if data.get("shipping_fee") is not None:
        try:
            float(data["shipping_fee"])
        except (ValueError, TypeError):
            errors["shipping_fee"] = "Shipping fee must be a number"
    if data.get("support_email") and "@" not in data["support_email"]:
        errors["support_email"] = "Invalid email address"
    return errors
