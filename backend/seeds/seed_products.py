"""Seed sample products for testing Phase 2A checkout flow."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.category import Category

PRODUCTS = [
    {"name": "Premium Salmon Dog Food",    "cat": "Dog Food",        "price": 49.99, "stock": 100, "desc": "Cold-pressed wild salmon, grain-free formula", "featured": True},
    {"name": "Organic Cat Food Pâté",      "cat": "Cat Food",        "price": 34.99, "stock": 80,  "desc": "Premium organic pâté with real chicken",       "featured": True},
    {"name": "Rope Tug Dog Toy",           "cat": "Dog Toys",        "price": 18.99, "stock": 150, "desc": "Heavy-duty rope toy for aggressive chewers",    "featured": False},
    {"name": "Interactive Feather Wand",   "cat": "Cat Toys",        "price": 14.99, "stock": 120, "desc": "Extendable feather wand with bell attachment",  "featured": True},
    {"name": "Orthopedic Dog Bed",         "cat": "Dog Accessories", "price": 89.99, "stock": 40,  "desc": "Memory foam orthopedic bed, machine washable",  "featured": True},
    {"name": "Premium Cat Tree Tower",     "cat": "Cat Accessories", "price": 124.99,"stock": 25,  "desc": "6-tier activity centre with sisal scratching",  "featured": False},
    {"name": "Grain-Free Puppy Kibble",    "cat": "Dog Food",        "price": 59.99, "stock": 60,  "desc": "Nutrient-rich puppy formula with probiotics",   "featured": False},
    {"name": "Calming CBD Cat Treats",     "cat": "Cat Food",        "price": 29.99, "stock": 90,  "desc": "Hemp-infused calming treats for anxious cats",  "featured": True},
]

IMAGES = {
    "Premium Salmon Dog Food":  "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600",
    "Organic Cat Food Pâté":    "https://images.unsplash.com/photo-1623366302587-bca83d6a2f64?q=80&w=600",
    "Rope Tug Dog Toy":         "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600",
    "Interactive Feather Wand": "https://images.unsplash.com/photo-1629237666352-7a52233b49ec?q=80&w=600",
    "Orthopedic Dog Bed":       "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600",
    "Premium Cat Tree Tower":   "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=600",
    "Grain-Free Puppy Kibble":  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=600",
    "Calming CBD Cat Treats":   "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600",
}

def seed_products():
    app = create_app()
    with app.app_context():
        for p_data in PRODUCTS:
            if Product.query.filter_by(name=p_data["name"]).first():
                print(f"Skip (exists): {p_data['name']}")
                continue

            cat = Category.query.filter_by(name=p_data["cat"]).first()
            if not cat:
                print(f"Category not found: {p_data['cat']}")
                continue

            from slugify import slugify
            slug = slugify(p_data["name"])
            # Ensure unique slug
            if Product.query.filter_by(slug=slug).first():
                slug = f"{slug}-{Product.query.count() + 1}"

            product = Product(
                name=p_data["name"],
                slug=slug,
                category_id=cat.id,
                short_description=p_data["desc"],
                description=f"{p_data['desc']}. Crafted with the finest ingredients for your beloved pet.",
                price=p_data["price"],
                stock=p_data["stock"],
                sku=f"PSH-{slug[:10].upper().replace('-','')}",
                featured=p_data["featured"],
                status="active",
            )
            db.session.add(product)
            db.session.flush()

            img_url = IMAGES.get(p_data["name"], "")
            if img_url:
                img = ProductImage(product_id=product.id, image_url=img_url, display_order=0)
                db.session.add(img)

            print(f"Created: {p_data['name']}")

        db.session.commit()
        total = Product.query.count()
        print(f"\nDone! Total products in DB: {total}")

if __name__ == "__main__":
    seed_products()
