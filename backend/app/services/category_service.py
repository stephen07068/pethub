from flask import current_app
from slugify import slugify
from ..extensions import db
from ..models.category import Category


class CategoryService:

    @staticmethod
    def get_all():
        cats = Category.query.order_by(Category.id.asc()).all()
        return [c.to_dict() for c in cats]

    @staticmethod
    def get_by_id(cat_id):
        cat = Category.query.get(cat_id)
        if not cat:
            return None, "Category not found"
        return cat.to_dict(), None

    @staticmethod
    def create(data: dict):
        # Use provided slug if given, otherwise auto-generate from name
        slug = data.get("slug") or slugify(data["name"])
        if Category.query.filter_by(slug=slug).first():
            return None, f"Category with slug '{slug}' already exists"
        cat = Category(
            name=data["name"],
            slug=slug,
            description=data.get("description", ""),
            image=data.get("image", ""),
        )
        db.session.add(cat)
        db.session.commit()
        current_app.logger.info(f"Category created: {cat.name}")
        return cat.to_dict(), None

    @staticmethod
    def update(cat_id, data: dict):
        cat = Category.query.get(cat_id)
        if not cat:
            return None, "Category not found"
        if "name" in data:
            cat.name = data["name"]
        if "slug" in data and data["slug"]:
            cat.slug = data["slug"]
        elif "name" in data:
            cat.slug = slugify(data["name"])
        if "description" in data:
            cat.description = data["description"]
        if "image" in data:
            cat.image = data["image"]
        db.session.commit()
        return cat.to_dict(), None

    @staticmethod
    def delete(cat_id):
        cat = Category.query.get(cat_id)
        if not cat:
            return False, "Category not found"
        if cat.products.count() > 0:
            return False, "Cannot delete category with existing products"
        db.session.delete(cat)
        db.session.commit()
        return True, None
