import React, { useState, useEffect } from 'react';
import { MdSearch, MdEdit, MdClose } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/api';

const STATUS_COLORS = {
  pending:    { bg: '#fef9c3', text: '#854d0e' },
  paid:       { bg: '#dcfce7', text: '#15803d' },
  processing: { bg: '#dbeafe', text: '#1d4ed8' },
  shipped:    { bg: '#ede9fe', text: '#6d28d9' },
  delivered:  { bg: '#d1fae5', text: '#065f46' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b' },
};

const statusKeys = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setIsLoading(true);
    adminApi.getOrders({ q: search, status: statusFilter || undefined })
      .then(res => {
        const body = res?.data || res;
        const items = body?.data || body;
        setOrders(Array.isArray(items) ? items : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      load();
      setSelected(null);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#121c2a', margin: 0 }}>Orders</h1>
        <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <MdSearch size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order # or customer..."
            style={{ width: '100%', height: '40px', paddingLeft: '36px', paddingRight: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: '40px', padding: '0 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          {statusKeys.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Desktop Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '640px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                {['Order #', 'Customer', 'Date', 'Payment', 'Status', 'Total', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading orders…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No orders found.</td></tr>
              ) : orders.map(order => {
                const sc = STATUS_COLORS[order.status] || { bg: '#f1f5f9', text: '#6b7280' };
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: '#006e2f', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'nowrap' }}>{order.order_number}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <p style={{ fontWeight: 600, color: '#121c2a', fontSize: '13px', margin: 0, whiteSpace: 'nowrap' }}>{order.customer_name}</p>
                      <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>{order.customer_email}</p>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{order.payment_method}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: sc.bg, color: sc.text, display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: '#121c2a', fontSize: '14px', whiteSpace: 'nowrap' }}>${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <button onClick={() => setSelected(order)}
                        style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: 'white', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
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

      {/* Status Update Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#121c2a', margin: 0 }}>Update Order Status</h2>
              <button onClick={() => setSelected(null)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex' }}>
                <MdClose size={18} color="#6b7280" />
              </button>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
              Order: <strong style={{ color: '#006e2f', fontFamily: 'monospace' }}>{selected.order_number}</strong> &nbsp;·&nbsp; Customer: <strong>{selected.customer_name}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {statusKeys.map(s => {
                const sc = STATUS_COLORS[s] || { bg: '#f1f5f9', text: '#6b7280' };
                const active = selected.status === s;
                return (
                  <button key={s} disabled={updating} onClick={() => handleStatusChange(selected.id, s)}
                    style={{
                      padding: '11px 12px', borderRadius: '10px',
                      border: `2px solid ${active ? sc.text : '#E2E8F0'}`,
                      cursor: updating ? 'not-allowed' : 'pointer',
                      backgroundColor: active ? sc.bg : 'white',
                      color: active ? sc.text : '#6b7280',
                      fontWeight: 600, fontSize: '13px', textTransform: 'capitalize',
                      opacity: updating ? 0.6 : 1,
                      transition: 'all 0.15s',
                    }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setSelected(null)}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, color: '#6b7280', fontSize: '14px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
