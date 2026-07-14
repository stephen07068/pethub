from flask import current_app
from slugify import slugify
from ..extensions import db
from ..models.product import Product
from ..models.product_image import ProductImage
from ..utils.pagination import paginate_query


class ProductService:

    @staticmethod
    def get_all(page=1, per_page=12, category_id=None, search=None,
                sort="newest", status="active", min_price=None, max_price=None, in_stock=None):
        """List products with filtering, search, sort and pagination."""
        query = Product.query
        if status and status != 'all':
            query = query.filter_by(status=status)

        if category_id:
            query = query.filter_by(category_id=category_id)

        if search:
            term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Product.name.ilike(term),
                    Product.short_description.ilike(term),
                    Product.description.ilike(term),
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
            
        if in_stock is not None and str(in_stock).lower() == 'true':
            query = query.filter(Product.stock > 0)

        sort_map = {
            "newest":     Product.created_at.desc(),
            "oldest":     Product.created_at.asc(),
            "price_asc":  Product.price.asc(),
            "price_desc": Product.price.desc(),
            "name_asc":   Product.name.asc(),
            "featured":   Product.featured.desc(),
        }
        
        if sort == "popularity":
            from ..models.order_item import OrderItem
            from sqlalchemy import func
            query = query.outerjoin(OrderItem).group_by(Product.id).order_by(func.sum(OrderItem.quantity).desc().nulls_last())
        else:
            query = query.order_by(sort_map.get(sort, Product.created_at.desc()))

        items, meta = paginate_query(query, page, per_page)
        return [p.to_dict(include_category=True) for p in items], meta

    @staticmethod
    def get_by_id(product_id):
        product = Product.query.get(product_id)
        if not product:
            return None, "Product not found"
        return product.to_dict(include_category=True), None

    @staticmethod
    def get_by_slug(slug):
        product = Product.query.filter_by(slug=slug).first()
        if not product:
            return None, "Product not found"
        return product.to_dict(include_category=True), None

    @staticmethod
    def get_featured(limit=8):
        products = Product.query.filter_by(featured=True, status="active")\
            .order_by(Product.created_at.desc()).limit(limit).all()
        return [p.to_dict(include_category=True) for p in products]

    @staticmethod
    def get_new_arrivals(limit=8):
        products = Product.query.filter_by(status="active")\
            .order_by(Product.created_at.desc()).limit(limit).all()
        return [p.to_dict(include_category=True) for p in products]

    @staticmethod
    def get_by_category_slug(slug, page=1, per_page=12):
        from ..models.category import Category
        cat = Category.query.filter_by(slug=slug).first()
        if not cat:
            return None, None, "Category not found"
        query = Product.query.filter_by(category_id=cat.id, status="active")\
            .order_by(Product.created_at.desc())
        items, meta = paginate_query(query, page, per_page)
        return [p.to_dict(include_category=True) for p in items], meta, None

    @staticmethod
    def create(data: dict):
        slug = slugify(data["name"])
        # Ensure unique slug
        existing = Product.query.filter_by(slug=slug).first()
        if existing:
            slug = f"{slug}-{Product.query.count() + 1}"

        product = Product(
            name=data["name"],
            slug=slug,
            category_id=data["category_id"],
            short_description=data.get("short_description", data.get("description", "")),
            description=data.get("description", ""),
            brand=data.get("brand", ""),
            features=", ".join(data["features"]) if isinstance(data.get("features"), list) else data.get("features", ""),
            price=float(data["price"]),
            stock=int(data.get("stock", 0)),
            sku=data.get("sku"),
            featured=bool(data.get("featured", False)),
            status=data.get("status", "active"),
        )
        db.session.add(product)
        db.session.commit()
        current_app.logger.info(f"Product created: {product.name}")
        return product.to_dict(include_category=True), None

    @staticmethod
    def update(product_id, data: dict):
        product = Product.query.get(product_id)
        if not product:
            return None, "Product not found"

        for field in ["name", "short_description", "description", "category_id",
                      "price", "stock", "sku", "featured", "status", "brand"]:
            if field in data:
                setattr(product, field, data[field])

        # Handle features — accept list or comma string
        if "features" in data:
            feats = data["features"]
            product.features = ", ".join(feats) if isinstance(feats, list) else feats

        # Also sync short_description from description if not separately provided
        if "description" in data and "short_description" not in data:
            product.short_description = data["description"]

        if "name" in data:
            new_slug = slugify(data["name"])
            conflict = Product.query.filter(
                Product.slug == new_slug, Product.id != product_id
            ).first()
            product.slug = new_slug if not conflict else f"{new_slug}-{product_id}"

        db.session.commit()
        current_app.logger.info(f"Product updated: id={product_id} fields={list(data.keys())}")
        return product.to_dict(include_category=True), None

    @staticmethod
    def delete(product_id):
        product = Product.query.get(product_id)
        if not product:
            return False, "Product not found"
        name = product.name
        
        from sqlalchemy.exc import IntegrityError
        try:
            db.session.delete(product)
            db.session.commit()
            current_app.logger.warning(f"Product deleted: id={product_id} name='{name}'")
            return True, None
        except IntegrityError:
            db.session.rollback()
            return False, "Cannot delete product because it is part of existing orders. Try hiding it or setting stock to 0 instead."

    @staticmethod
    def update_stock(product_id, stock: int):
        from datetime import datetime, timezone
        product = Product.query.get(product_id)
        if not product:
            return None, "Product not found"
        old_stock = product.stock
        product.stock = stock
        product.stock_updated_at = datetime.now(timezone.utc)
        db.session.commit()
        current_app.logger.info(
            f"Inventory updated: product_id={product_id} name='{product.name}' "
            f"old_stock={old_stock} new_stock={stock}"
        )
        return product.to_dict(), None

    @staticmethod
    def toggle_featured(product_id):
        product = Product.query.get(product_id)
        if not product:
            return None, "Product not found"
        product.featured = not product.featured
        db.session.commit()
        current_app.logger.info(
            f"Product featured toggled: id={product_id} name='{product.name}' featured={product.featured}"
        )
        return product.to_dict(), None

    @staticmethod
    def add_image(product_id, image_url: str, display_order=0):
        product = Product.query.get(product_id)
        if not product:
            return None, "Product not found"
        img = ProductImage(
            product_id=product_id,
            image_url=image_url,
            display_order=display_order,
        )
        db.session.add(img)
        db.session.commit()
        return img.to_dict(), None

    @staticmethod
    def delete_image(image_id):
        img = ProductImage.query.get(image_id)
        if not img:
            return False, "Image not found"
        db.session.delete(img)
        db.session.commit()
        return True, None
