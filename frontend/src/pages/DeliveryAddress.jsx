import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLocalShipping, MdLock } from 'react-icons/md';
import { useCart } from '../hooks/useCart';
import ProgressStepper from '../components/checkout/ProgressStepper';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { api } from '../services/api';

export default function DeliveryAddress() {
  const { cartToken, cartItems, subtotal, grandTotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Payment info passed via location.state from the payment page
  const paymentMethod = location.state?.paymentMethod || sessionStorage.getItem('psh_payment_method') || 'crypto';
  const paymentReference = location.state?.paymentReference || sessionStorage.getItem('psh_payment_ref') || '';
  const currency = location.state?.currency || 'USD';

  const shipping = subtotal > 0 ? 20.00 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const form = e.target;
    const address = {
      full_name: `${form.firstName?.value || ''} ${form.lastName?.value || ''}`.trim(),
      email: form.email?.value || '',
      phone: form.phone?.value || '',
      country: form.country?.value || 'United States',
      state: form.state?.value || '',
      city: form.city?.value || '',
      street_address: form.streetAddress?.value || '',
      apartment: form.apartment?.value || '',
      postal_code: form.postalCode?.value || '',
      delivery_notes: form.deliveryNotes?.value || '',
    };

    try {
      const result = await api.placeOrder(cartToken, address, paymentMethod, paymentReference, currency);
      // Backend returns { success, data: { order_number, ... } }
      const body = result?.data || result;
      const order = body?.data || body;
      clearCart();
      navigate('/order-success', { state: { order } });
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };


  return (
    <div className="py-12 md:py-24 px-margin-mobile md:px-margin-desktop bg-background min-h-screen">
      <div className="max-w-container-max mx-auto">
        <ProgressStepper currentStep={2} />
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Delivery Form */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-xl p-8 shadow-card border border-border-light">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border-light">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <MdLocalShipping size={24} />
                </div>
                <div>
                  <h2 className="font-headline-md text-[24px] text-on-surface">Delivery Information</h2>
                  <p className="text-secondary text-label-sm mt-1">Where should we send your order?</p>
                </div>
              </div>
              
              <form id="delivery-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" name="firstName" placeholder="Jane" required />
                  <Input label="Last Name" name="lastName" placeholder="Doe" required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Email Address" name="email" type="email" placeholder="jane@example.com" required />
                  <Input label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" required />
                </div>
                
                <div className="pt-6 border-t border-border-light">
                  <h3 className="font-label-lg text-on-surface mb-4">Shipping Address</h3>
                  
                  <div className="space-y-6">
                    <Input label="Street Address" name="streetAddress" placeholder="123 Main St" required />
                    
                    <Input label="Apartment, suite, etc. (optional)" name="apartment" placeholder="Apt 4B" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input label="City" name="city" placeholder="New York" required />
                      <Input label="State/Province" name="state" placeholder="NY" required />
                      <Input label="ZIP/Postal Code" name="postalCode" placeholder="10001" required />
                    </div>
                    
                    <Input label="Country" name="country" type="select" required>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="EU">European Union</option>
                    </Input>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border-light">
                  <Input 
                    type="textarea" 
                    name="deliveryNotes"
                    label="Delivery Notes (Optional)" 
                    placeholder="Leave at front door, gate code, etc." 
                    rows={3}
                  />
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-xl p-8 shadow-card border border-border-light sticky top-24">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-body-md text-secondary">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Shipping (Flat Rate)</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
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
                <div className="flex items-center gap-2 justify-end text-label-sm text-secondary">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Payment Verified</span>
                </div>
              </div>
              
              <Button 
                type="submit"
                form="delivery-form"
                isLoading={isSubmitting}
                fullWidth 
              >
                Complete Order
              </Button>
              
              <p className="text-center text-[12px] text-secondary mt-4 flex items-center justify-center gap-1">
                <MdLock size={12} /> Your information is securely encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
