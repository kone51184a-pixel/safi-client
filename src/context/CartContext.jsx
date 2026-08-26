import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

// Clé unique par produit + statut bio, pour que "Tomates" (normal) et "Tomates" (bio)
// puissent coexister comme deux lignes distinctes dans le panier.
function cartKey(productId, isBio) {
  return `${productId}:${isBio ? 'bio' : 'std'}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { product, quantity, isBio }

  function addItem(product, quantity = 1, isBio = false) {
    setItems((prev) => {
      const key = cartKey(product.id, isBio);
      const existing = prev.find((i) => cartKey(i.product.id, i.isBio) === key);
      if (existing) {
        return prev.map((i) =>
          cartKey(i.product.id, i.isBio) === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity, isBio }];
    });
  }

  function updateQuantity(productId, isBio, quantity) {
    const key = cartKey(productId, isBio);
    if (quantity <= 0) {
      removeItem(productId, isBio);
      return;
    }
    setItems((prev) => prev.map((i) => (cartKey(i.product.id, i.isBio) === key ? { ...i, quantity } : i)));
  }

  function removeItem(productId, isBio) {
    const key = cartKey(productId, isBio);
    setItems((prev) => prev.filter((i) => cartKey(i.product.id, i.isBio) !== key));
  }

  function clearCart() {
    setItems([]);
  }

  function unitPrice(item) {
    return (item.isBio && item.product.price_bio) ? Number(item.product.price_bio) : Number(item.product.price);
  }

  const subtotal = items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, unitPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}