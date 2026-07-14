import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then(res => {
        const body = res?.data || res;
        const items = body?.data || body;
        setCats(Array.isArray(items) ? items : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-surface-container-low py-12 px-margin-mobile md:px-margin-desktop text-center border-b border-border-light">
        <h1 className="font-display text-[40px] text-on-surface mb-4">All Categories</h1>
        <p className="text-secondary text-body-lg max-w-2xl mx-auto">Explore our premium collections tailored for your companions.</p>
      </div>
      
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-3xl shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cats.map(category => (
              <Link 
                key={category.id} 
                to={`/category/${category.slug}`}
                className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card aspect-square"
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: `url('${category.image}')`}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-white font-headline-lg text-headline-lg mb-2">{category.name}</h3>
                  <p className="text-white/90 text-body-lg line-clamp-2">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
