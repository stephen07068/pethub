import React from 'react';
import { Link } from 'react-router-dom';
import { MdPets, MdPhone, MdEmail, MdLocationOn } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 px-margin-desktop py-14 max-w-container-max mx-auto max-md:px-margin-mobile">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg width="32" height="32" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="19" cy="22" r="10" fill="#006e2f"/>
              <ellipse cx="10" cy="13" rx="3.5" ry="4.5" fill="#006e2f"/>
              <ellipse cx="16" cy="10" rx="3" ry="4" fill="#006e2f"/>
              <ellipse cx="22" cy="10" rx="3" ry="4" fill="#006e2f"/>
              <ellipse cx="28" cy="13" rx="3.5" ry="4.5" fill="#006e2f"/>
            </svg>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-gray-900">PetStore</span><span className="text-[#006e2f]"> Hub</span>
            </span>
          </div>
          <p className="text-secondary text-sm mb-5 leading-relaxed">
            Your one-stop shop for dogs, cats, premium pet food, and fun toys — all delivered to your door.
          </p>
          <div className="flex flex-col gap-2 text-sm text-secondary">

            <a href="mailto:petstorehub12@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <MdEmail size={16} /> petstorehub12@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <MdLocationOn size={16} /> 100% Online Store (Worldwide Shipping)
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-on-surface mb-1">Dogs</h4>
          <Link to="/category/dogs" className="text-secondary hover:text-primary transition-colors text-sm">Dogs & Puppies</Link>
          <Link to="/category/dog-food" className="text-secondary hover:text-primary transition-colors text-sm">Dog Food</Link>
          <Link to="/category/dog-toys" className="text-secondary hover:text-primary transition-colors text-sm">Dog Toys</Link>
          <h4 className="font-bold text-on-surface mb-1 mt-4">Cats</h4>
          <Link to="/category/cats" className="text-secondary hover:text-primary transition-colors text-sm">Cats & Kittens</Link>
          <Link to="/category/cat-food" className="text-secondary hover:text-primary transition-colors text-sm">Cat Food</Link>
          <Link to="/category/cat-toys" className="text-secondary hover:text-primary transition-colors text-sm">Cat Toys</Link>
        </div>

        {/* Help */}
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-on-surface mb-1">Help & Info</h4>
          <Link to="/about" className="text-secondary hover:text-primary transition-colors text-sm">About Us</Link>
          <Link to="/contact" className="text-secondary hover:text-primary transition-colors text-sm">Contact Us</Link>
          <Link to="/shop" className="text-secondary hover:text-primary transition-colors text-sm">All Listings</Link>
          <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Adoption Process</a>
          <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Health Guarantee</a>
          <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Shipping & Delivery</a>
          <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Refund Policy</a>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold text-on-surface mb-1">Stay Updated</h4>
          <p className="text-sm text-secondary mb-4">Get notified when new pets, food deals and toys arrive.</p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="h-10 px-4 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button className="h-10 bg-primary text-white font-bold rounded-lg hover:brightness-110 transition-all text-sm">
              Notify Me
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-5 px-margin-desktop max-md:px-margin-mobile flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-secondary">
        <span>© {new Date().getFullYear()} PetStore Hub. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}
