import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdStar, MdLocalShipping, MdShield, MdArrowBack, MdAdd, MdRemove, MdChevronRight, MdPets } from 'react-icons/md';
import { useCart } from '../hooks/useCart';
import { api } from '../services/api';
import Button from '../components/common/Button';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const resolveImage = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getProduct(id)
      .then(data => {
        setProduct(data.data || data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch product", error);
        setProduct(null);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-headline-lg">Product not found</div>;
  }

  return (
    <div className="py-12 md:py-24 px-margin-mobile md:px-margin-desktop bg-background min-h-screen">
      <div className="max-w-container-max mx-auto">
        
        <div className="flex items-center gap-2 text-label-sm text-secondary mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <MdChevronRight size={16} />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <MdChevronRight size={16} />
          <span className="text-primary font-semibold">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface-subtle rounded-3xl overflow-hidden shadow-card relative group">
              {resolveImage(product.image) ? (
                <img
                  src={resolveImage(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-secondary">
                  <MdPets size={64} className="text-primary/20" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
              {product.badge && (
                <div className="absolute top-6 left-6">
                  <span className={`text-label-sm px-4 py-2 rounded-full ${
                    product.badge === 'BEST SELLER' 
                      ? 'bg-primary text-white' 
                      : 'bg-on-tertiary-container text-white'
                  }`}>
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {product.brand && <span className="text-label-sm text-primary uppercase tracking-widest mb-2">{product.brand}</span>}
            <h1 className="font-display text-[40px] text-on-surface mb-4 leading-tight">{product.name}</h1>
            
            {product.rating != null && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <MdStar size={24} />
                  <MdStar size={24} />
                  <MdStar size={24} />
                  <MdStar size={24} />
                  <MdStar size={24} />
                </div>
                <span className="text-secondary text-body-md">({Number(product.rating).toFixed(1)} / 5.0 based on 128 reviews)</span>
              </div>
            )}
            
            <p className="text-headline-lg text-primary font-bold mb-8">${Number(product.price || 0).toFixed(2)}</p>
            
            <p className="text-body-lg text-secondary leading-relaxed mb-10 border-b border-border-light pb-10">
              {product.description}
            </p>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl p-1 border border-border-light shadow-sm shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <MdRemove size={20} />
                  </button>
                  <span className="font-label-lg w-10 text-center text-on-surface">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <MdAdd size={20} />
                  </button>
                </div>
                
                <Button 
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  onClick={() => addToCart(product, quantity)}
                >
                  Add to Cart
                </Button>
              </div>
              
              <Button 
                className="w-full"
                size="lg"
                onClick={async () => {
                  await addToCart(product, quantity);
                  navigate('/checkout');
                }}
              >
                Buy Now
              </Button>
            </div>
            
            <div className="space-y-4 pt-8 bg-surface-container-low rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <MdLocalShipping size={20} />
                </div>
                <div>
                  <h4 className="font-label-lg text-on-surface">Flat Rate Shipping</h4>
                  <p className="text-label-sm text-secondary">Orders ship for $20 globally.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <MdShield size={20} />
                </div>
                <div>
                  <h4 className="font-label-lg text-on-surface">Premium Guarantee</h4>
                  <p className="text-label-sm text-secondary">30-day returns on all editorial-grade items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
