import React from 'react';
import { MdRemove, MdAdd, MdDelete } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  // Backend cart item shape: { id, product_id, name, slug, image, unit_price, quantity, line_total, stock }
  const price = item.unit_price ?? item.price ?? 0;
  const lineTotal = item.line_total ?? (price * item.quantity);

  return (
    <div className="bg-white rounded-xl p-6 custom-shadow border border-transparent hover:border-border-light transition-all flex flex-col sm:flex-row gap-6 mb-4">
      <div className="w-full sm:w-32 h-32 bg-surface-subtle rounded-lg overflow-hidden shrink-0">
        <Link to={`/product/${item.product_id || item.id}`}>
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/product/${item.product_id || item.id}`}>
              <h3 className="font-headline-md text-[20px] text-on-surface hover:text-primary transition-colors">{item.name}</h3>
            </Link>
          </div>
          <div className="text-right">
            <span className="font-headline-md text-[20px] text-primary block">${lineTotal.toFixed(2)}</span>
            {item.quantity > 1 && <span className="text-secondary text-label-sm">${price.toFixed(2)} each</span>}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-light">
          <div className="flex items-center gap-4 bg-surface-subtle p-1 rounded-lg">
            <button 
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-50"
            >
              <MdRemove size={20} />
            </button>
            <span className="font-label-lg w-4 text-center">{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary"
            >
              <MdAdd size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => removeFromCart(item.id)}
            className="flex items-center gap-2 text-error hover:bg-error/10 px-3 py-2 rounded-lg transition-colors font-label-sm"
          >
            <MdDelete size={20} />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
