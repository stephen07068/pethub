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
      <div style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #E2E8F0', padding: '48px 64px', textAlign: 'center' }}>
        <h1 className="font-display" style={{ fontSize: '40px', color: '#121c2a', marginBottom: '16px' }}>
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Collection'}
        </h1>
        <p className="font-body-lg" style={{ color: '#5d5f5f', maxWidth: '600px', margin: '0 auto' }}>
          {searchQuery ? `Showing products matching your search.` : `Explore our full range of premium pet supplies. Every item carefully curated for quality and sustainability.`}
        </p>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px 64px', display: 'flex', gap: '32px' }}
           className="max-md:!px-4 max-md:!flex-col">
        {/* Sidebar Filters */}
        <div style={{ width: '256px', flexShrink: 0 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', position: 'sticky', top: '96px' }}>
            <h3 className="font-headline-md" style={{ color: '#121c2a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdFilterList /> Filters
            </h3>

            <h4 className="font-label-lg" style={{ color: '#006e2f', marginBottom: '16px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ id: 'all', name: 'All Products' }, ...categories].map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === cat.id}
                    onChange={() => setActiveCategory(cat.id)}
                    style={{ accentColor: '#006e2f' }}
                  />
                  <span className="font-body-md" style={{ color: activeCategory === cat.id ? '#006e2f' : '#5d5f5f', fontWeight: activeCategory === cat.id ? 600 : 400 }}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <p className="font-label-sm" style={{ color: '#5d5f5f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {filteredProducts.length} Products
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0px 2px 8px rgba(31,41,55,0.04)' }}>
              <MdSort style={{ color: '#5d5f5f' }} />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ background: 'transparent', fontSize: '16px', color: '#121c2a', border: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ aspectRatio: '4/5', borderRadius: '24px', background: 'linear-gradient(90deg, #F1F5F9, #e6eeff, #F1F5F9)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }}></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '96px 0' }}>
              <p className="font-body-lg" style={{ color: '#5d5f5f' }}>No products found in this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
