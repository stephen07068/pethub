import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

const CART_TOKEN_KEY = 'psh_cart_token';

// Backend response shape (after axios extract — i.e. res is already res.data from axios):
// POST /api/cart/new  → { success, data: { items, subtotal, shipping_fee, grand_total, token }, meta: { cart_token } }
// GET  /api/cart/     → { success, data: { items, subtotal, shipping_fee, grand_total } }
// POST /api/cart/items → { success, data: { items, subtotal, shipping_fee, grand_total } }

const parseCart  = (res) => res?.data  || null;
const parseToken = (res) => res?.meta?.cart_token || res?.data?.token || null;

export function CartProvider({ children }) {
  const [cartToken, setCartToken] = useState(() => localStorage.getItem(CART_TOKEN_KEY) || null);
  const [cartData, setCartData]   = useState({ items: [], subtotal: 0, shipping_fee: 20, grand_total: 20 });
  const [isLoading, setIsLoading] = useState(false);

  // Initialise cart on mount
  useEffect(() => {
    if (!cartToken) {
      // Create a new cart
      api.newCart()
        .then(res => {
          const tok  = parseToken(res);
          const cart = parseCart(res);
          if (tok) {
            localStorage.setItem(CART_TOKEN_KEY, tok);
            setCartToken(tok);
          }
          if (cart?.items !== undefined) setCartData(cart);
        })
        .catch(() => {/* backend offline — stay silent */});
    } else {
      // Load existing cart
      api.getCart(cartToken)
        .then(res => {
          const cart = parseCart(res);
          if (cart?.items !== undefined) setCartData(cart);
        })
        .catch(() => {
          // Token may be stale — clear it
          localStorage.removeItem(CART_TOKEN_KEY);
        });
    }
  }, []); // eslint-disable-line

  const _refresh = (res) => {
    const cart = parseCart(res);
    if (cart?.items !== undefined) setCartData(cart);
    return res;
  };

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!cartToken) return;
    setIsLoading(true);
    try {
      const res = await api.addToCart(cartToken, product.id, quantity);
      _refresh(res);
    } finally {
      setIsLoading(false);
    }
  }, [cartToken]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!cartToken) return;
    const res = await api.removeCartItem(cartToken, itemId);
    _refresh(res);
  }, [cartToken]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (!cartToken) return;
    const res = await api.updateCartItem(cartToken, itemId, quantity);
    _refresh(res);
  }, [cartToken]);

  const clearCart = useCallback(async () => {
    if (!cartToken) return;
    const res = await api.clearCart(cartToken);
    _refresh(res);
  }, [cartToken]);

  const itemCount = cartData.items?.reduce((n, i) => n + (i.quantity || 0), 0) || 0;
  const subtotal  = cartData.subtotal || 0;

  return (
    <CartContext.Provider value={{
      cartToken,
      cartItems: cartData.items || [],
      subtotal,
      shippingFee: cartData.shipping_fee || 20,
      grandTotal:  cartData.grand_total  || subtotal + 20,
      itemCount,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
