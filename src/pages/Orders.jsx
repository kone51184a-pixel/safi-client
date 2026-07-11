import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatusPill } from '../components/UI';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getOrders(token).then(setOrders).finally(() => setLoading(false));
  }, [token]);

  if (!token) return <p style={{ padding: 30, fontSize: 13, color: 'var(--ink-soft)' }}>Connecte-toi pour voir tes commandes.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Mes commandes</h2>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>
      ) : orders.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Aucune commande pour l'instant.</p>
      ) : (
        orders.map((o) => (
          <Link key={o.id} to={`/commandes/${o.id}`} style={{
            display: 'block', padding: 16, background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 13, marginBottom: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{o.order_number}</span>
              <StatusPill status={o.status} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {o.order_type === 'free_request' ? o.free_request_description : `${o.total ? Number(o.total).toLocaleString() + ' F' : ''}`}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
