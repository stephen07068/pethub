from flask import Blueprint, request
from ..services.product_service import ProductService
from ..services.cloudinary_service import upload_image
from ..middleware.auth_middleware import admin_required
from ..validators.validators import validate_product
from ..utils.response import success, error

admin_products_bp = Blueprint("admin_products", __name__)


@admin_products_bp.route("/", methods=["GET"])
@admin_required
def list_all():
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    cat_id   = request.args.get("category_id", type=int)
    search   = request.args.get("q", "")
    sort     = request.args.get("sort", "newest")
    status   = request.args.get("status", "active")
    products, meta = ProductService.get_all(
        page=page, per_page=per_page,
        category_id=cat_id, search=search, sort=sort, status=status,
    )
    return success(products, meta=meta)


@admin_products_bp.route("/", methods=["POST"])
@admin_required
def create():
    data = request.get_json(silent=True) or {}
    errs = validate_product(data)
    if errs:
        return error("Validation failed", 422, errs)
    product, err = ProductService.create(data)
    if err:
        return error(err)
    return success(product, "Product created", 201)


@admin_products_bp.route("/<int:product_id>", methods=["PUT"])
@admin_required
def update(product_id):
    data = request.get_json(silent=True) or {}
    product, err = ProductService.update(product_id, data)
    if err:
        return error(err, 404)
    return success(product, "Product updated")


@admin_products_bp.route("/<int:product_id>", methods=["DELETE"])
@admin_required
def delete(product_id):
    ok, err = ProductService.delete(product_id)
    if err:
        return error(err, 404)
    return success(message="Product deleted")


@admin_products_bp.route("/<int:product_id>/stock", methods=["PATCH"])
@admin_required
def update_stock(product_id):
    data = request.get_json(silent=True) or {}
    stock = data.get("stock")
    if stock is None:
        return error("Stock value required", 422)
    product, err = ProductService.update_stock(product_id, int(stock))
    if err:
        return error(err, 404)
    return success(product, "Stock updated")


@admin_products_bp.route("/<int:product_id>/feature", methods=["PATCH"])
@admin_required
def toggle_feature(product_id):
    product, err = ProductService.toggle_featured(product_id)
    if err:
        return error(err, 404)
    return success(product, "Featured status toggled")


@admin_products_bp.route("/<int:product_id>/images", methods=["POST"])
@admin_required
def upload_product_image(product_id):
    if "image" not in request.files:
        return error("No image file provided", 422)
    file = request.files["image"]
    if not file.filename:
        return error("Empty filename", 422)

    url, err = upload_image(file)
    if err:
        return error(f"Upload failed: {err}", 500)

    order = int(request.form.get("display_order", 0))
    img, err = ProductService.add_image(product_id, url, order)
    if err:
        return error(err, 404)
    return success(img, "Image uploaded", 201)


@admin_products_bp.route("/<int:product_id>/images/<int:image_id>", methods=["DELETE"])
@admin_required
def delete_product_image(product_id, image_id):
    ok, err = ProductService.delete_image(image_id)
    if err:
        return error(err, 404)
    return success(message="Image deleted")
