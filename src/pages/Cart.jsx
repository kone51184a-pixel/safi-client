import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/UI';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { deliveryFee } = useSettings();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>🛒</div>
        <h3 style={{ fontSize: 17, marginBottom: 8 }}>Ton panier est vide</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>Parcours le catalogue pour ajouter des produits.</p>
        <Link to="/catalogue"><Button variant="outline">Voir le catalogue</Button></Link>
      </div>
    );
  }

  const total = subtotal + deliveryFee;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Mon panier ({items.length})</h2>

      {items.map(({ product, quantity }) => (
        <div key={product.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '🍅'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>{product.vendor_name || 'Vendeur SAFi'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => updateQuantity(product.id, quantity - 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--card)', fontSize: 12 }}>−</button>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12.5 }}>{quantity} {product.unit}</span>
              <button onClick={() => updateQuantity(product.id, quantity + 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--card)', fontSize: 12 }}>+</button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600 }}>{(product.price * quantity).toLocaleString()} F</div>
            <button onClick={() => removeItem(product.id)} style={{ background: 'none', border: 'none', color: 'var(--tomato)', fontSize: 11, marginTop: 4 }}>Retirer</button>
          </div>
        </div>
      ))}

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 18, marginTop: 20 }}>
        <SummaryLine label="Sous-total" value={subtotal} />
        <SummaryLine label="Frais de livraison" value={deliveryFee} />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px dashed var(--line)', fontWeight: 700, fontSize: 15 }}>
          <span>Total</span><span className="mono">{total.toLocaleString()} F</span>
        </div>
      </div>

      <Button style={{ width: '100%', marginTop: 18 }} onClick={() => navigate('/commande')}>Passer à la commande</Button>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 9 }}>
      <span>{label}</span><span className="mono">{value.toLocaleString()} F</span>
    </div>
  );
}
