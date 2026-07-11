import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatusPill, Timeline } from '../components/UI';

export default function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getOrder(token, id).then(setOrder).finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>;
  if (!order) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Commande introuvable.</p>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '30px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="mono" style={{ fontSize: 18 }}>{order.order_number}</h2>
        <StatusPill status={order.status} />
      </div>

      {order.items && order.items.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <span>{item.product_name} <span style={{ color: 'var(--ink-soft)' }}>× {item.quantity}</span></span>
              <span className="mono">{Number(item.line_total).toLocaleString()} F</span>
            </div>
          ))}
        </div>
      )}

      {order.free_request_description && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Votre demande :</div>
          <div style={{ color: 'var(--ink-soft)' }}>{order.free_request_description}</div>
        </div>
      )}

      <h3 style={{ fontSize: 13, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>Suivi</h3>
      <Timeline currentStatus={order.status} />
    </div>
  );
}
