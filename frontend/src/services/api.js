import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Public (no auth) ──────────────────────────────────────────────────────────
const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ── Admin (JWT auth) ──────────────────────────────────────────────────────────
const adminClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('psh_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('psh_admin_token');
      // Don't redirect if it's the login request failing
      if (!err.config?.url?.includes('/auth/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Cart client — sends X-Cart-Token header automatically ────────────────────
const cartClient = (cartToken) => ({
  get:    (url, cfg = {}) => publicClient.get(url, { ...cfg, headers: { ...cfg.headers, 'X-Cart-Token': cartToken } }),
  post:   (url, data, cfg = {}) => publicClient.post(url, data, { ...cfg, headers: { ...cfg.headers, 'X-Cart-Token': cartToken } }),
  put:    (url, data, cfg = {}) => publicClient.put(url, data, { ...cfg, headers: { ...cfg.headers, 'X-Cart-Token': cartToken } }),
  patch:  (url, data, cfg = {}) => publicClient.patch(url, data, { ...cfg, headers: { ...cfg.headers, 'X-Cart-Token': cartToken } }),
  delete: (url, cfg = {}) => publicClient.delete(url, { ...cfg, headers: { ...cfg.headers, 'X-Cart-Token': cartToken } }),
});

// ── Helper to extract .data from response ────────────────────────────────────
const extract = (res) => res.data;


// =============================================================================
//  PUBLIC API
// =============================================================================

export const api = {
  // Products
  getProducts: (params = {}) =>
    publicClient.get('/products', { params }).then(extract),

  getProduct: (id) =>
    publicClient.get(`/products/${id}`).then(extract),

  getProductBySlug: (slug) =>
    publicClient.get(`/products/slug/${slug}`).then(extract),

  getFeaturedProducts: (limit = 8) =>
    publicClient.get('/products/featured', { params: { limit } }).then(extract),

  getNewArrivals: (limit = 8) =>
    publicClient.get('/products/new-arrivals', { params: { limit } }).then(extract),

  searchProducts: (q, page = 1, per_page = 12) =>
    publicClient.get('/products/search', { params: { q, page, per_page } }).then(extract),

  getProductsByCategory: (slug, page = 1, per_page = 12) =>
    publicClient.get(`/products/category/${slug}`, { params: { page, per_page } }).then(extract),

  // Categories
  getCategories: () =>
    publicClient.get('/categories').then(extract),

  getCategory: (id) =>
    publicClient.get(`/categories/${id}`).then(extract),

  // Store Settings
  getSettings: () =>
    publicClient.get('/settings').then(extract),

  // Wallets
  getWalletAddress: (coin) =>
    publicClient.get(`/wallets/${coin}`).then(extract),

  getWalletQR: (coin) =>
    `${BASE_URL}/wallets/${coin}/qr`,  // Returns image URL directly

  // Payments
  verifyCryptoPayment: (coin, tx_hash, amount) =>
    publicClient.post('/payments/crypto/verify', { coin, tx_hash, amount }).then(extract),

  applePaySession: (validation_url, domain) =>
    publicClient.post('/payments/apple-pay/session', { validation_url, domain }).then(extract),

  googlePaySession: (total) =>
    publicClient.post('/payments/google-pay/session', { total }).then(extract),

  redeemGiftCard: (code) =>
    publicClient.post('/payments/gift-card/redeem', { code }).then(extract),

  // ── Cart (guest) ────────────────────────────────────────────────────────────
  newCart: () =>
    publicClient.post('/cart/new').then(extract),

  getCart: (cartToken) =>
    cartClient(cartToken).get('/cart').then(extract),

  addToCart: (cartToken, product_id, quantity = 1) =>
    cartClient(cartToken).post('/cart/items', { product_id, quantity }).then(extract),

  updateCartItem: (cartToken, itemId, quantity) =>
    cartClient(cartToken).patch(`/cart/items/${itemId}`, { quantity }).then(extract),

  removeCartItem: (cartToken, itemId) =>
    cartClient(cartToken).delete(`/cart/items/${itemId}`).then(extract),

  clearCart: (cartToken) =>
    cartClient(cartToken).delete('/cart/clear').then(extract),

  validateCart: (cartToken) =>
    cartClient(cartToken).post('/checkout/validate', { cart_token: cartToken }).then(extract),

  // ── Checkout ─────────────────────────────────────────────────────────────────
  initCryptoPayment: (cartToken, coin) =>
    publicClient.post('/checkout/crypto/init', { cart_token: cartToken, coin }).then(extract),

  verifyCryptoTx: (coin, tx_hash, usd_amount = null, customer_email = null) =>
    publicClient.post('/checkout/crypto/verify', { coin, tx_hash, usd_amount, customer_email }).then(extract),

  initApplePay: (cartToken) =>
    publicClient.post('/checkout/apple-pay/init', { cart_token: cartToken }).then(extract),

  confirmApplePay: (session_id, paymentData) =>
    publicClient.post('/checkout/apple-pay/confirm', { session_id, ...paymentData }).then(extract),

  initGooglePay: (cartToken) =>
    publicClient.post('/checkout/google-pay/init', { cart_token: cartToken }).then(extract),

  confirmGooglePay: (token, paymentData) =>
    publicClient.post('/checkout/google-pay/confirm', { token, ...paymentData }).then(extract),

  submitGiftCard: (formData) =>
    publicClient.post('/checkout/gift-card/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(extract),

  placeOrder: (cartToken, address, paymentMethod, paymentReference, currency = 'USD') =>
    publicClient.post('/checkout/place-order', {
      cart_token: cartToken,
      address,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      currency,
    }).then(extract),

  getOrderByNumber: (orderNumber) =>
    publicClient.get(`/checkout/order/${orderNumber}`).then(extract),

  // ── Legacy helpers (used by existing pages) ──────────────────────────────────
  getOrders: async () => {
    const { orders } = await import('../data/orders.js');
    return { success: true, data: orders };
  },

  createOrder: (cartToken, address, paymentMethod, paymentReference, currency) =>
    api.placeOrder(cartToken, address, paymentMethod, paymentReference, currency),

  // Contact form
  submitContactForm: (data) =>
    publicClient.post('/contact', data).then(extract),
};

// =============================================================================
//  ADMIN API (JWT protected)
// =============================================================================

export const adminApi = {
  // Auth
  login: (email, password) =>
    adminClient.post('/auth/login', { email, password }).then(extract),

  logout: () =>
    adminClient.post('/auth/logout').then(extract),

  me: () =>
    adminClient.get('/auth/me').then(extract),

  // Products
  getProducts: (params = {}) =>
    adminClient.get('/admin/products', { params }).then(extract),

  createProduct: (data) =>
    adminClient.post('/admin/products', data).then(extract),

  updateProduct: (id, data) =>
    adminClient.put(`/admin/products/${id}`, data).then(extract),

  deleteProduct: (id) =>
    adminClient.delete(`/admin/products/${id}`).then(extract),

  updateStock: (id, stock) =>
    adminClient.patch(`/admin/products/${id}/stock`, { stock }).then(extract),

  toggleFeatured: (id) =>
    adminClient.patch(`/admin/products/${id}/feature`).then(extract),

  uploadProductImage: (id, formData) =>
    adminClient.post(`/admin/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(extract),

  deleteProductImage: (productId, imageId) =>
    adminClient.delete(`/admin/products/${productId}/images/${imageId}`).then(extract),

  // Categories (admin)
  createCategory: (data) =>
    adminClient.post('/categories', data).then(extract),

  updateCategory: (id, data) =>
    adminClient.put(`/categories/${id}`, data).then(extract),

  deleteCategory: (id) =>
    adminClient.delete(`/categories/${id}`).then(extract),

  // Inventory
  getInventory: (params = {}) =>
    adminClient.get('/admin/products', { params: { ...params, per_page: 200, status: 'all' } }).then(extract),

  // Settings
  updateSettings: (data) =>
    adminClient.put('/settings', data).then(extract),

  // Dashboard
  getDashboard: () =>
    adminClient.get('/admin/dashboard').then(extract),

  // Analytics
  getSalesAnalytics: (days = 30) =>
    adminClient.get('/admin/analytics/sales', { params: { days } }).then(extract),

  getBestSellersAnalytics: (limit = 5) =>
    adminClient.get('/admin/analytics/best-sellers', { params: { limit } }).then(extract),

  getRevenueByCategoryAnalytics: () =>
    adminClient.get('/admin/analytics/revenue-by-category').then(extract),

  // Orders
  getOrders: (params = {}) =>
    adminClient.get('/admin/orders', { params }).then(extract),

  getOrder: (orderNumber) =>
    adminClient.get(`/admin/orders/${orderNumber}`).then(extract),

  updateOrderStatus: (orderId, status) =>
    adminClient.patch(`/admin/orders/${orderId}/status`, { status }).then(extract),

  // Gift Cards
  getGiftCardSubmissions: (status) =>
    adminClient.get('/admin/orders/gift-cards', { params: { status } }).then(extract),

  reviewGiftCard: (submissionId, approved, notes) =>
    adminClient.patch(`/admin/orders/gift-cards/${submissionId}/review`, { approved, notes }).then(extract),
};

export default api;
