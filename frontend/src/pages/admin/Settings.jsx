import React, { useState, useEffect } from 'react';
import { MdSave, MdLocalShipping, MdCurrencyBitcoin } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { api, adminApi } from '../../services/api';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    store_name: '',
    shipping_fee: '',
    support_email: '',
    support_phone: '',
    currency: 'USD'
  });

  useEffect(() => {
    api.getSettings().then(res => {
      const body = res?.data || res;
      const data = body?.data || body;
      if (data) {
        setFormData({
          store_name: data.store_name || '',
          shipping_fee: data.shipping_fee || '',
          support_email: data.support_email || '',
          support_phone: data.support_phone || '',
          currency: data.currency || 'USD'
        });
      }
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        shipping_fee: parseFloat(formData.shipping_fee) || 0
      };
      await adminApi.updateSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px',
    border: '1px solid #E2E8F0', outline: 'none', fontSize: '16px',
    color: '#121c2a', backgroundColor: 'white', transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#3d4a3d', marginBottom: '8px' };
  const sectionStyle = { backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', marginBottom: '24px' };

  if (isLoading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline-lg" style={{ color: '#121c2a' }}>Settings</h1>
          <p style={{ color: '#5d5f5f' }} className="font-body-md">Manage your store configuration</p>
        </div>
        {saved && (
          <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '12px 24px', borderRadius: '12px', fontWeight: 600 }}>
            ✓ Settings saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Store Info */}
        <div style={sectionStyle}>
          <h2 className="font-headline-md" style={{ color: '#121c2a', marginBottom: '24px' }}>Store Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Store Name</label>
              <input required style={inputStyle} value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})}
                onFocus={e => e.target.style.borderColor = '#006e2f'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div>
              <label style={labelStyle}>Support Email</label>
              <input required type="email" style={inputStyle} value={formData.support_email} onChange={e => setFormData({...formData, support_email: e.target.value})}
                onFocus={e => e.target.style.borderColor = '#006e2f'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div>
              <label style={labelStyle}>Support Phone</label>
              <input required style={inputStyle} value={formData.support_phone} onChange={e => setFormData({...formData, support_phone: e.target.value})}
                onFocus={e => e.target.style.borderColor = '#006e2f'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff4ff', color: '#006e2f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdLocalShipping size={22} />
            </div>
            <h2 className="font-headline-md" style={{ color: '#121c2a' }}>Shipping Configuration</h2>
          </div>
          <div style={{ maxWidth: '300px' }}>
            <label style={labelStyle}>Flat Rate Shipping Fee ($)</label>
            <input required type="number" step="0.01" style={inputStyle} value={formData.shipping_fee} onChange={e => setFormData({...formData, shipping_fee: e.target.value})}
              onFocus={e => e.target.style.borderColor = '#006e2f'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            <p style={{ fontSize: '12px', color: '#5d5f5f', marginTop: '8px' }}>This flat rate applies to all orders globally.</p>
          </div>
        </div>

        {/* Crypto Wallets (Read Only) */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef9c3', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdCurrencyBitcoin size={22} />
            </div>
            <h2 className="font-headline-md" style={{ color: '#121c2a' }}>Crypto Wallet Addresses (Configured in Backend ENV)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', opacity: 0.7 }}>
            {['Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT TRC20', 'USDT BEP20', 'Solana (SOL)'].map(coin => (
              <div key={coin}>
                <label style={labelStyle}>{coin}</label>
                <input readOnly style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#F1F5F9' }}
                  defaultValue="See backend .env to update" />
              </div>
            ))}
          </div>
        </div>

        <button disabled={isSaving} type="submit" style={{ backgroundColor: '#006e2f', color: 'white', padding: '16px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdSave size={20} /> {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </AdminLayout>
  );
}
