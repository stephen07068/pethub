import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdCategory } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { api, adminApi } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', image: ''
  });

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
    if (!window.confirm('Are you sure you want to delete this category? Products in this category might be affected.')) return;
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
      setFormData({
        name: cat.name || '',
        slug: cat.slug || '',
        description: cat.description || '',
        image: cat.image || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', image: '' });
    }
    setShowModal(true);
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
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline-lg" style={{ color: '#121c2a' }}>Categories</h1>
          <p style={{ color: '#5d5f5f' }} className="font-body-md">Manage product categories</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ backgroundColor: '#006e2f', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <MdAdd size={20} /> Add Category
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(241,245,249,0.5)', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '16px 24px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Slug</th>
              <th style={{ padding: '16px 24px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Description</th>
              <th style={{ padding: '16px 24px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>No categories found.</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <MdCategory size={24} color="#94a3b8" />
                      )}
                    </div>
                    <p style={{ fontWeight: 600, color: '#121c2a' }}>{cat.name}</p>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#5d5f5f' }}>{cat.slug}</td>
                <td style={{ padding: '16px 24px', color: '#5d5f5f', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cat.description || '—'}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => openModal(cat)}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', backgroundColor: 'white', color: '#5d5f5f' }}>
                      <MdEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ffdad6', cursor: 'pointer', backgroundColor: 'white', color: '#ba1a1a' }}>
                      <MdDelete size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#121c2a', marginBottom: '24px' }}>
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Slug (URL friendly)</label>
                <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. dog-food" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Image URL (Optional)</label>
                <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#121c2a', marginBottom: '8px' }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" onClick={() => setShowModal(false)} disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#5d5f5f', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#006e2f', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
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
