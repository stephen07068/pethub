import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';
import ProductCard from '../components/product/ProductCard';
import { api } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getFeaturedProducts(4)
      .then(res => {
        const body = res?.data || res;
        const items = body?.data || body;
        setFeaturedProducts(Array.isArray(items) ? items : []);
      })
      .catch(() => setFeaturedProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [
    { slug: 'dogs',      label: 'Dogs & Puppies',    sub: 'Purebred & mixed breeds',    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOeAx_XXUIwFQ6_tGUkahtUCuLseVNALVe_bLnae4939SyaJiRLRG0jkC66PEeFuVj_EqnCpqIXuLpzZcjnfXbP2cHw3pZfsVc0aYl4SYKdgcN4TgsBNCB4M0EVZ2yD7LXt1qW48Us6UJfq3g5_QyYr7Rd5MLv6RVhzs4HMZOU7uqrwknJzptY56MTksgwMVehahRf7MZKMmv8C_8QbIhk18M0Zsdhclbx_X7MGBvPX1xRIEdRppI22novwF64MnhRmw3vQpkTW3E' },
    { slug: 'cats',      label: 'Cats & Kittens',    sub: 'Affectionate companions',     img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1e1eUEsePwjkJvdTeUASaHwC1z0JK5rYzfMtXRxUvXtHozSoX0cq05nkW2jg--pH9qZiqfWEq03uA4zZJPHjSsLtTqFsaGbbw6HJA2z3LpLrVKQOHwvMyju4sGAbeTVGj2BM7bb29AZmFuDeM08ts0TQ4WEn0ii0A_d9OCM4Y6zdVHk5FwFi6IjdPKOSRBjY5JulbpFBiV8_AucgXsO9IRRGlSnyqAn7nUoDv0YBlvLawtWExl8-AMJVmxuZ1BkeFTZJ1TmRW9wk' },
    { slug: 'dog-food',  label: 'Dog Food',           sub: 'Premium nutrition',           img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDM-N73pCkUhUyRM_6tAolvYzebyHUblrX8FIkpPWmXKTuKr9dcRlUuMwfYztCClMghYRmsWl3r0qO1vPrkuwMNSzrng8V8y33fqdJ4-gSW2FJkCo5vIwMWi2Hoc_oAHIfJ1V_bfbGmXUxAyJ2Ao8IyXKS4HvHg-56LLkZ6lqxdp9r1N7aXsdzfDYQLn-ZdxIbyzp8yBL7yrZ0oo6qc9ls6DCU8nnMLEySN3UEmO_jTuI9q18dPu0sETFs-OMtIm9-ndb2R3iB0-ZM' },
    { slug: 'cat-food',  label: 'Cat Food',           sub: 'Gourmet feline meals',        img: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&q=80' },
    { slug: 'dog-toys',  label: 'Dog Toys',           sub: 'Fun & engaging play',         img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSjHtOV5d_8tzTvmW6w2V0LLHQkw6dvomN_Q4SmF6ficDdHNeNB9zIa3GzXHDkbU6E5TBNviJiF5nwg_B5Z_uJTf_5S1LfniUx4uiwWxiWZ2gFhroR-y7dVCBv4nYWfEVFe6iUOMjqkT7d66HRKqkr6iahwZGxK5W8_pvRBjPhdtA6y9p1kacScscpzExrBL6Qzf9Av81lhzg7jwAJz8rBmbrYkEqFVSq744sODEcauAYCivmZKM--82v7eiUSr1X9Ld6OJqZnR-w' },
    { slug: 'cat-toys',  label: 'Cat Toys',           sub: 'Interactive & catnip toys',   img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTgtx3kNhw95J8at-x5V_T-D1qatcszJ0r5yL6mArjUl1PDqJTwYHWpGHc4l6KQ2OtsAguOLhvCZXVbAQG7q-CpLPMLIIcLVIbE0JK8NUFTQZ6CTnHspWOkbyV_1f_t5BUw105EC8mtlYWeNf047cu0ZIYOreh3Kd3cA6gsVyG7LbtQ0WJxxLjhBo4BM6w5u_HRXMfKvCBWJC7vHNVufl9DovbqpBDQIb6iSdw8itJu3tC29Dy9wFBVyc22zQzvE-e2SKU3NzFzwE' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(80px, 12vw, 160px) clamp(16px, 5vw, 64px)',
        display: 'flex', alignItems: 'center',
        minHeight: 'clamp(500px, 70vh, 700px)',
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5uYGOStypKu65qeHgohTwWezKByN9OtMAjnDxAsCnP0IhRsCJ5r5Bj5Pxvn_bg-ri89myGBjoHqYGR_Jk0AY6bxdi7VNvtUf8P4o7DjqAcoytqAy2EvFJDExmxKTxXEDyzI5dDwjzJsdAK0sLkBupN2rlWkXPNfAhqNiz2Hrm7anqvZsYK3YT7M8qcaOX69krTbCWJlwPDKvQYVIiIv04KflDo1MbX-m8BwB-sp8fJ5gHB_hKZjplJrTCusCZLP0CuO5EwbUanQs')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        
        {/* Dark Overlay for Text Readability */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)',
        }} />

        <div className="w-full" style={{ maxWidth: '640px', zIndex: 10, position: 'relative' }}>
          <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.3)' }}>
            Trusted Pet Store
          </span>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '20px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Pets, Food & Toys<br />
            <span style={{ color: '#6bff8f', fontStyle: 'italic', fontWeight: 700 }}>all in one place</span>.
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.9)', marginBottom: '36px', lineHeight: 1.6, maxWidth: '540px' }}>
            Healthy dogs & cats for adoption, premium pet food, and fun toys — everything your furry friend needs, delivered to your door.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/category/dogs" style={{ backgroundColor: '#006e2f', color: 'white', padding: '16px 32px', borderRadius: '14px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(0,110,47,0.4)' }}>
              Browse Dogs
            </Link>
            <Link to="/category/cats" style={{ backgroundColor: 'white', color: '#121c2a', padding: '16px 32px', borderRadius: '14px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
              Browse Cats
            </Link>
          </div>
        </div>
      </section>



      {/* ── Shop by Category ── */}
      <section style={{ padding: 'clamp(36px, 6vw, 80px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(20px, 4vw, 40px)', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#121c2a', margin: 0 }}>Shop by Category</h2>
              <p style={{ color: '#5d5f5f', marginTop: '6px', fontSize: '14px' }}>Pets, food & toys — everything for your dog or cat.</p>
            </div>
            <Link to="/shop" style={{ color: '#006e2f', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              View All <MdArrowForward size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '12px' }}>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', height: 'clamp(140px, 22vw, 200px)', display: 'block', textDecoration: 'none', backgroundColor: '#1e293b', flexShrink: 0 }}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '8px' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(13px, 2.5vw, 16px)', margin: 0, lineHeight: 1.2 }}>{cat.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(10px, 1.8vw, 13px)', margin: '3px 0 0', lineHeight: 1.3 }}>{cat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section style={{ padding: 'clamp(36px, 6vw, 80px) clamp(16px, 5vw, 64px)', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(20px, 4vw, 40px)', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#121c2a', margin: 0 }}>Featured Listings</h2>
              <p style={{ color: '#5d5f5f', marginTop: '6px', fontSize: '14px' }}>Top picks — pets, food & toys hand-selected for you.</p>
            </div>
            <Link to="/shop" style={{ color: '#006e2f', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              View All <MdArrowForward size={18} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ aspectRatio: '4/5', borderRadius: '20px', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))', gap: '16px' }}>
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🐾</p>
              <p style={{ fontWeight: 600, color: '#5d5f5f' }}>Our featured products are coming soon!</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Check back shortly or browse all listings.</p>
              <Link to="/shop" style={{ display: 'inline-block', marginTop: '16px', backgroundColor: '#006e2f', color: 'white', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Browse Shop</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section style={{ padding: 'clamp(36px, 6vw, 80px) clamp(16px, 5vw, 64px)', backgroundColor: 'white' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          backgroundColor: '#006e2f', borderRadius: 'clamp(20px, 4vw, 48px)',
          padding: 'clamp(28px, 5vw, 64px)',
          display: 'flex', flexDirection: 'column', gap: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Grid overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 800, color: 'white', margin: '0 0 10px', lineHeight: 1.2 }}>
              Never miss a new <em style={{ fontWeight: 400 }}>arrival</em>.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(13px, 2vw, 16px)', margin: 0, maxWidth: '480px' }}>
              New puppies, kittens, food deals & toys added weekly. Be the first to know and get 10% off your first order.
            </p>
          </div>

          <form
            onSubmit={e => e.preventDefault()}
            style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              style={{
                flex: 1, minWidth: '200px', padding: '14px 18px', borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
                color: 'white', fontSize: '14px', outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{ padding: '14px 24px', borderRadius: '12px', backgroundColor: 'white', color: '#006e2f', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Subscribe
            </button>
          </form>
          <p style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
