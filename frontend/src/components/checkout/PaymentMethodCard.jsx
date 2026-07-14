import React from 'react';
import { MdCheckCircle } from 'react-icons/md';

export default function PaymentMethodCard({ id, name, icon: Icon, description, selected, onClick }) {
  return (
    <label className="cursor-pointer block relative">
      <input 
        type="radio" 
        name="payment_method" 
        value={id} 
        checked={selected} 
        onChange={onClick}
        className="sr-only"
      />
      <div className={`p-5 rounded-xl border transition-all ${
        selected 
          ? 'border-primary bg-surface-container-low shadow-[0_0_0_2px_rgba(34,197,94,0.1)] -translate-y-[2px]' 
          : 'border-border-light hover:border-primary/50 hover:bg-surface-subtle'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            selected ? 'bg-white shadow-sm' : 'bg-surface'
          }`}>
            <Icon size={24} className={selected ? 'text-primary' : 'text-secondary'} />
          </div>
          <div className="flex-1">
            <h4 className={`font-label-lg ${selected ? 'text-primary' : 'text-on-surface'}`}>{name}</h4>
            {description && <p className="text-label-sm text-secondary mt-1">{description}</p>}
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            selected ? 'text-primary' : 'text-transparent'
          }`}>
            <MdCheckCircle size={24} />
          </div>
        </div>
      </div>
    </label>
  );
}
