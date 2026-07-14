import React, { useState, useEffect } from 'react';
import { MdWarehouse, MdEdit } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
}

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const load = () => {
    adminApi.getProducts({ per_page: 200, status: 'all' }).then(res => {
      const body = res?.data || res;
      const items = body?.data || body;
      setProducts(Array.isArray(items) ? items : []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);
    try {
      await adminApi.updateStock(selectedProduct.id, parseInt(newStock) || 0);
      setSelectedProduct(null);
      load();
    } catch (err) {
      alert('Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStockStatus = (count) => {
    if (count > 50) return { label: 'In Stock', bg: '#dcfce7', text: '#15803d' };
    if (count > 10) return { label: 'Low Stock', bg: '#fef9c3', text: '#854d0e' };
    return { label: 'Critical', bg: '#fee2e2', text: '#991b1b' };
  };

  const totalItems = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const lowStock = products.filter(p => (p.stock ?? 0) <= 20).length;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline-lg" style={{ color: '#121c2a' }}>Inventory</h1>
          <p style={{ color: '#5d5f5f' }} className="font-body-md">Monitor stock levels across all products</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Products', value: products.length, icon: '📦', color: '#006e2f' },
          { label: 'Total Units', value: totalItems.toLocaleString(), icon: '🏭', color: '#1d4ed8' },
          { label: 'Low Stock Items', value: lowStock, icon: '⚠️', color: '#b45309' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
            <p style={{ color: '#5d5f5f', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: '32px', fontWeight: 700, fontFamily: 'Hanken Grotesk' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(241,245,249,0.5)', borderBottom: '1px solid #E2E8F0' }}>
                {['Product', 'Category', 'Price', 'Units in Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '16px 24px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>No products found.</td></tr>
              ) : products.map(product => {
                const status = getStockStatus(product.stock ?? 0);
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #E2E8F0' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {resolveImage(product.image) ? (
                            <img src={resolveImage(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '18px' }}>🐾</span>
                          )}
                        </div>
                        <p style={{ fontWeight: 600, color: '#121c2a' }}>{product.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#5d5f5f', textTransform: 'capitalize' }}>{(product.category?.name || product.category || '').replace(/-/g, ' ')}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#006e2f' }}>${(product.price ?? 0).toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#121c2a', fontSize: '18px' }}>{product.stock ?? 0}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: status.bg, color: status.text }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button 
                        onClick={() => { setSelectedProduct(product); setNewStock(product.stock ?? 0); }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', backgroundColor: 'white', color: '#5d5f5f', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <MdEdit size={14} /> Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#121c2a', marginBottom: '8px' }}>Update Stock</h2>
            <p style={{ color: '#5d5f5f', marginBottom: '24px' }}>{selectedProduct.name}</p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>New Stock Quantity</label>
              <input 
                type="number" 
                value={newStock} 
                onChange={e => setNewStock(e.target.value)} 
                min="0"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '16px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedProduct(null)} 
                disabled={isUpdating}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#5d5f5f', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={handleUpdateStock} 
                disabled={isUpdating}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#006e2f', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
