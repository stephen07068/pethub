import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryPage from './pages/CategoryPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CryptoPayment from './pages/CryptoPayment';
import DeliveryAddress from './pages/DeliveryAddress';
import OrderSuccess from './pages/OrderSuccess';
import GiftCardPayment from './pages/GiftCardPayment';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminInventory from './pages/admin/Inventory';
import AdminSettings from './pages/admin/Settings';
import AdminCategories from './pages/admin/Categories';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLogin from './pages/admin/Login';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const GenericPaymentPage = ({ title, icon }) => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '64px', textAlign: 'center' }}>
    <div style={{ fontSize: '64px' }}>{icon}</div>
    <h1 style={{ fontFamily: 'Hanken Grotesk', fontSize: '32px', color: '#121c2a', fontWeight: 700 }}>{title}</h1>
    <p style={{ color: '#5d5f5f', fontSize: '18px', maxWidth: '480px' }}>This payment method integration would be configured here. For demo purposes, proceed to delivery.</p>
    <a href="/delivery" style={{ backgroundColor: '#006e2f', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
      Continue to Delivery →
    </a>
  </div>
);

const PublicLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/categories" element={<PublicLayout><Categories /></PublicLayout>} />
        <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/checkout/crypto" element={<PublicLayout><CryptoPayment /></PublicLayout>} />
        <Route path="/checkout/apple-pay" element={<PublicLayout><GenericPaymentPage title="Apple Pay" icon="🍎" /></PublicLayout>} />
        <Route path="/checkout/google-pay" element={<PublicLayout><GenericPaymentPage title="Google Pay" icon="🔷" /></PublicLayout>} />
        <Route path="/checkout/gift-card" element={<PublicLayout><GiftCardPayment /></PublicLayout>} />
        <Route path="/delivery" element={<PublicLayout><DeliveryAddress /></PublicLayout>} />
        <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Routes>
    </Router>
  );
}

export default App;
