import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdLock, MdCurrencyBitcoin, MdAccountBalanceWallet, MdCardGiftcard, MdShield } from 'react-icons/md';
import { FaApple, FaGooglePay } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';
import ProgressStepper from '../components/checkout/ProgressStepper';
import PaymentMethodCard from '../components/checkout/PaymentMethodCard';
import Button from '../components/common/Button';

export default function Checkout() {
  const { cartItems, subtotal, itemCount } = useCart();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const shipping = subtotal > 0 ? 20.00 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleContinue = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (selectedMethod === 'crypto') {
        navigate('/checkout/crypto');
      } else if (selectedMethod === 'gift-card') {
        navigate('/checkout/gift-card');
      }
    }, 800);
  };

  const paymentMethods = [
    { id: 'crypto', name: 'Cryptocurrency', description: 'BTC, ETH, USDT, SOL', icon: MdCurrencyBitcoin },
    { id: 'gift-card', name: 'Gift Card', description: 'Redeem code', icon: MdCardGiftcard },
  ];

  return (
    <div className="py-12 md:py-24 px-margin-mobile md:px-margin-desktop bg-background min-h-screen">
      <div className="max-w-container-max mx-auto">
        <ProgressStepper currentStep={1} />
        
        <div className="text-center mb-12">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Secure Checkout</h1>
          <p className="text-secondary text-body-md flex items-center justify-center gap-2">
            <MdLock size={16} /> Guest checkout — no account required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Payment Selection */}
          <div className="xl:col-span-7">
            <div className="bg-white rounded-xl p-8 shadow-card border border-border-light mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-[24px] text-on-surface">Select Payment Method</h2>
                <div className="flex items-center gap-1 text-primary text-label-sm bg-primary/10 px-3 py-1 rounded-full">
                  <MdShield size={16} />
                  <span>End-to-End Encrypted</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <PaymentMethodCard 
                    key={method.id}
                    id={method.id}
                    name={method.name}
                    description={method.description}
                    icon={method.icon}
                    selected={selectedMethod === method.id}
                    onClick={() => setSelectedMethod(method.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="xl:col-span-5">
            <div className="bg-white rounded-xl p-8 shadow-card border border-border-light sticky top-24">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Order Summary</h3>
              
              <div className="max-h-[300px] overflow-y-auto mb-6 pr-2 no-scrollbar space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-surface-subtle rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label-lg text-on-surface line-clamp-1">{item.name}</h4>
                      <p className="text-label-sm text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right font-label-lg text-on-surface">
                      ${Number(item.line_total ?? ((item.unit_price ?? item.price ?? 0) * item.quantity)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 mb-6 border-t border-border-light pt-6 text-body-md text-secondary">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping (Flat Rate)</span>
                  <span className="text-on-surface font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="text-on-surface font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-border-light pt-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-headline-md text-[20px] text-on-surface">Total</span>
                  <span className="font-headline-md text-headline-md text-primary">${total.toFixed(2)}</span>
                </div>
                <p className="text-label-sm text-secondary text-right">To be paid via {paymentMethods.find(m => m.id === selectedMethod)?.name}</p>
              </div>
              
              <Button 
                onClick={handleContinue}
                isLoading={isProcessing}
                fullWidth 
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
