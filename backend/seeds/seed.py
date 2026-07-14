import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.services.auth_service import AuthService
from app.services.category_service import CategoryService
from app.services.settings_service import SettingsService
from app.models.category import Category


def seed_database():
    app = create_app()
    with app.app_context():
        # Create tables
        db.create_all()

        print("Creating settings...")
        SettingsService.get()

        print("Creating admin...")
        email = os.getenv("ADMIN_EMAIL", "admin@petstorehub.com")
        pwd = os.getenv("ADMIN_PASSWORD", "Admin@1234")
        name = os.getenv("ADMIN_NAME", "Store Admin")
        _, err = AuthService.create_admin(name, email, pwd)
        if err:
            print(f"Admin skip: {err}")
        else:
            print(f"Admin created: {email}")

        print("Creating categories...")
        categories = [
            {"name": "Dogs", "description": "Everything for your dog", "image": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800"},
            {"name": "Cats", "description": "Everything for your cat", "image": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800"},
            {"name": "Dog Food", "description": "Premium dog nutrition", "image": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800"},
            {"name": "Cat Food", "description": "Premium cat nutrition", "image": "https://images.unsplash.com/photo-1623366302587-bca83d6a2f64?q=80&w=800"},
            {"name": "Dog Toys", "description": "Interactive dog toys", "image": "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800"},
            {"name": "Cat Toys", "description": "Interactive cat toys", "image": "https://images.unsplash.com/photo-1629237666352-7a52233b49ec?q=80&w=800"},
            {"name": "Dog Accessories", "description": "Collars, beds, and more", "image": "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800"},
            {"name": "Cat Accessories", "description": "Trees, beds, and more", "image": "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=800"},
        ]

        for cat in categories:
            if not Category.query.filter_by(name=cat["name"]).first():
                CategoryService.create(cat)
                print(f"Added category: {cat['name']}")

        print("Seeding complete!")


if __name__ == "__main__":
    seed_database()
