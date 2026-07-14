import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ProductCard } from './Home';
import { inputStyle } from '../components/UI';

const FRESH_NAMES = ['Légumes', 'Fruits'];

export default function Catalog() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // all | fresh | other

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getProducts(token, search ? { search } : {})
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [token, search]);

  const filtered = products.filter((p) => {
    if (tab === 'all') return true;
    const isFresh = FRESH_NAMES.includes(p.category_name);
    return tab === 'fresh' ? isFresh : !isFresh;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Catalogue</h2>
      <input
        style={{ ...inputStyle, maxWidth: 320, marginBottom: 18 }}
        placeholder="Rechercher un produit (tomates, riz…)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'fresh', label: '🌱 Fruits & légumes' },
          { key: 'other', label: 'Autres produits' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${tab === t.key ? 'var(--leaf)' : 'var(--line)'}`,
              background: tab === t.key ? 'var(--leaf)' : 'var(--card)',
              color: tab === t.key ? 'white' : 'var(--ink-soft)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Aucun produit trouvé.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
