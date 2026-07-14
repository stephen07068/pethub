import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { api, adminApi } from '../../services/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '', brand: '', category_id: '', price: '', stock: '', 
    description: '', image: '', status: 'active', features: ''
  });

  const load = () => {
    Promise.all([
      adminApi.getProducts({ per_page: 100, status: 'all' }),
      api.getCategories()
    ]).then(([resProds, resCats]) => {
      const pBody = resProds?.data || resProds;
      const pItems = pBody?.data || pBody;
      setProducts(Array.isArray(pItems) ? pItems : []);

      const cBody = resCats?.data || resCats;
      const cItems = cBody?.data || cBody;
      setCategories(Array.isArray(cItems) ? cItems : []);

      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product. It might be linked to existing orders.');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category_id: product.category?.id || product.category_id || '',
        price: product.price || '',
        stock: product.stock || '',
        description: product.description || '',
        image: product.image || product.primary_image || '',
        status: product.status || 'active',
        features: (product.features || []).join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', brand: '', category_id: categories[0]?.id || '', price: '', stock: '', 
        description: '', image: '', status: 'active', features: ''
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        category_id: parseInt(formData.category_id) || null,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
      };

      let savedProductId = editingId;
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        const res = await adminApi.createProduct(payload);
        const data = res?.data || res;
        savedProductId = data.id;
      }

      if (imageFile && savedProductId) {
        const imgData = new FormData();
        imgData.append('image', imageFile);
        await adminApi.uploadProductImage(savedProductId, imgData);
      }

      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline-lg" style={{ color: '#121c2a' }}>Products</h1>
          <p style={{ color: '#5d5f5f' }} className="font-body-md">Manage your product catalog</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ backgroundColor: '#006e2f', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <MdAdd size={20} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MdSearch size={20} style={{ color: '#5d5f5f' }} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '16px', color: '#121c2a', backgroundColor: 'transparent' }}
        />
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(241,245,249,0.5)', borderBottom: '1px solid #E2E8F0' }}>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '16px 24px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>No products found.</td></tr>
              ) : filtered.map(product => (
                <tr key={product.id} className="group" style={{ borderBottom: '1px solid #E2E8F0' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {resolveImage(product.image || product.primary_image) ? (
                          <img src={resolveImage(product.image || product.primary_image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '20px' }}>🐾</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#121c2a' }}>{product.name}</p>
                        <p style={{ fontSize: '12px', color: '#5d5f5f' }}>{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#5d5f5f', textTransform: 'capitalize' }}>{(product.category?.name || product.category || '').replace(/-/g, ' ')}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#006e2f' }}>${(product.price ?? 0).toFixed(2)}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: (product.stock ?? 0) > 50 ? '#dcfce7' : (product.stock ?? 0) > 10 ? '#fef9c3' : '#fee2e2',
                      color: (product.stock ?? 0) > 50 ? '#15803d' : (product.stock ?? 0) > 10 ? '#854d0e' : '#991b1b'
                    }}>
                      {product.stock ?? 0} units
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: product.status === 'active' ? '#dcfce7' : '#f1f5f9', color: product.status === 'active' ? '#15803d' : '#5d5f5f', textTransform: 'capitalize' }}>
                      {product.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => openModal(product)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', backgroundColor: 'white', color: '#5d5f5f' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#006e2f'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#5d5f5f'; }}>
                        <MdEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ffdad6', cursor: 'pointer', backgroundColor: 'white', color: '#ba1a1a' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffdad6'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}>
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#121c2a', marginBottom: '24px' }}>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Brand</label>
                  <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Price</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Category</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Product Image</label>
                {formData.image && !imageFile && (
                  <div style={{ marginBottom: '8px', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {resolveImage(formData.image) ? (
                      <img src={resolveImage(formData.image)} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>🐾</span>
                    )}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }} />
                <p style={{ fontSize: '12px', color: '#5d5f5f', marginTop: '4px' }}>Select a new image to upload and replace the current one.</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Features (comma separated)</label>
                <input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Durable, Organic, Easy to clean" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#5d5f5f', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#006e2f', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
