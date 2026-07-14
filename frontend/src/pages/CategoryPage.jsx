import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { api } from '../services/api';
import { categories as localCategories } from '../data/categories';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const resolveImage = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getCategories(),
      api.getProductsByCategory(slug, 1, 50)
    ]).then(([catsRes, prodsRes]) => {
      const catsBody = catsRes?.data || catsRes;
      const cats = catsBody?.data || catsBody;
      const prodsBody = prodsRes?.data || prodsRes;
      const prods = prodsBody?.data || prodsBody;
      
      const foundCat = (Array.isArray(cats) ? cats : []).find(c => c.slug === slug);
      // Merge with local static data for images/descriptions
      const localCat = localCategories.find(c => c.slug === slug);
      setCategory(foundCat || localCat || { name: slug, slug, description: '' });
      setProducts(Array.isArray(prods) ? prods : []);
      
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [slug]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-headline-lg font-headline-lg mb-4">Category not found</h1>
        <Link to="/categories" className="text-primary hover:underline">Back to Categories</Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="relative w-full h-[400px] overflow-hidden flex items-center justify-center">
        {/* Use backend image if available, else fall back to localCategories image */}
        {(() => {
          const localCat = localCategories.find(c => c.slug === slug);
          const imgUrl = resolveImage(category.image) || localCat?.image;
          return imgUrl ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${imgUrl}')`}}></div>
          ) : (
            <div className="absolute inset-0 bg-primary/20"></div>
          );
        })()}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-margin-mobile">
          <span className="text-primary-fixed-dim font-label-lg tracking-widest bg-white/10 px-4 py-1 rounded-full mb-6 inline-block backdrop-blur-md">COLLECTION</span>
          <h1 className="font-display text-display mb-4">{category.name}</h1>
          <p className="text-white/80 text-body-lg max-w-2xl mx-auto">{category.description}</p>
        </div>
      </div>
      
      <ProductGrid products={products} />
    </div>
  );
}
