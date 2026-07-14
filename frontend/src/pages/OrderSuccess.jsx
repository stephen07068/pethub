import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdCheckCircle, MdContentCopy, MdShoppingBag, MdHome } from 'react-icons/md';
import Button from '../components/common/Button';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;
  const orderNumber = order?.order_number || location.state?.orderId || `PSH-${Date.now().toString(36).toUpperCase()}`;
  const total = order?.total_amount || location.state?.total;
  const [copied, setCopied] = React.useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-24 px-margin-mobile md:px-margin-desktop bg-background min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-card border border-border-light max-w-2xl w-full text-center">

        {/* Animated checkmark */}
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
          <MdCheckCircle size={52} />
        </div>

        <h1 className="font-display text-[40px] text-on-surface mb-4">Order Confirmed! 🎉</h1>
        <p className="text-body-lg text-secondary mb-8 max-w-md mx-auto">
          Thank you for choosing PetStore Hub. Your order is being processed and will be shipped to you soon.
        </p>

        {/* Order Number */}
        <div className="bg-surface-subtle p-6 rounded-xl border border-border-light mb-4 text-left">
          <p className="text-label-sm text-secondary uppercase tracking-wider mb-1">Order Number</p>
          <div className="flex items-center justify-between gap-4">
            <p className="font-headline-md text-headline-md text-primary tracking-widest">{orderNumber}</p>
            <button onClick={copyOrderNumber}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', backgroundColor: copied ? '#dcfce7' : 'white', color: copied ? '#15803d' : '#5d5f5f', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .2s' }}>
              <MdContentCopy size={14} />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Order details (if available from state) */}
        {order && (
          <div className="bg-surface-subtle rounded-xl border border-border-light p-6 mb-8 text-left">
            <div className="flex justify-between text-body-md mb-2">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-md mb-2">
              <span className="text-secondary">Shipping</span>
              <span className="font-medium">${parseFloat(order.shipping_fee || 20).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-md font-bold border-t border-border-light pt-2 mt-2">
              <span>Total Paid</span>
              <span className="text-primary">${parseFloat(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        <p className="text-label-sm text-secondary mb-8">
          Save your order number — you can use it to track your delivery.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/shop">
            <Button size="lg" className="w-full sm:w-auto">
              <MdShoppingBag size={20} /> Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <MdHome size={20} /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
