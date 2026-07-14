from app import create_app
from app.extensions import db
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage

app = create_app()

with app.app_context():
    # Fetch categories
    dog_cat = Category.query.filter_by(slug='dogs').first()
    cat_cat = Category.query.filter_by(slug='cats').first()

    if not dog_cat:
        print("Dogs category not found. Creating...")
        dog_cat = Category(name='Dogs', slug='dogs', description='Premium pet dogs')
        db.session.add(dog_cat)
    if not cat_cat:
        print("Cats category not found. Creating...")
        cat_cat = Category(name='Cats', slug='cats', description='Premium pet cats')
        db.session.add(cat_cat)
    
    db.session.commit()

    # Add Golden Retriever
    if not Product.query.filter_by(slug='golden-retriever').first():
        dog1 = Product(category_id=dog_cat.id, name='Golden Retriever Puppy', slug='golden-retriever', price=1200.0, stock=5, short_description='Purebred golden retriever puppy', description='Friendly and playful golden retriever puppy, 8 weeks old, vaccinated.', featured=True)
        db.session.add(dog1)
        db.session.commit()
        db.session.add(ProductImage(product_id=dog1.id, image_url='https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80', display_order=1))

    # Add French Bulldog
    if not Product.query.filter_by(slug='french-bulldog').first():
        dog2 = Product(category_id=dog_cat.id, name='French Bulldog Puppy', slug='french-bulldog', price=2500.0, stock=2, short_description='Adorable French Bulldog', description='Compact, muscular, and affectionate French Bulldog, 10 weeks old.', featured=True)
        db.session.add(dog2)
        db.session.commit()
        db.session.add(ProductImage(product_id=dog2.id, image_url='https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80', display_order=1))

    # Add British Shorthair
    if not Product.query.filter_by(slug='british-shorthair').first():
        cat1 = Product(category_id=cat_cat.id, name='British Shorthair Kitten', slug='british-shorthair', price=800.0, stock=3, short_description='Adorable British Shorthair kitten', description='Cute and cuddly, 10 weeks old, vet checked.', featured=True)
        db.session.add(cat1)
        db.session.commit()
        db.session.add(ProductImage(product_id=cat1.id, image_url='https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80', display_order=1))

    # Add Persian Cat
    if not Product.query.filter_by(slug='persian-kitten').first():
        cat2 = Product(category_id=cat_cat.id, name='Persian Kitten', slug='persian-kitten', price=1100.0, stock=1, short_description='Fluffy Persian Kitten', description='Beautiful white Persian kitten, very affectionate.', featured=True)
        db.session.add(cat2)
        db.session.commit()
        db.session.add(ProductImage(product_id=cat2.id, image_url='https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&q=80', display_order=1))

    db.session.commit()
    print("Seeded live dogs and cats successfully!")
