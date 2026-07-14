import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';
import Button from '../components/common/Button';
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] overflow-hidden flex items-center px-margin-desktop bg-surface-container-low max-md:px-margin-mobile">
        <div className="z-10 max-w-2xl">
          <span className="text-primary font-label-lg tracking-widest bg-primary/10 px-4 py-1 rounded-full mb-6 inline-block">TRUSTED PET STORE</span>
          <h1 className="font-display text-display text-on-surface mb-6">Pets, Food & Toys<br/><span className="text-primary italic">all in one place</span>.</h1>
          <p className="text-body-lg text-secondary mb-10 max-w-lg">Healthy dogs & cats for adoption, premium pet food, and fun toys — everything your furry friend needs, delivered to your door.</p>
          <div className="flex gap-4 max-sm:flex-col">
            <Link to="/category/dogs">
              <Button size="lg">Browse Dogs</Button>
            </Link>
            <Link to="/category/cats">
              <Button variant="secondary" size="lg">Browse Cats</Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <div className="w-full h-full bg-cover bg-center rounded-l-[80px]" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5uYGOStypKu65qeHgohTwWezKByN9OtMAjnDxAsCnP0IhRsCJ5r5Bj5Pxvn_bg-ri89myGBjoHqYGR_Jk0AY6bxdi7VNvtUf8P4o7DjqAcoytqAy2EvFJDExmxKTxXEDyzI5dDwjzJsdAK0sLkBupN2rlWkXPNfAhqNiz2Hrm7anqvZsYK3YT7M8qcaOX69krTbCWJlwPDKvQYVIiIv04KflDo1MbX-m8BwB-sp8fJ5gHB_hKZjplJrTCusCZLP0CuO5EwbUanQs')"}}></div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="py-24 px-margin-desktop max-w-container-max mx-auto max-md:px-margin-mobile w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Shop by Category</h2>
            <p className="text-secondary mt-2">Pets, food & toys — everything for your dog or cat.</p>
          </div>
          <Link to="/shop" className="text-primary font-label-lg flex items-center gap-2 hover:gap-3 transition-all">
            View All <MdArrowForward size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
          {/* Dogs */}
          <Link to="/category/dogs" className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card h-52">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOeAx_XXUIwFQ6_tGUkahtUCuLseVNALVe_bLnae4939SyaJiRLRG0jkC66PEeFuVj_EqnCpqIXuLpzZcjnfXbP2cHw3pZfsVc0aYl4SYKdgcN4TgsBNCB4M0EVZ2yD7LXt1qW48Us6UJfq3g5_QyYr7Rd5MLv6RVhzs4HMZOU7uqrwknJzptY56MTksgwMVehahRf7MZKMmv8C_8QbIhk18M0Zsdhclbx_X7MGBvPX1xRIEdRppI22novwF64MnhRmw3vQpkTW3E')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-lg">Dogs & Puppies</h3>
              <p className="text-white/75 text-sm">Purebred & mixed breeds</p>
            </div>
          </Link>

          {/* Cats */}
          <Link to="/category/cats" className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card h-52">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1e1eUEsePwjkJvdTeUASaHwC1z0JK5rYzfMtXRxUvXtHozSoX0cq05nkW2jg--pH9qZiqfWEq03uA4zZJPHjSsLtTqFsaGbbw6HJA2z3LpLrVKQOHwvMyju4sGAbeTVGj2BM7bb29AZmFuDeM08ts0TQ4WEn0ii0A_d9OCM4Y6zdVHk5FwFi6IjdPKOSRBjY5JulbpFBiV8_AucgXsO9IRRGlSnyqAn7nUoDv0YBlvLawtWExl8-AMJVmxuZ1BkeFTZJ1TmRW9wk')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-lg">Cats & Kittens</h3>
              <p className="text-white/75 text-sm">Affectionate companions</p>
            </div>
          </Link>

          {/* Dog Food */}
          <Link to="/category/dog-food" className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card h-52">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDM-N73pCkUhUyRM_6tAolvYzebyHUblrX8FIkpPWmXKTuKr9dcRlUuMwfYztCClMghYRmsWl3r0qO1vPrkuwMNSzrng8V8y33fqdJ4-gSW2FJkCo5vIwMWi2Hoc_oAHIfJ1V_bfbGmXUxAyJ2Ao8IyXKS4HvHg-56LLkZ6lqxdp9r1N7aXsdzfDYQLn-ZdxIbyzp8yBL7yrZ0oo6qc9ls6DCU8nnMLEySN3UEmO_jTuI9q18dPu0sETFs-OMtIm9-ndb2R3iB0-ZM')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-lg">Dog Food</h3>
              <p className="text-white/75 text-sm">Premium nutrition</p>
            </div>
          </Link>

          {/* Cat Food */}
          <Link to="/category/cat-food" className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card h-52">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: "url('https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&q=80')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-lg">Cat Food</h3>
              <p className="text-white/75 text-sm">Gourmet feline meals</p>
            </div>
          </Link>

          {/* Dog Toys */}
          <Link to="/category/dog-toys" className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card h-52">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSjHtOV5d_8tzTvmW6w2V0LLHQkw6dvomN_Q4SmF6ficDdHNeNB9zIa3GzXHDkbU6E5TBNviJiF5nwg_B5Z_uJTf_5S1LfniUx4uiwWxiWZ2gFhroR-y7dVCBv4nYWfEVFe6iUOMjqkT7d66HRKqkr6iahwZGxK5W8_pvRBjPhdtA6y9p1kacScscpzExrBL6Qzf9Av81lhzg7jwAJz8rBmbrYkEqFVSq744sODEcauAYCivmZKM--82v7eiUSr1X9Ld6OJqZnR-w')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-lg">Dog Toys</h3>
              <p className="text-white/75 text-sm">Fun & engaging play</p>
            </div>
          </Link>

          {/* Cat Toys */}
          <Link to="/category/cat-toys" className="relative group cursor-pointer overflow-hidden rounded-3xl bg-surface-container-high shadow-card h-52">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTgtx3kNhw95J8at-x5V_T-D1qatcszJ0r5yL6mArjUl1PDqJTwYHWpGHc4l6KQ2OtsAguOLhvCZXVbAQG7q-CpLPMLIIcLVIbE0JK8NUFTQZ6CTnHspWOkbyV_1f_t5BUw105EC8mtlYWeNf047cu0ZIYOreh3Kd3cA6gsVyG7LbtQ0WJxxLjhBo4BM6w5u_HRXMfKvCBWJC7vHNVufl9DovbqpBDQIb6iSdw8itJu3tC29Dy9wFBVyc22zQzvE-e2SKU3NzFzwE')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-lg">Cat Toys</h3>
              <p className="text-white/75 text-sm">Interactive & catnip toys</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-margin-desktop max-w-container-max mx-auto max-md:px-margin-mobile w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Featured Listings</h2>
            <p className="text-secondary mt-2">Top picks — pets, food & toys hand-selected for you.</p>
          </div>
          <Link to="/shop" className="text-primary font-label-lg flex items-center gap-2 hover:gap-3 transition-all">
            View All <MdArrowForward size={20} />
          </Link>
        </div>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ aspectRatio: '4/5', borderRadius: '24px', backgroundColor: '#F1F5F9', animation: 'shimmer 2s infinite linear' }}></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#5d5f5f' }}>
            <p style={{ fontSize: '15px' }}>Our featured products are coming soon. Check back shortly!</p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="py-24 px-margin-desktop bg-surface-container-lowest max-md:px-margin-mobile">
        <div className="max-w-container-max mx-auto bg-primary rounded-[48px] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
              <pattern height="10" id="grid" patternUnits="userSpaceOnUse" width="10">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"></path>
              </pattern>
              <rect fill="url(#grid)" height="100%" width="100%"></rect>
            </svg>
          </div>
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="font-headline-lg text-white text-[40px] leading-tight mb-6">Never miss a new <span className="italic font-normal">arrival</span>.</h2>
            <p className="text-white/80 text-body-lg">New puppies, kittens, food deals & toys added weekly. Be the first to know and get 10% off your first order.</p>
          </div>
          <div className="relative z-10 w-full max-w-md">
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email Address" className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all" />
              <button type="submit" className="bg-white text-primary px-8 py-5 rounded-2xl font-label-lg hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-colors shadow-xl">Subscribe</button>
            </form>
            <p className="text-white/40 text-label-sm mt-4 text-center md:text-left">We respect your privacy. No spam, ever.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
