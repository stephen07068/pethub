import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdCategory, MdClose } from 'react-icons/md';
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

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '' });

  const load = () => {
    api.getCategories()
      .then(res => {
        const body = res?.data || res;
        const items = body?.data || body;
        setCategories(Array.isArray(items) ? items : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products inside may be affected.')) return;
    try {
      await adminApi.deleteCategory(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const openModal = (cat = null) => {
    if (cat) {
      setEditingId(cat.id);
      setFormData({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', image: cat.image || '' });
      setImagePreview(resolveImage(cat.image) || null);
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', image: '' });
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

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        ? value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : prev.slug
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      closeModal();
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#121c2a', margin: 0 }}>Categories</h1>
          <p style={{ color: '#5d5f5f', marginTop: '4px', fontSize: '14px' }}>Manage product categories</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{ backgroundColor: '#006e2f', color: 'white', padding: '11px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>
          <MdAdd size={18} /> Add Category
        </button>
      </div>

      {/* Card Grid — more mobile-friendly than a table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>Loading...</div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>No categories yet. Add one to get started!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {/* Image Banner */}
              <div style={{ width: '100%', height: '120px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {resolveImage(cat.image) ? (
                  <img src={resolveImage(cat.image)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <MdCategory size={40} color="#d1d5db" />
                )}
              </div>
              {/* Body */}
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontWeight: 700, color: '#121c2a', fontSize: '15px', marginBottom: '2px' }}>{cat.name}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px', fontFamily: 'monospace' }}>/{cat.slug}</p>
                {cat.description && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cat.description}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => openModal(cat)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: 'white', color: '#6b7280', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#006e2f'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#006e2f'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <MdEdit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer', backgroundColor: 'white', color: '#ef4444', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}>
                    <MdDelete size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#121c2a', margin: 0 }}>{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex' }}>
                <MdClose size={20} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Name *</label>
                <input required value={formData.name} onChange={e => handleNameChange(e.target.value)} style={inp} placeholder="e.g. Dog Food" />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Slug (URL path) *</label>
                <input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} style={{ ...inp, fontFamily: 'monospace' }} placeholder="e.g. dog-food" />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Appears in the URL: /category/<strong>{formData.slug || 'slug'}</strong></p>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Category Image</label>
                {imagePreview && (
                  <div style={{ marginBottom: '10px', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #E2E8F0' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <input
                  type="file" accept="image/*"
                  onChange={handleFileChange}
                  style={{ ...inp, padding: '8px', cursor: 'pointer', backgroundColor: '#f8fafc' }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  Note: images upload to server. To permanently store them, set up Supabase Storage or Cloudinary.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={lbl}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ ...inp, resize: 'vertical', lineHeight: '1.5' }} placeholder="Brief description of this category..." />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#006e2f', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
