import React from 'react';
import { Link } from 'react-router-dom';
import { MdAddShoppingCart, MdStar, MdPets } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageUrl = resolveImage(product.image);

  return (
    <div className="group">
      <div className="aspect-[4/5] relative bg-surface-subtle rounded-3xl overflow-hidden mb-6 shadow-card hover-lift cursor-pointer">
        <Link to={`/product/${product.id}`}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div 
            className="w-full h-full flex flex-col items-center justify-center text-secondary gap-2"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            <MdPets size={48} className="text-primary/30" />
            <span className="text-xs text-secondary/60">No image</span>
          </div>
        </Link>
        
        {product.badge && (
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className={`text-label-sm px-3 py-1 rounded-full ${
              product.badge === 'BEST SELLER' 
                ? 'bg-primary text-white' 
                : 'bg-on-tertiary-container text-white'
            }`}>
              {product.badge}
            </span>
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 hover:bg-primary hover:text-white text-primary"
        >
          <MdAddShoppingCart size={24} />
        </button>
      </div>
      
      {product.brand && <span className="text-label-sm text-primary uppercase tracking-widest block">{product.brand}</span>}
      <Link to={`/product/${product.id}`}>
        <h3 className="font-headline-md text-headline-md text-on-surface mt-2 hover:text-primary transition-colors">{product.name}</h3>
      </Link>
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-headline-md text-primary font-bold">${(product.price ?? 0).toFixed(2)}</span>
        {product.rating != null && (
          <div className="flex items-center gap-1">
            <MdStar className="text-yellow-400" size={16} />
            <span className="text-label-lg text-on-surface">{Number(product.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
