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
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tvaAmount = Math.round(subtotal * (tvaRate / 100));
  const total = subtotal + deliveryFee + tvaAmount;

  // Paiement à la livraison : rien à vérifier avant de commander.
  // Toute autre méthode : le client doit avoir renseigné une référence de transaction
  // d'au moins 6 caractères ET coché la case de confirmation avant de pouvoir valider sa commande.
  const requiresProof = method !== 'cash_on_delivery';
  const paymentReady = !requiresProof || (paymentReference.trim().length >= 6 && paymentConfirmed);
  const canSubmit = address.trim() !== '' && paymentReady && !loading;

  async function handleConfirm() {
    if (!paymentReady) {
      setError('Merci de renseigner la référence de ta transaction et de confirmer le paiement avant de commander.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(token, {
        order_type: 'catalog',
        // Chaque article porte déjà son propre statut bio (choisi sur la fiche produit) —
        // plus besoin d'un choix global pour toute la commande.
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity, is_bio: i.isBio })),
        delivery_fee: deliveryFee,
        delivery_address: address,
        payment_method: method,
        payment_reference: requiresProof ? paymentReference.trim() : null,
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

      <PaymentPanel
        amount={total}
        method={method}
        setMethod={setMethod}
        paymentReference={paymentReference}
        setPaymentReference={setPaymentReference}
        paymentConfirmed={paymentConfirmed}
        setPaymentConfirmed={setPaymentConfirmed}
      />

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Button style={{ width: '100%' }} onClick={handleConfirm} disabled={!canSubmit}>
        {loading ? 'Confirmation…' : 'Confirmer la commande'}
      </Button>
      {requiresProof && !paymentReady && (
        <p style={{ fontSize: 11, color: 'var(--tomato)', textAlign: 'center', marginTop: 8 }}>
          Renseigne la référence de paiement et coche la case pour pouvoir commander.
        </p>
      )}
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 10 }}>
        Tu pourras annuler ta commande depuis son suivi tant qu'elle n'est pas en livraison.
      </p>
    </div>
  );
}