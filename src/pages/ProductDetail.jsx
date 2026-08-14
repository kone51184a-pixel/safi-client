import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { Button } from '../components/UI';

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getProduct(token, id).then(setProduct).finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>;
  if (!product) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Produit introuvable.</p>;

  function handleAddToCart() {
    addItem(product, quantity);
    navigate('/panier');
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '30px 24px' }}>
      <div style={{ height: 260, background: 'var(--sand)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, marginBottom: 20, overflow: 'hidden' }}>
        {product.photo_url ? (
          <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : '🍅'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22 }}>{product.name}</h2>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: 'var(--tomato)', fontWeight: 600, marginTop: 4 }}>
            {Number(product.price).toLocaleString()} F / {product.unit}
          </div>
          {product.price_bio && (
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--leaf)', fontWeight: 600, marginTop: 2 }}>
              🌱 Bio : {Number(product.price_bio).toLocaleString()} F / {product.unit}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)' }}>Quantité :</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card)' }}>−</button>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14 }}>{quantity} {product.unit}</span>
          <button onClick={() => setQuantity(quantity + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card)' }}>+</button>
        </div>
      </div>

      {product.description && (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>
      )}

      <Button onClick={handleAddToCart} style={{ width: '100%' }}>Ajouter au panier</Button>
    </div>
  );
}
