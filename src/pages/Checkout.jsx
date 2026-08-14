import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../api/client';
import { Button, Field, inputStyle } from '../components/UI';

export default function Checkout() {
  const { token } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { deliveryFee, tvaRate, orangeMoneyNumber, waveNumber } = useSettings();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('orange_money');
  const [wantsBio, setWantsBio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tvaAmount = Math.round(subtotal * (tvaRate / 100));
  const total = subtotal + deliveryFee + tvaAmount;

  const PAYMENT_METHODS = [
    { id: 'orange_money', label: 'Orange Money', icon: 'OM', color: 'var(--tomato)', number: orangeMoneyNumber },
    { id: 'wave', label: 'Wave', icon: 'W', color: '#1DA1F2', number: waveNumber },
    { id: 'cash_on_delivery', label: 'Paiement à la livraison', icon: '₣', color: 'var(--ochre)', number: null },
  ];
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);

  function copyNumber() {
    if (!selectedMethod?.number) return;
    navigator.clipboard.writeText(selectedMethod.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
        <div style={{ background: '#FBEFE0', border: '1px solid #EBCFA0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          {selectedMethod?.number ? (
            <>
              <p style={{ fontSize: 12, color: '#8A6116', marginBottom: 8 }}>
                Envoyez <strong>{total.toLocaleString()} FCFA</strong> via {selectedMethod.label} au numéro :
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: '#8A6116' }}>{selectedMethod.number}</span>
                <button type="button" onClick={copyNumber} style={{ background: '#8A6116', color: 'white', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#8A6116', marginTop: 8 }}>
                Une fois le dépôt fait, confirme ta commande ci-dessous — nous vérifions la réception avant préparation.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: '#8A6116' }}>Numéro {selectedMethod.label} pas encore configuré — contacte-nous directement.</p>
          )}
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, margin: '18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>Articles</span><span className="mono">{subtotal.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>Livraison</span><span className="mono">{deliveryFee.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <span>TVA ({tvaRate}%)</span><span className="mono">{tvaAmount.toLocaleString()} F</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--line)', fontWeight: 700, fontSize: 14 }}>
          <span>Total à payer</span><span className="mono">{total.toLocaleString()} F</span>
        </div>
      </div>

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
