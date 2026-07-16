import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../api/client';
import { Button, Field, inputStyle } from '../components/UI';

const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', icon: 'OM', color: 'var(--tomato)' },
  { id: 'moov_money', label: 'Moov Money', icon: 'MM', color: 'var(--indigo)' },
  { id: 'cash_on_delivery', label: 'Paiement à la livraison', icon: '₣', color: 'var(--ochre)' },
];

export default function Checkout() {
  const { token } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { deliveryFee } = useSettings();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('orange_money');
  const [phone, setPhone] = useState('');
  const [wantsBio, setWantsBio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = subtotal + deliveryFee;

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(token, {
        order_type: 'catalog',
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        delivery_fee: deliveryFee,
        wants_bio: wantsBio,
      });
      clearCart();
      navigate('/confirmation', { state: { orderNumber: order.order_number, orderId: order.id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Ton panier est vide.</p>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Finaliser la commande</h2>

      <Field label="Adresse de livraison">
        <input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex : Restaurant Teriya, Hamdallaye" required />
      </Field>

      <div style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 10px' }}>Mode de paiement</div>
      {PAYMENT_METHODS.map((m) => (
        <div
          key={m.id}
          onClick={() => setMethod(m.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 13,
            border: `1.5px solid ${method === m.id ? 'var(--tomato)' : 'var(--line)'}`,
            background: method === m.id ? 'rgba(198,71,63,0.05)' : 'var(--card)',
            borderRadius: 12, marginBottom: 10, cursor: 'pointer'
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 9, background: m.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{m.icon}</div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
        </div>
      ))}

      {method !== 'cash_on_delivery' && (
        <Field label="Numéro Mobile Money">
          <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+223 70 00 00 00" />
        </Field>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 10px' }}>Préférez-vous des produits bio ?</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setWantsBio(true)}
          style={{
            flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: `1.5px solid ${wantsBio === true ? 'var(--leaf)' : 'var(--line)'}`,
            background: wantsBio === true ? 'rgba(63,122,84,0.08)' : 'var(--card)',
            color: wantsBio === true ? 'var(--leaf-deep)' : 'var(--ink)',
          }}
        >
          🌱 Oui, si possible
        </button>
        <button
          type="button"
          onClick={() => setWantsBio(false)}
          style={{
            flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: `1.5px solid ${wantsBio === false ? 'var(--indigo)' : 'var(--line)'}`,
            background: wantsBio === false ? 'rgba(28,37,65,0.05)' : 'var(--card)',
            color: 'var(--ink)',
          }}
        >
          Peu importe
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 16 }}>
        Selon disponibilité chez nos vendeurs — sans surcoût garanti.
      </p>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, margin: '18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>Articles</span><span className="mono">{subtotal.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>Livraison</span><span className="mono">{deliveryFee.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--line)', fontWeight: 700, fontSize: 14 }}>
          <span>Total à payer</span><span className="mono">{total.toLocaleString()} F</span>
        </div>
      </div>

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Button style={{ width: '100%' }} onClick={handleConfirm} disabled={loading}>
        {loading ? 'Confirmation…' : 'Confirmer la commande'}
      </Button>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 10 }}>
        Note MVP : le paiement mobile money réel sera branché en phase 2 (CinetPay/PayDunya). Pour l'instant la commande est enregistrée directement.
      </p>
    </div>
  );
}
