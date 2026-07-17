import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { api, adminApi } from '../../services/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
}

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid #E2E8F0', fontSize: '14px', color: '#121c2a',
  outline: 'none', boxSizing: 'border-box', backgroundColor: 'white',
};
const lbl = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
      alert(err.response?.data?.message || 'Failed to delete product.');
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
      setImagePreview(resolveImage(product.image || product.primary_image));
    } else {
      setEditingId(null);
      setFormData({ name: '', brand: '', category_id: categories[0]?.id || '', price: '', stock: '', description: '', image: '', status: 'active', features: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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

      closeModal();
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#121c2a', margin: 0 }}>Products</h1>
          <p style={{ color: '#5d5f5f', marginTop: '4px', fontSize: '14px' }}>Manage your product catalog</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{ backgroundColor: '#006e2f', color: 'white', padding: '11px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>
          <MdAdd size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MdSearch size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search products or categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#121c2a', backgroundColor: 'transparent', minWidth: 0 }}
        />
      </div>

      {/* Table — scrolls horizontally on mobile */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No products found.</td></tr>
              ) : filtered.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {resolveImage(product.image || product.primary_image) ? (
                          <img src={resolveImage(product.image || product.primary_image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '18px' }}>🐾</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#121c2a', fontSize: '14px', whiteSpace: 'nowrap' }}>{product.name}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                    {(product.category?.name || product.category || '—').replace(/-/g, ' ')}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#006e2f', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    ${(product.price ?? 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                      backgroundColor: (product.stock ?? 0) > 50 ? '#dcfce7' : (product.stock ?? 0) > 10 ? '#fef9c3' : '#fee2e2',
                      color: (product.stock ?? 0) > 50 ? '#15803d' : (product.stock ?? 0) > 10 ? '#854d0e' : '#991b1b'
                    }}>
                      {product.stock ?? 0} units
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: product.status === 'active' ? '#dcfce7' : '#f1f5f9', color: product.status === 'active' ? '#15803d' : '#6b7280', textTransform: 'capitalize' }}>
                      {product.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openModal(product)}
                        title="Edit"
                        style={{ padding: '7px', borderRadius: '7px', border: '1px solid #E2E8F0', cursor: 'pointer', backgroundColor: 'white', color: '#6b7280', display: 'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#006e2f'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#006e2f'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                        <MdEdit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                        style={{ padding: '7px', borderRadius: '7px', border: '1px solid #fecaca', cursor: 'pointer', backgroundColor: 'white', color: '#ef4444', display: 'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}>
                        <MdDelete size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '580px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#121c2a', margin: 0 }}>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex' }}>
                <MdClose size={20} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Responsive 2-col grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Product Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inp} placeholder="e.g. Golden Retriever" />
                </div>
                <div>
                  <label style={lbl}>Brand *</label>
                  <input required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} style={inp} placeholder="e.g. PetStore Hub" />
                </div>
                <div>
                  <label style={lbl}>Price ($) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inp} placeholder="0.00" />
                </div>
                <div>
                  <label style={lbl}>Stock *</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} style={inp} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>Category *</label>
                  <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} style={inp}>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Product Image</label>
                {imagePreview && (
                  <div style={{ marginBottom: '10px', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #E2E8F0' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <input
                  type="file" accept="image/*"
                  onChange={handleFileChange}
                  style={{ ...inp, padding: '8px', cursor: 'pointer', backgroundColor: '#f8fafc' }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Upload a new image to replace the current one.</p>
              </div>

              {/* Features */}
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Features (comma separated)</label>
                <input value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} style={inp} placeholder="Durable, Organic, Easy to clean" />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={lbl}>Description *</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ ...inp, resize: 'vertical', lineHeight: '1.5' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" onClick={closeModal} disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#006e2f', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: isSaving ? 0.7 : 1 }}>
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
