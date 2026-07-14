import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdShoppingCart, MdSearch, MdMenu, MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPetsMenu, setShowPetsMenu] = useState(false);
  const [showMobileShop, setShowMobileShop] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowMobileShop(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setSearchQuery('');
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowMobileShop(false);
  };

  return (
    <header className="bg-white top-0 sticky z-50 shadow-sm border-b border-gray-100">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-[1280px] mx-auto">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00a846"/>
                <stop offset="100%" stopColor="#004d20"/>
              </linearGradient>
              <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00000033"/>
              </filter>
            </defs>
            <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#logoGrad)" filter="url(#logoShadow)"/>
            <ellipse cx="22" cy="27" rx="7" ry="6" fill="white"/>
            <ellipse cx="13.5" cy="19" rx="3" ry="3.8" fill="white"/>
            <ellipse cx="19" cy="16.5" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="25" cy="16.5" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="30.5" cy="19" rx="3" ry="3.8" fill="white"/>
          </svg>
          <span className="leading-none">
            <span className="block text-[22px] font-black tracking-tight text-gray-900">PetStore</span>
            <span className="block text-[13px] font-bold tracking-[0.18em] text-[#006e2f] uppercase">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`font-medium text-sm transition-colors ${isActive('/') && location.pathname === '/' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
          >
            Home
          </Link>

          {/* Shop Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowPetsMenu(true)}
            onMouseLeave={() => setShowPetsMenu(false)}
          >
            <button className={`flex items-center gap-1 font-medium text-sm transition-colors ${isActive('/category') || isActive('/shop') ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}>
              Shop <MdKeyboardArrowDown size={18} className={`transition-transform ${showPetsMenu ? 'rotate-180' : ''}`} />
            </button>
            {showPetsMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Dogs</span>
                </div>
                <Link to="/category/dogs" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-on-surface hover:text-primary transition-colors font-medium" onClick={() => setShowPetsMenu(false)}>Dogs &amp; Puppies</Link>
                <Link to="/category/dog-food" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-on-surface hover:text-primary transition-colors font-medium" onClick={() => setShowPetsMenu(false)}>Dog Food</Link>
                <Link to="/category/dog-toys" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-on-surface hover:text-primary transition-colors font-medium" onClick={() => setShowPetsMenu(false)}>Dog Toys</Link>
                <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Cats</span>
                </div>
                <Link to="/category/cats" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-on-surface hover:text-primary transition-colors font-medium" onClick={() => setShowPetsMenu(false)}>Cats &amp; Kittens</Link>
                <Link to="/category/cat-food" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-on-surface hover:text-primary transition-colors font-medium" onClick={() => setShowPetsMenu(false)}>Cat Food</Link>
                <Link to="/category/cat-toys" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-on-surface hover:text-primary transition-colors font-medium" onClick={() => setShowPetsMenu(false)}>Cat Toys</Link>
                <div className="border-t border-gray-100">
                  <Link to="/shop" className="flex items-center px-4 py-2.5 hover:bg-primary/5 text-secondary hover:text-primary transition-colors text-sm" onClick={() => setShowPetsMenu(false)}>View All Listings</Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/about" className={`font-medium text-sm transition-colors ${isActive('/about') ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}>About</Link>
          <Link to="/contact" className={`font-medium text-sm transition-colors ${isActive('/contact') ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}>Contact</Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search — desktop only */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary z-10 bg-transparent border-none outline-none">
              <MdSearch size={20} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pets, food, toys..."
              className="bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 w-56 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
            />
          </form>

          {/* Cart */}
          <Link to="/cart" className="relative hover:scale-105 transition-transform duration-200 text-primary p-1">
            <MdShoppingCart size={26} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
          >
            <MdMenu size={26} />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu — Slide-in Drawer ── */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeMenu}
          />
          {/* Drawer Panel */}
          <div className="md:hidden fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-50 shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
                <span className="font-black text-lg text-gray-900">PetStore <span className="text-[#006e2f]">Hub</span></span>
              </Link>
              <button
                onClick={closeMenu}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Close menu"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <form onSubmit={handleSearch} className="relative">
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary z-10 bg-transparent border-none outline-none">
                  <MdSearch size={17} />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-primary text-sm"
                />
              </form>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <Link
                to="/"
                className="flex items-center px-4 py-3.5 rounded-xl text-gray-800 hover:bg-primary/5 hover:text-primary font-semibold text-[15px] transition-colors mb-0.5"
                onClick={closeMenu}
              >
                🏠 Home
              </Link>

              {/* Shop accordion */}
              <button
                onClick={() => setShowMobileShop(!showMobileShop)}
                className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-gray-800 hover:bg-primary/5 hover:text-primary font-semibold text-[15px] transition-colors mb-0.5"
              >
                🛍️ Shop
                <MdKeyboardArrowDown size={20} className={`transition-transform duration-200 ${showMobileShop ? 'rotate-180' : ''}`} />
              </button>

              {showMobileShop && (
                <div className="ml-3 mb-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Dogs</p>
                  <Link to="/category/dogs" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary text-sm font-medium transition-colors" onClick={closeMenu}>🐕 Dogs &amp; Puppies</Link>
                  <Link to="/category/dog-food" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary text-sm font-medium transition-colors" onClick={closeMenu}>🦴 Dog Food</Link>
                  <Link to="/category/dog-toys" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary text-sm font-medium transition-colors border-b border-gray-100" onClick={closeMenu}>🎾 Dog Toys</Link>
                  <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Cats</p>
                  <Link to="/category/cats" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary text-sm font-medium transition-colors" onClick={closeMenu}>🐱 Cats &amp; Kittens</Link>
                  <Link to="/category/cat-food" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary text-sm font-medium transition-colors" onClick={closeMenu}>🐟 Cat Food</Link>
                  <Link to="/category/cat-toys" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary text-sm font-medium transition-colors border-b border-gray-100" onClick={closeMenu}>🧶 Cat Toys</Link>
                  <Link to="/shop" className="flex items-center gap-2 px-4 py-3 text-primary font-semibold text-sm transition-colors" onClick={closeMenu}>View All Listings →</Link>
                </div>
              )}

              <Link
                to="/about"
                className="flex items-center px-4 py-3.5 rounded-xl text-gray-800 hover:bg-primary/5 hover:text-primary font-semibold text-[15px] transition-colors mb-0.5"
                onClick={closeMenu}
              >
                ℹ️ About
              </Link>
              <Link
                to="/contact"
                className="flex items-center px-4 py-3.5 rounded-xl text-gray-800 hover:bg-primary/5 hover:text-primary font-semibold text-[15px] transition-colors"
                onClick={closeMenu}
              >
                📩 Contact
              </Link>
            </nav>

            {/* View Cart button at bottom */}
            <div className="px-4 py-4 border-t border-gray-100">
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-[15px]"
              >
                <MdShoppingCart size={20} />
                View Cart {itemCount > 0 && `(${itemCount} items)`}
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
