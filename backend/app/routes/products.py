from flask import Blueprint, request
from ..services.product_service import ProductService
from ..utils.response import success, error

products_bp = Blueprint("products", __name__)


@products_bp.route("/", methods=["GET"])
def list_products():
    page      = request.args.get("page", 1, type=int)
    per_page  = request.args.get("per_page", 12, type=int)
    cat_id    = request.args.get("category_id", type=int)
    search    = request.args.get("q", "")
    sort      = request.args.get("sort", "newest")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    in_stock  = request.args.get("in_stock")

    products, meta = ProductService.get_all(
        page=page, per_page=per_page,
        category_id=cat_id, search=search, sort=sort,
        min_price=min_price, max_price=max_price, in_stock=in_stock
    )
    return success(products, meta=meta)


@products_bp.route("/featured", methods=["GET"])
def featured():
    limit = int(request.args.get("limit", 8))
    return success(ProductService.get_featured(limit))


@products_bp.route("/new-arrivals", methods=["GET"])
def new_arrivals():
    limit = int(request.args.get("limit", 8))
    return success(ProductService.get_new_arrivals(limit))


@products_bp.route("/search", methods=["GET"])
def search():
    q        = request.args.get("q", "")
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))
    sort      = request.args.get("sort", "newest")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    in_stock  = request.args.get("in_stock")

    if not q:
        return error("Search term is required", 400)
    products, meta = ProductService.get_all(
        page=page, per_page=per_page, search=q,
        sort=sort, min_price=min_price, max_price=max_price, in_stock=in_stock
    )
    return success(products, meta=meta)


@products_bp.route("/category/<string:slug>", methods=["GET"])
def by_category(slug):
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))
    products, meta, err = ProductService.get_by_category_slug(slug, page, per_page)
    if err:
        return error(err, 404)
    return success(products, meta=meta)


@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product, err = ProductService.get_by_id(product_id)
    if err:
        return error(err, 404)
    return success(product)


@products_bp.route("/slug/<string:slug>", methods=["GET"])
def get_by_slug(slug):
    product, err = ProductService.get_by_slug(slug)
    if err:
        return error(err, 404)
    return success(product)
