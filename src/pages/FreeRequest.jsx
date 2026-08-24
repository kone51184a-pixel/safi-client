import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Button, Field, inputStyle } from '../components/UI';

const MAX_KG = 40;

export default function FreeRequest() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ description: '', quantity: '', address: '' });
  const [wantsBio, setWantsBio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quantityTooHigh = form.quantity && Number(form.quantity) > MAX_KG;

  async function handleSubmit(e) {
    e.preventDefault();
    if (quantityTooHigh) return;
    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(token, {
        order_type: 'free_request',
        free_request_description: form.description,
        free_request_quantity_kg: form.quantity ? Number(form.quantity) : null,
        wants_bio: wantsBio,
        delivery_address: form.address,
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
      <h2 style={{ fontSize: 20 }}>Demande libre</h2>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4, marginBottom: 22 }}>
        Décrivez ce dont vous avez besoin, on trouve le bon vendeur. Limité à {MAX_KG} kg par demande.
      </p>

      <form onSubmit={handleSubmit}>
        <Field label="Que recherchez-vous ?">
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'none' }}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Exemple : 20 kg de tomates + 20 kg d'oignons"
          />
        </Field>
        <Field label={`Quantité totale (kg) — max ${MAX_KG} kg`}>
          <input
            style={{ ...inputStyle, borderColor: quantityTooHigh ? 'var(--tomato)' : undefined }}
            type="number"
            max={MAX_KG}
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Ex : 40"
          />
          {quantityTooHigh && (
            <p style={{ fontSize: 11, color: 'var(--tomato)', marginTop: 4 }}>La quantité maximum pour une demande libre est {MAX_KG} kg.</p>
          )}
        </Field>
        <Field label="Adresse de livraison">
          <input style={inputStyle} required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ex : Restaurant Teriya, Hamdallaye" />
        </Field>

        <div style={{ fontSize: 13, fontWeight: 700, margin: '4px 0 10px' }}>Produit bio</div>
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

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#E5EEE8', border: '1px solid #BFDBC9', borderRadius: 10, padding: '11px 14px', fontSize: 12, color: 'var(--leaf-deep)', marginBottom: 18 }}>
          ℹ Notre équipe fixe le prix (produits + livraison séparément) avant que tu paies — tu verras le montant exact dans le suivi de ta demande.
        </div>

        {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <Button type="submit" variant="leaf" style={{ width: '100%' }} disabled={loading || quantityTooHigh}>
          {loading ? 'Envoi…' : 'Envoyer la demande'}
        </Button>
      </form>
    </div>
  );
}
