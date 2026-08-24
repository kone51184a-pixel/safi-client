import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../api/client';
import { Button, Field, inputStyle } from '../components/UI';
import PaymentPanel from '../components/PaymentPanel';

export default function Checkout() {
  const { token } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { deliveryFee, tvaRate } = useSettings();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('wave');
  const [wantsBio, setWantsBio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tvaAmount = Math.round(subtotal * (tvaRate / 100));
  const total = subtotal + deliveryFee + tvaAmount;

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(token, {
        order_type: 'catalog',
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        delivery_fee: deliveryFee,
        wants_bio: wantsBio,
        delivery_address: address,
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

      {/* Récapitulatif d'abord, avant tout choix de paiement — produits et livraison toujours séparés */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, margin: '18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>Prix des produits</span><span className="mono">{subtotal.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>Frais de livraison</span><span className="mono">{deliveryFee.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>TVA ({tvaRate}%)</span><span className="mono">{tvaAmount.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--line)', fontWeight: 700, fontSize: 14 }}>
          <span>Total</span><span className="mono">{total.toLocaleString()} F</span>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 10px' }}>Produit bio</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
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
          🌱 Oui
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
          Non
        </button>
      </div>

      <PaymentPanel amount={total} method={method} setMethod={setMethod} />

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Button style={{ width: '100%' }} onClick={handleConfirm} disabled={loading || !address.trim()}>
        {loading ? 'Confirmation…' : 'Confirmer la commande'}
      </Button>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 10 }}>
        Tu pourras annuler ta commande depuis son suivi tant qu'elle n'est pas en livraison.
      </p>
    </div>
  );
}
