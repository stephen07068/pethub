import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MdFilterList, MdSort } from 'react-icons/md';
import ProductCard from '../components/product/ProductCard';
import { api } from '../services/api';
import { categories } from '../data/categories';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    api.getProducts()
      .then(res => {
        const body = res?.data || res;
        const items = body?.data || body;
        const arr = Array.isArray(items) ? items : [];
        setProducts(arr);
        setFilteredProducts(arr);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let result = [...products];
    if (activeCategory !== 'all') {
      result = result.filter(p => {
        const catName = p.category?.slug || p.category?.name || p.category || '';
        return catName === activeCategory;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }
    if (sortOption === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortOption === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortOption === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredProducts(result);
  }, [activeCategory, sortOption, products, searchQuery]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #E2E8F0', padding: 'clamp(32px, 6vw, 48px) clamp(16px, 5vw, 64px)', textAlign: 'center' }}>
        <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: '#121c2a', marginBottom: '12px', fontWeight: 800 }}>
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Collection'}
        </h1>
        <p className="font-body-lg" style={{ color: '#5d5f5f', maxWidth: '600px', margin: '0 auto', fontSize: 'clamp(14px, 2vw, 16px)' }}>
          {searchQuery ? `Showing products matching your search.` : `Explore our full range of premium pet supplies. Every item carefully curated for quality and sustainability.`}
        </p>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 5vw, 64px)' }} className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0">
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', position: 'sticky', top: '96px' }}>
            <h3 className="font-headline-md" style={{ color: '#121c2a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
              <MdFilterList /> Filters
            </h3>

            <h4 className="font-label-lg" style={{ color: '#006e2f', marginBottom: '12px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 700 }}>Categories</h4>
            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {[{ id: 'all', name: 'All Products' }, ...categories].map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer whitespace-nowrap md:whitespace-normal">
                  <input
                    type="radio"
                    name="category"
                    className="hidden md:block"
                    checked={activeCategory === cat.id}
                    onChange={() => setActiveCategory(cat.id)}
                    style={{ accentColor: '#006e2f' }}
                  />
                  <span 
                    className={`font-body-md md:!bg-transparent md:!px-0 md:!py-0 px-4 py-2 rounded-full border md:border-none transition-colors ${
                      activeCategory === cat.id 
                        ? 'bg-primary text-white border-primary md:text-primary' 
                        : 'bg-white text-secondary border-gray-200 md:text-secondary'
                    }`}
                    style={{ fontWeight: activeCategory === cat.id ? 600 : 400, fontSize: '14px' }}
                  >
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p style={{ color: '#5d5f5f', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px', fontWeight: 700 }}>
              {filteredProducts.length} Products
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0px 2px 8px rgba(31,41,55,0.04)' }}>
              <MdSort style={{ color: '#5d5f5f' }} size={18} />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ background: 'transparent', fontSize: '14px', color: '#121c2a', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ aspectRatio: '4/5', borderRadius: '20px', background: 'linear-gradient(90deg, #F1F5F9, #e6eeff, #F1F5F9)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }}></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
              <p style={{ color: '#121c2a', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>No products found</p>
              <p style={{ color: '#5d5f5f', fontSize: '14px' }}>Try selecting a different category or clearing your search.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '16px' }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
