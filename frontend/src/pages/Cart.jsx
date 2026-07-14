import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack, MdChevronRight } from 'react-icons/md';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/common/Button';

export default function Cart() {
  const { cartItems, subtotal, itemCount } = useCart();

  return (
    <div className="py-12 md:py-24 px-margin-mobile md:px-margin-desktop bg-background min-h-screen">
      <div className="max-w-container-max mx-auto">
        
        <div className="flex items-center gap-2 text-label-sm text-secondary mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <MdChevronRight className="text-[20px]" />
          <span className="text-primary font-semibold">Shopping Cart</span>
        </div>
        
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-12">
          Your Cart {itemCount > 0 && <span className="text-secondary text-headline-md font-normal ml-2">({itemCount} items)</span>}
        </h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-card border border-border-light">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Your cart is empty</h2>
            <p className="text-secondary text-body-md mb-8 max-w-md mx-auto">Looks like you haven't added any premium pet gear to your cart yet.</p>
            <Link to="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="mb-6">
                {cartItems.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              
              <Link to="/shop" className="inline-flex items-center gap-2 text-primary font-label-lg hover:underline transition-all mt-4">
                <MdArrowBack size={20} />
                <span>Continue Shopping</span>
              </Link>
            </div>
            
            <div className="lg:col-span-4">
              <CartSummary subtotal={subtotal} itemCount={itemCount} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
