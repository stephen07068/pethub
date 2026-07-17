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
  const imageUrl = resolveImage(product.image || product.primary_image); // Handle both fields just in case

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Image Container ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '125%', // 4:5 aspect ratio
        backgroundColor: '#f1f5f9',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '12px',
      }}>
        <Link to={`/product/${product.id}`} style={{ display: 'block' }}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              loading="lazy"
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'cover', transition: 'transform 0.4s ease',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          {/* Fallback if no image or image fails */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: imageUrl ? 'none' : 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '8px'
          }}>
            <MdPets size={36} style={{ opacity: 0.5 }} />
          </div>
        </Link>
        
        {/* Badge */}
        {product.badge && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', pointerEvents: 'none' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px',
              backgroundColor: product.badge === 'BEST SELLER' ? '#006e2f' : '#1e293b',
              color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>
              {product.badge}
            </span>
          </div>
        )}
        
        {/* Add to Cart Button — Always visible on mobile, positioned nicely */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
          title="Add to Cart"
          style={{
            position: 'absolute', bottom: '10px', right: '10px',
            backgroundColor: 'white', color: '#006e2f', border: 'none',
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s', zIndex: 10
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#006e2f'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#006e2f'; e.currentTarget.style.transform = 'translateY(0)'; }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
        >
          <MdAddShoppingCart size={18} />
        </button>
      </div>
      
      {/* ── Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {product.brand && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#006e2f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            {product.brand}
          </span>
        )}
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 700, color: '#121c2a', margin: '0 0 6px 0',
            lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {product.name}
          </h3>
        </Link>
        
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#121c2a' }}>
            ${(product.price ?? 0).toFixed(2)}
          </span>
          {product.rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <MdStar color="#facc15" size={14} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                {Number(product.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
