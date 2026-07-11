import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/UI';

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Aucune commande récente à afficher.</p>
        <Link to="/"><Button variant="ghost" style={{ marginTop: 16 }}>Retour à l'accueil</Button></Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{
        width: 66, height: 66, borderRadius: '50%', background: 'var(--success)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 28, color: 'white'
      }}>✓</div>
      <h2 style={{ fontSize: 19 }}>Commande confirmée</h2>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>Numéro de commande</p>
      <div className="mono" style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{state.orderNumber}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
        <Button onClick={() => navigate(`/commandes/${state.orderId}`)}>Suivre ma commande</Button>
        <Link to="/"><Button variant="ghost" style={{ width: '100%' }}>Retour à l'accueil</Button></Link>
      </div>
    </div>
  );
}
