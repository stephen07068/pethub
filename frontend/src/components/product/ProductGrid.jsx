import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, title, subtitle }) {
  if (!products || products.length === 0) {
    return (
      <div className="py-24 px-margin-desktop text-center">
        <p className="text-body-lg text-secondary">No products found.</p>
      </div>
    );
  }

  return (
    <section className="bg-background py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            {title && <h2 className="font-headline-lg text-headline-lg text-on-surface">{title}</h2>}
            {subtitle && <p className="text-secondary mt-4 text-body-lg">{subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
