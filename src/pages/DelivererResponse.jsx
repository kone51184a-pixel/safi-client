import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Button } from '../components/UI';

export default function DelivererResponse() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responding, setResponding] = useState(false);

  async function load() {
    try {
      const data = await api.getDelivererView(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [orderId]);

  async function respond(action) {
    setResponding(true);
    setError('');
    try {
      await api.respondAsDeliverer(orderId, action);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setResponding(false);
    }
  }

  if (loading) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center' }}>Chargement…</p>;
  if (error) return <p style={{ padding: 30, fontSize: 13, color: 'var(--tomato)', textAlign: 'center' }}>{error}</p>;
  if (!order) return null;

  const isAccepted = order.deliverer_response === 'accepted';
  const isRefused = order.deliverer_response === 'refused';
  const isDelivered = order.status === 'delivered';

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, margin: '0 auto 12px',
          background: 'linear-gradient(135deg, var(--leaf), var(--tomato))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--indigo-deep)', fontSize: 20
        }}>S</div>
        <h2 style={{ fontSize: 18 }}>Nouvelle course</h2>
        <span className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{order.order_number}</span>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Client</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{order.client_name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{order.client_phone}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Adresse</div>
          <div style={{ fontSize: 13 }}>{order.delivery_address || 'Non renseignée'}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>À livrer</div>
          <div style={{ fontSize: 13 }}>{order.items_summary || '—'}</div>
        </div>
      </div>

      {isDelivered ? (
        <div style={{ background: '#DCEADD', color: 'var(--success)', borderRadius: 12, padding: 16, textAlign: 'center', fontWeight: 600 }}>
          ✓ Livraison confirmée — merci !
        </div>
      ) : isAccepted ? (
        <div>
          <div style={{ background: '#DCEADD', color: 'var(--success)', borderRadius: 12, padding: 14, textAlign: 'center', fontWeight: 600, marginBottom: 12 }}>
            ✓ Course acceptée — bonne route !
          </div>
          <Button variant="leaf" style={{ width: '100%' }} onClick={() => respond('delivered')} disabled={responding}>
            {responding ? '…' : 'J\'ai livré ✓'}
          </Button>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 8 }}>
            Clique seulement une fois la livraison faite chez le client.
          </p>
        </div>
      ) : isRefused ? (
        <div style={{ background: '#F5DADA', color: 'var(--tomato)', borderRadius: 12, padding: 16, textAlign: 'center', fontWeight: 600 }}>
          Course refusée
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="leaf" style={{ flex: 1 }} onClick={() => respond('accept')} disabled={responding}>
            Accepter
          </Button>
          <Button variant="outline" style={{ flex: 1, borderColor: 'var(--tomato)', color: 'var(--tomato)' }} onClick={() => respond('refuse')} disabled={responding}>
            Refuser
          </Button>
        </div>
      )}
    </div>
  );
}