import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { Button, formatUnit } from '../components/UI';

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState('');
  const [isBio, setIsBio] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getProduct(token, id).then(setProduct).finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>;
  if (!product) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Produit introuvable.</p>;

  const hasBioOption = Boolean(product.price_bio);
  const isVegetable = product.category_name === 'Légumes';
  const selectedPrice = (isBio && product.price_bio) ? Number(product.price_bio) : Number(product.price);
  const budgetAmount = Number(budget);
  const budgetQuantity = budgetAmount > 0 && selectedPrice > 0 ? budgetAmount / selectedPrice : 0;
  const usesWholeUnits = product.unit === 'piece' || product.unit === 'pièce' || product.unit === 'article';
  const budgetIsValid = !isVegetable || (budgetQuantity > 0 && (!usesWholeUnits || Number.isInteger(budgetQuantity)));

  function handleAddToCart() {
    addItem(product, isVegetable ? budgetQuantity : quantity, isBio);
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
            {Number(product.price).toLocaleString()} F / {formatUnit(product.unit)}
          </div>
          {hasBioOption && (
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--leaf)', fontWeight: 600, marginTop: 2 }}>
              🌱 Bio : {Number(product.price_bio).toLocaleString()} F / {formatUnit(product.unit)}
            </div>
          )}
        </div>
      </div>

      {hasBioOption && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8 }}>Version :</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setIsBio(false)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${!isBio ? 'var(--tomato)' : 'var(--line)'}`,
                background: !isBio ? 'rgba(198,71,63,0.06)' : 'var(--card)',
                color: 'var(--ink)',
              }}
            >
              Normal — {Number(product.price).toLocaleString()} F
            </button>
            <button
              type="button"
              onClick={() => setIsBio(true)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${isBio ? 'var(--leaf)' : 'var(--line)'}`,
                background: isBio ? 'rgba(63,122,84,0.08)' : 'var(--card)',
                color: isBio ? 'var(--leaf-deep)' : 'var(--ink)',
              }}
            >
              🌱 Bio — {Number(product.price_bio).toLocaleString()} F
            </button>
          </div>
        </div>
      )}

      {isVegetable ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8 }}>
            Quel montant veux-tu de {product.name.toLowerCase()} ?
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min="1"
              step="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ex : 1000"
              style={{ flex: 1, padding: '11px 12px', borderRadius: 9, border: '1.5px solid var(--line)', fontSize: 14, background: 'var(--cream)', color: 'var(--ink)' }}
            />
            <span style={{ fontWeight: 700, color: 'var(--tomato)' }}>FCFA</span>
          </div>
          {budgetQuantity > 0 && (
            <p style={{ fontSize: 12, color: budgetIsValid ? 'var(--success)' : 'var(--tomato)', marginTop: 8 }}>
              {budgetIsValid
                ? `Cela correspond à ${budgetQuantity} ${formatUnit(product.unit, budgetQuantity)}.`
                : `Le montant doit être un multiple de ${selectedPrice.toLocaleString()} F pour obtenir un nombre entier d'articles.`}
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)' }}>Quantité :</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card)' }}>−</button>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14 }}>{quantity} {formatUnit(product.unit, quantity)}</span>
            <button onClick={() => setQuantity(quantity + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card)' }}>+</button>
          </div>
        </div>
      )}

      {product.description && (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>
      )}

      <Button onClick={handleAddToCart} disabled={!budgetIsValid} style={{ width: '100%' }}>Ajouter au panier</Button>
    </div>
  );
}