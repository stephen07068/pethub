import React, { useState, useEffect } from 'react';
import { MdWarehouse, MdEdit, MdClose } from 'react-icons/md';
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

  useEffect(() => { load(); }, []);

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);
    try {
      await adminApi.updateStock(selectedProduct.id, parseInt(newStock) || 0);
      setSelectedProduct(null);
      load();
    } catch {
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#121c2a', margin: 0 }}>Inventory</h1>
        <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Monitor stock levels across all products</p>
      </div>

      {/* Stats — responsive grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Products', value: products.length, icon: '📦', color: '#006e2f' },
          { label: 'Total Units', value: totalItems.toLocaleString(), icon: '🏭', color: '#1d4ed8' },
          { label: 'Low / Critical', value: lowStock, icon: '⚠️', color: '#b45309' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: '26px', fontWeight: 800, margin: 0 }}>{isLoading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                {['Product', 'Category', 'Price', 'Units', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No products found.</td></tr>
              ) : products.map(product => {
                const status = getStockStatus(product.stock ?? 0);
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {resolveImage(product.image) ? (
                            <img src={resolveImage(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '16px' }}>🐾</span>
                          )}
                        </div>
                        <p style={{ fontWeight: 600, color: '#121c2a', fontSize: '13px', whiteSpace: 'nowrap' }}>{product.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {(product.category?.name || product.category || '—').replace(/-/g, ' ')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#006e2f', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      ${(product.price ?? 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#121c2a', fontSize: '18px', whiteSpace: 'nowrap' }}>
                      {product.stock ?? 0}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: status.bg, color: status.text, whiteSpace: 'nowrap' }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => { setSelectedProduct(product); setNewStock(product.stock ?? 0); }}
                        style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: 'white', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#006e2f'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#006e2f'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                        <MdEdit size={13} /> Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#121c2a', margin: 0 }}>Update Stock</h2>
              <button onClick={() => setSelectedProduct(null)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex' }}>
                <MdClose size={18} color="#6b7280" />
              </button>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>{selectedProduct.name}</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>New Stock Quantity</label>
              <input
                type="number"
                value={newStock}
                onChange={e => setNewStock(e.target.value)}
                min="0"
                autoFocus
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setSelectedProduct(null)} disabled={isUpdating}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
              <button onClick={handleUpdateStock} disabled={isUpdating}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: '#006e2f', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: isUpdating ? 0.7 : 1 }}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
