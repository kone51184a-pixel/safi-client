import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatusPill, Timeline, Button } from '../components/UI';

const CANCELLABLE = ['pending', 'awaiting_matching', 'confirmed', 'picked_up'];

export default function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getOrder(token, id);
      setOrder(data);
      if (data.status === 'delivered') {
        const r = await api.getReviewForOrder(token, id).catch(() => null);
        setReview(r);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, id]);

  async function handleCancel() {
    if (!window.confirm('Annuler cette commande ?')) return;
    setCancelling(true);
    setError('');
    try {
      await api.cancelOrder(token, id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  async function handleSubmitReview() {
    if (!rating) return;
    setSubmittingReview(true);
    try {
      const r = await api.createReview(token, { order_id: id, rating, comment });
      setReview(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>;
  if (!order) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Commande introuvable.</p>;

  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '30px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="mono" style={{ fontSize: 18 }}>{order.order_number}</h2>
        <StatusPill status={order.status} />
      </div>

      {order.delivery_address && (
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 16 }}>
          📍 {order.delivery_address}
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <span>{item.product_name} <span style={{ color: 'var(--ink-soft)' }}>× {item.quantity}</span></span>
              <span className="mono">{Number(item.line_total).toLocaleString()} F</span>
            </div>
          ))}
        </div>
      )}

      {order.order_type === 'catalog' && Number(order.total) > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 12.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--ink-soft)' }}>
            <span>Sous-total</span><span className="mono">{Number(order.subtotal).toLocaleString()} F</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--ink-soft)' }}>
            <span>Livraison</span><span className="mono">{Number(order.delivery_fee).toLocaleString()} F</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--ink-soft)' }}>
            <span>TVA</span><span className="mono">{Number(order.tva_amount || 0).toLocaleString()} F</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--line)', fontWeight: 700 }}>
            <span>Total</span><span className="mono">{Number(order.total).toLocaleString()} F</span>
          </div>
        </div>
      )}

      {order.free_request_description && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Votre demande :</div>
          <div style={{ color: 'var(--ink-soft)' }}>{order.free_request_description}</div>
          {order.total && Number(order.total) > 0 ? (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Prix proposé</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--tomato)' }}>{Number(order.total).toLocaleString()} F</span>
            </div>
          ) : (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--line)', fontSize: 11.5, color: 'var(--ink-soft)' }}>
              💬 Prix en cours de confirmation par notre équipe
            </div>
          )}
        </div>
      )}

      <h3 style={{ fontSize: 13, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>Suivi</h3>
      <Timeline currentStatus={order.status} />

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, margin: '12px 0' }}>{error}</p>}

      {canCancel && (
        <Button
          variant="outline"
          style={{ width: '100%', marginTop: 20, borderColor: 'var(--tomato)', color: 'var(--tomato)' }}
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? 'Annulation…' : 'Annuler la commande'}
        </Button>
      )}

      {order.status === 'delivered' && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Votre avis</h3>
          {review ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
              <div style={{ color: 'var(--ochre)', fontSize: 16, marginBottom: 6 }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              {review.comment && <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{review.comment}</p>}
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8 }}>Merci pour ton retour !</p>
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, fontSize: 26 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setRating(n)}
                    style={{ cursor: 'pointer', color: n <= rating ? 'var(--ochre)' : 'var(--line)' }}
                  >★</span>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Un commentaire pour nous aider à nous améliorer (optionnel)"
                style={{ width: '100%', minHeight: 70, padding: 10, borderRadius: 10, border: '1.5px solid var(--line)', fontSize: 12.5, resize: 'none', marginBottom: 10 }}
              />
              <Button variant="leaf" style={{ width: '100%' }} onClick={handleSubmitReview} disabled={!rating || submittingReview}>
                {submittingReview ? 'Envoi…' : 'Envoyer mon avis'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
