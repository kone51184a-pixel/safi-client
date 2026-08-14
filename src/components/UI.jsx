export function Button({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: { background: 'var(--tomato)', color: 'var(--cream)' },
    leaf: { background: 'var(--leaf)', color: 'var(--cream)' },
    ghost: { background: 'var(--sand)', color: 'var(--ink)' },
    outline: { background: 'transparent', color: 'var(--indigo)', border: '1.5px solid var(--indigo)' },
  };
  return (
    <button
      {...props}
      style={{
        padding: '12px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, border: 'none',
        opacity: props.disabled ? 0.6 : 1,
        ...variants[variant], ...props.style
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--line)',
  fontSize: 13.5, background: 'var(--card)', color: 'var(--ink)',
};

export function StatusPill({ status }) {
  const map = {
    pending: { bg: '#F3E4C4', color: '#8A6116', label: 'En attente' },
    awaiting_matching: { bg: '#DDE3F0', color: 'var(--indigo)', label: 'Demande reçue' },
    confirmed: { bg: '#DDE3F0', color: 'var(--indigo)', label: 'Confirmée' },
    picked_up: { bg: '#DCE6E0', color: '#3D5C48', label: 'Récupérée' },
    in_delivery: { bg: '#DCE6E0', color: '#3D5C48', label: 'En livraison' },
    delivered: { bg: '#DCEADD', color: 'var(--success)', label: 'Livrée' },
    cancelled: { bg: '#F5DADA', color: 'var(--tomato)', label: 'Annulée' },
  };
  const s = map[status] || { bg: 'var(--sand)', color: 'var(--ink-soft)', label: status };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
      fontFamily: 'JetBrains Mono', background: s.bg, color: s.color, whiteSpace: 'nowrap'
    }}>
      {s.label.toUpperCase()}
    </span>
  );
}

const STATUS_ORDER = ['pending', 'confirmed', 'picked_up', 'in_delivery', 'delivered'];
const STATUS_LABELS = {
  pending: 'Demande reçue',
  awaiting_matching: 'Demande reçue',
  confirmed: 'Commande confirmée',
  picked_up: 'En préparation',
  in_delivery: 'En livraison',
  delivered: 'Livrée',
};

export function Timeline({ currentStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus === 'awaiting_matching' ? 'pending' : currentStatus);
  return (
    <div style={{ padding: '4px 0' }}>
      {STATUS_ORDER.map((status, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'now' : 'todo';
        const colors = { done: 'var(--success)', now: 'var(--ochre)', todo: 'var(--sand)' };
        return (
          <div key={status} style={{ display: 'flex', gap: 12, paddingBottom: 20, position: 'relative' }}>
            {i < STATUS_ORDER.length - 1 && (
              <div style={{ position: 'absolute', left: 9, top: 22, bottom: -2, width: 2, background: 'var(--line)' }} />
            )}
            <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: colors[state], border: state === 'todo' ? '2px solid var(--line)' : 'none' }} />
            <div style={{ fontSize: 12.5, fontWeight: state === 'todo' ? 400 : 600, color: state === 'todo' ? 'var(--ink-soft)' : 'var(--ink)' }}>
              {STATUS_LABELS[status]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
