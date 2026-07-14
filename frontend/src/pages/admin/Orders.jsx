import React, { useState, useEffect } from 'react';
import { MdSearch, MdVisibility, MdEdit } from 'react-icons/md';
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
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
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

  const statusKeys = ['pending','paid','processing','shipped','delivered','cancelled'];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="font-headline-lg" style={{ color: '#121c2a' }}>Orders</h1>
          <p style={{ color: '#5d5f5f' }}>Manage and track customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(31,41,55,.04)', border: '1px solid #E2E8F0', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <MdSearch size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#5d5f5f' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order number or customer…"
            style={{ width: '100%', height: '44px', paddingLeft: '40px', paddingRight: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}
        >
          <option value="">All Statuses</option>
          {statusKeys.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(31,41,55,.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(241,245,249,.5)', borderBottom: '1px solid #E2E8F0' }}>
                {['Order #','Customer','Date','Payment','Status','Total','Actions'].map(h => (
                  <th key={h} style={{ padding: '16px 20px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>Loading orders…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>No orders found. Orders appear here after customers complete checkout.</td></tr>
              ) : orders.map(order => {
                const sc = STATUS_COLORS[order.status] || { bg: '#f1f5f9', text: '#5d5f5f' };
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#006e2f', fontFamily: 'monospace' }}>{order.order_number}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontWeight: 600, color: '#121c2a', fontSize: '14px' }}>{order.customer_name}</p>
                      <p style={{ color: '#5d5f5f', fontSize: '12px' }}>{order.customer_email}</p>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#5d5f5f', fontSize: '13px' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#5d5f5f', fontSize: '13px', textTransform: 'uppercase' }}>{order.payment_method}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#121c2a' }}>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                      <button onClick={() => setSelected(order)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', backgroundColor: 'white', color: '#5d5f5f', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <MdEdit size={14}/> Update
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,.25)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#121c2a', marginBottom: '8px' }}>Update Order Status</h2>
            <p style={{ color: '#5d5f5f', marginBottom: '24px' }}>Order: <strong>{selected.order_number}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {statusKeys.map(s => {
                const sc = STATUS_COLORS[s] || { bg: '#f1f5f9', text: '#5d5f5f' };
                const active = selected.status === s;
                return (
                  <button key={s} disabled={updating} onClick={() => handleStatusChange(selected.id, s)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: `2px solid ${active ? sc.text : '#E2E8F0'}`, cursor: 'pointer', backgroundColor: active ? sc.bg : 'white', color: active ? sc.text : '#5d5f5f', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', transition: 'all .15s' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setSelected(null)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, color: '#5d5f5f' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
