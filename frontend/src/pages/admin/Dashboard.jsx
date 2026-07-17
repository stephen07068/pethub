import React, { useEffect, useState } from 'react';
import { MdPayments, MdShoppingBag, MdCategory, MdWarehouse, MdVisibility } from 'react-icons/md';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState({
    totals: { orders: 0, sales: 0, products: 0, categories: 0, revenue: 0 },
    order_status_counts: {},
    low_stock_count: 0,
    recent_orders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => { setData(res.data || res); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { title: 'Total Revenue', value: `$${(data.totals?.sales || 0).toFixed(2)}`, icon: MdPayments, iconBg: '#dcfce7', iconColor: '#15803d' },
    { title: 'Total Orders', value: data.totals?.orders || 0, icon: MdShoppingBag, iconBg: '#dbeafe', iconColor: '#1d4ed8' },
    { title: 'Products', value: data.totals?.products || 0, icon: MdCategory, iconBg: '#ede9fe', iconColor: '#6d28d9' },
    { title: 'Low Stock Items', value: data.low_stock_count || 0, icon: MdWarehouse, iconBg: '#fee2e2', iconColor: '#991b1b' },
  ];

  const STATUS_COLORS = {
    pending:    { bg: '#fef9c3', text: '#854d0e' },
    paid:       { bg: '#dcfce7', text: '#15803d' },
    processing: { bg: '#dbeafe', text: '#1d4ed8' },
    shipped:    { bg: '#ede9fe', text: '#6d28d9' },
    delivered:  { bg: '#d1fae5', text: '#065f46' },
    cancelled:  { bg: '#fee2e2', text: '#991b1b' },
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#121c2a', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Welcome back. Here's what's happening with your store today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {stats.map(stat => (
          <div key={stat.title} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <stat.icon size={22} color={stat.iconColor} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: 0 }}>{stat.title}</p>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#121c2a', margin: 0 }}>{isLoading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#121c2a', margin: 0 }}>Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            style={{ fontSize: '13px', fontWeight: 600, color: '#006e2f', background: 'none', border: 'none', cursor: 'pointer' }}>
            View all →
          </button>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Order #', 'Customer', 'Date', 'Status', 'Total', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : (data.recent_orders?.length === 0) ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No orders yet. Orders appear here after customers complete checkout.</td></tr>
              ) : data.recent_orders?.map(order => {
                const sc = STATUS_COLORS[order.status] || { bg: '#f1f5f9', text: '#6b7280' };
                return (
                  <tr key={order.order_number} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#006e2f', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{order.order_number}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#121c2a', fontWeight: 500, whiteSpace: 'nowrap' }}>{order.customer_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: sc.bg, color: sc.text, whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#121c2a', fontSize: '14px', whiteSpace: 'nowrap' }}>${(order.total_amount || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => navigate('/admin/orders')} title="View Orders"
                        style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', color: '#6b7280' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8f5ee'; e.currentTarget.style.color = '#006e2f'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#6b7280'; }}>
                        <MdVisibility size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
