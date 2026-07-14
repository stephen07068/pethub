import React, { useEffect, useState } from 'react';
import { MdPayments, MdShoppingBag, MdPersonAdd, MdTrendingUp, MdVisibility } from 'react-icons/md';
import { api, adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState({
    totals: { orders: 0, sales: 0, products: 0, categories: 0, revenue: 0 },
    order_status_counts: {},
    low_stock_count: 0,
    recent_orders: [],
    recent_payments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => {
        setData(res.data || res);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { title: 'Total Sales', value: `$${(data.totals?.sales || 0).toFixed(2)}`, trend: '', icon: MdPayments, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Products', value: data.totals?.products || '0', trend: '', icon: MdShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Orders', value: data.totals?.orders || '0', trend: '', icon: MdPersonAdd, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Low Stock', value: data.low_stock_count || '0', trend: '', icon: MdVisibility, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Dashboard Overview</h1>
          <p className="text-secondary text-body-md mt-1">Welcome back. Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.title} className="bg-white p-8 rounded-xl shadow-card border border-border-light group hover:border-primary/20 transition-all hover-lift">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-label-sm font-medium">
                  <MdTrendingUp /> {stat.trend}
                </div>
              )}
            </div>
            <h3 className="text-secondary font-label-lg mb-1">{stat.title}</h3>
            <p className="font-headline-lg text-[32px] text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-card border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light flex justify-between items-center bg-surface-subtle/30">
          <h2 className="font-headline-md text-headline-md text-on-surface">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/50 text-secondary font-label-lg text-[12px] uppercase tracking-wider border-b border-border-light">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-secondary">Loading...</td></tr>
              ) : data.recent_orders?.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-secondary">No orders yet. Orders appear here after customers complete checkout.</td></tr>
              ) : data.recent_orders?.map(order => (
                <tr key={order.order_number} className="hover:bg-surface-subtle/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-on-surface">{order.order_number}</td>
                  <td className="px-6 py-4 text-body-md">{order.customer_name}</td>
                  <td className="px-6 py-4 text-secondary text-body-md">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface">${(order.total_amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate('/admin/orders')}
                      className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface transition-colors">
                      <MdVisibility size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
