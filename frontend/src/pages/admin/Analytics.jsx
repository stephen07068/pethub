import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdCategory, MdStarRate } from 'react-icons/md';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/api';

export default function AdminAnalytics() {
  const [salesData, setSalesData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [revenueByCat, setRevenueByCat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getSalesAnalytics(30).catch(() => []),
      adminApi.getBestSellersAnalytics(5).catch(() => []),
      adminApi.getRevenueByCategoryAnalytics().catch(() => [])
    ]).then(([resSales, resBest, resCat]) => {
      setSalesData(extractData(resSales));
      setBestSellers(extractData(resBest));
      setRevenueByCat(extractData(resCat));
      setIsLoading(false);
    });
  }, []);

  const extractData = (res) => {
    const body = res?.data || res;
    const items = body?.data || body;
    return Array.isArray(items) ? items : (items ? [items] : []);
  };

  const sectionStyle = { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0px 4px 20px rgba(31,41,55,0.04)', border: '1px solid #E2E8F0', flex: 1 };
  
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline-lg" style={{ color: '#121c2a' }}>Analytics & Reporting</h1>
          <p style={{ color: '#5d5f5f' }} className="font-body-md">Store performance at a glance</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#5d5f5f' }}>Loading reports...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Best Sellers */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef9c3', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdStarRate size={24} />
              </div>
              <h2 className="font-headline-md" style={{ color: '#121c2a' }}>Top 5 Best Sellers</h2>
            </div>
            
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(241,245,249,0.5)', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '12px 16px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Total Sold</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.length === 0 ? (
                  <tr><td colSpan="2" style={{ padding: '24px', textAlign: 'center', color: '#5d5f5f' }}>No sales data yet.</td></tr>
                ) : bestSellers.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#121c2a' }}>{item.product_name}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#006e2f' }}>{item.total_quantity_sold} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Revenue by Category */}
            <div style={{ ...sectionStyle, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff4ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdCategory size={24} />
                </div>
                <h2 className="font-headline-md" style={{ color: '#121c2a' }}>Revenue by Category</h2>
              </div>
              
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '12px 16px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByCat.length === 0 ? (
                    <tr><td colSpan="2" style={{ padding: '24px', textAlign: 'center', color: '#5d5f5f' }}>No data.</td></tr>
                  ) : revenueByCat.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{item.category.replace(/-/g, ' ')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#121c2a' }}>${parseFloat(item.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Sales History */}
            <div style={{ ...sectionStyle, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdTrendingUp size={24} />
                </div>
                <h2 className="font-headline-md" style={{ color: '#121c2a' }}>Sales (Last 30 Days)</h2>
              </div>
              
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 16px', color: '#5d5f5f', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.length === 0 ? (
                    <tr><td colSpan="2" style={{ padding: '24px', textAlign: 'center', color: '#5d5f5f' }}>No data.</td></tr>
                  ) : salesData.slice(0, 10).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 16px' }}>{item.date}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#121c2a' }}>${parseFloat(item.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
