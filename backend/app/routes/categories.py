from flask import Blueprint, request
from ..services.category_service import CategoryService
from ..middleware.auth_middleware import admin_required
from ..validators.validators import validate_category
from ..utils.response import success, error

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("/", methods=["GET"])
def list_categories():
    return success(CategoryService.get_all())


@categories_bp.route("/<int:cat_id>", methods=["GET"])
def get_category(cat_id):
    cat, err = CategoryService.get_by_id(cat_id)
    if err:
        return error(err, 404)
    return success(cat)


@categories_bp.route("/", methods=["POST"])
@admin_required
def create():
    data = request.get_json(silent=True) or {}
    errs = validate_category(data)
    if errs:
        return error("Validation failed", 422, errs)
    cat, err = CategoryService.create(data)
    if err:
        return error(err)
    return success(cat, "Category created", 201)


@categories_bp.route("/<int:cat_id>", methods=["PUT"])
@admin_required
def update(cat_id):
    data = request.get_json(silent=True) or {}
    cat, err = CategoryService.update(cat_id, data)
    if err:
        return error(err, 404)
    return success(cat, "Category updated")


@categories_bp.route("/<int:cat_id>", methods=["DELETE"])
@admin_required
def delete(cat_id):
    ok, err = CategoryService.delete(cat_id)
    if err:
        return error(err, 400)
    return success(message="Category deleted")
