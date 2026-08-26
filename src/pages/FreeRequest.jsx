import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../api/client';
import { Button, Field, inputStyle } from '../components/UI';
import PaymentPanel from '../components/PaymentPanel';

const MIN_KG = 40;

export default function FreeRequest() {
  const { token } = useAuth();
  const { deliveryFee, tvaRate } = useSettings();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]); // [{ product, quantity, isBio }]
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [addIsBio, setAddIsBio] = useState(false);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('wave');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.getProducts(token).then(setProducts).catch(() => {});
  }, [token]);

  function itemPrice(i) {
    return (i.isBio && i.product.price_bio) ? Number(i.product.price_bio) : Number(i.product.price);
  }

  const totalKg = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0);
  const tvaAmount = Math.round(subtotal * (tvaRate / 100));
  const total = subtotal + deliveryFee + tvaAmount;
  const reachedMin = totalKg >= MIN_KG;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const canAddBio = Boolean(selectedProduct?.price_bio);

  // Paiement à la livraison : rien à vérifier avant de commander.
  // Toute autre méthode : référence de transaction (6 caractères min.) + case cochée obligatoires.
  const requiresProof = method !== 'cash_on_delivery';
  const paymentReady = !requiresProof || (paymentReference.trim().length >= 6 && paymentConfirmed);
  const canSubmit = reachedMin && items.length > 0 && address.trim() !== '' && paymentReady && !loading;

  function addItem() {
    if (!selectedProductId || !addQuantity || Number(addQuantity) <= 0) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const isBio = canAddBio ? addIsBio : false;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.isBio === isBio);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + Number(addQuantity) } : i));
      }
      return [...prev, { product, quantity: Number(addQuantity), isBio }];
    });
    setSelectedProductId('');
    setAddQuantity('');
    setAddIsBio(false);
  }

  function removeItem(productId, isBio) {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.isBio === isBio)));
  }

  async function handleSubmit() {
    if (!canSubmit) {
      if (!paymentReady) {
        setError('Merci de renseigner la référence de ta transaction et de confirmer le paiement avant de commander.');
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(token, {
        order_type: 'free_request',
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity, is_bio: i.isBio })),
        free_request_description: notes,
        delivery_fee: deliveryFee,
        delivery_address: address,
        payment_method: method,
        payment_reference: requiresProof ? paymentReference.trim() : null,
      });
      navigate('/confirmation', { state: { orderNumber: order.order_number, orderId: order.id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Connecte-toi pour faire une demande.</p>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20 }}>Commande en gros</h2>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4, marginBottom: 22 }}>
        Choisis tes produits et quantités — minimum {MIN_KG} kg au total. Le prix se calcule automatiquement.
      </p>

      <Field label="Ajouter un produit">
        <div style={{ display: 'flex', gap: 8, marginBottom: canAddBio ? 8 : 0 }}>
          <select style={{ ...inputStyle, flex: 1 }} value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); setAddIsBio(false); }}>
            <option value="">— Choisir —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({Number(p.price).toLocaleString()} F/{p.unit})</option>
            ))}
          </select>
          <input
            style={{ ...inputStyle, width: 80 }}
            type="number"
            placeholder="kg"
            value={addQuantity}
            onChange={(e) => setAddQuantity(e.target.value)}
          />
          <button type="button" onClick={addItem} style={{ background: 'var(--leaf)', color: 'white', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+</button>
        </div>
        {canAddBio && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={addIsBio} onChange={(e) => setAddIsBio(e.target.checked)} />
            <span style={{ fontSize: 12, color: 'var(--leaf-deep)', fontWeight: 600 }}>
              🌱 Version bio ({Number(selectedProduct.price_bio).toLocaleString()} F/{selectedProduct.unit})
            </span>
          </label>
        )}
      </Field>

      {items.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {items.map((i) => (
            <div key={`${i.product.id}:${i.isBio ? 'bio' : 'std'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i.product.name}
                  {i.isBio && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--leaf-deep)', background: 'rgba(63,122,84,0.1)', padding: '1px 6px', borderRadius: 20 }}>🌱 Bio</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{i.quantity} {i.product.unit}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: 13 }}>
                  {(itemPrice(i) * i.quantity).toLocaleString()} F
                </span>
                <button type="button" onClick={() => removeItem(i.product.id, i.isBio)} style={{ background: 'none', border: 'none', color: 'var(--tomato)', fontSize: 11, cursor: 'pointer' }}>Retirer</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: reachedMin ? 'var(--success)' : 'var(--tomato)' }}>
            Total : {totalKg} kg {reachedMin ? '✓' : `(encore ${MIN_KG - totalKg} kg pour atteindre le minimum de ${MIN_KG} kg)`}
          </div>
        </div>
      )}

      <Field label="Notes complémentaires (optionnel)">
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: 'none' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex : horaire de livraison préféré, précisions sur la qualité…"
        />
      </Field>

      <Field label="Adresse de livraison">
        <input style={inputStyle} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex : Restaurant Teriya, Hamdallaye" />
      </Field>

      {items.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
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
      )}

      {reachedMin && items.length > 0 && (
        <PaymentPanel
          amount={total}
          method={method}
          setMethod={setMethod}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          paymentConfirmed={paymentConfirmed}
          setPaymentConfirmed={setPaymentConfirmed}
        />
      )}

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Button
        variant="leaf"
        style={{ width: '100%' }}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {loading ? 'Envoi…' : 'Confirmer la commande'}
      </Button>
      {reachedMin && items.length > 0 && requiresProof && !paymentReady && (
        <p style={{ fontSize: 11, color: 'var(--tomato)', textAlign: 'center', marginTop: 8 }}>
          Renseigne la référence de paiement et coche la case pour pouvoir commander.
        </p>
      )}
    </div>
  );
}