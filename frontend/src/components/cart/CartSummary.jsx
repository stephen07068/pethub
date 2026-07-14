import React from 'react';
import { MdVerifiedUser, MdLocalShipping, MdHistory } from 'react-icons/md';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

export default function CartSummary({ subtotal, itemCount }) {
  const navigate = useNavigate();
  const shipping = subtotal > 0 ? 20.00 : 0;
  const tax = subtotal * 0.08; // 8% mock tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-xl p-8 shadow-card border border-border-light sticky top-24">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Order Summary</h3>
      
      <div className="space-y-4 mb-6 text-body-md text-secondary">
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-on-surface font-medium">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span className="text-on-surface font-medium">${tax.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="border-t border-border-light pt-6 mb-8">
        <div className="flex justify-between items-center">
          <span className="font-headline-md text-[20px] text-on-surface">Total</span>
          <span className="font-headline-md text-headline-md text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
      
      <Button 
        onClick={() => navigate('/checkout')}
        fullWidth 
        disabled={subtotal === 0}
      >
        Proceed to Checkout
      </Button>
      
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 text-secondary text-label-sm">
          <MdVerifiedUser className="text-primary" size={20} />
          <span>Secure, encrypted checkout</span>
        </div>
        <div className="flex items-center gap-3 text-secondary text-label-sm">
          <MdLocalShipping className="text-primary" size={20} />
          <span>Free shipping over $100</span>
        </div>
        <div className="flex items-center gap-3 text-secondary text-label-sm">
          <MdHistory className="text-primary" size={20} />
          <span>30-day return policy</span>
        </div>
      </div>
    </div>
  );
}
