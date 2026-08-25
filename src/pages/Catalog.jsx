import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ProductCard } from './Home';
import { inputStyle } from '../components/UI';

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'Fruits', label: '🥭 Fruits' },
  { key: 'Légumes', label: '🍅 Légumes' },
  { key: 'Bio', label: '🌱 Bio' },
];

export default function Catalog() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const urlCategory = searchParams.get('categorie');
  const [tab, setTab] = useState(urlCategory && TABS.some((t) => t.key === urlCategory) ? urlCategory : 'all');

  useEffect(() => {
    if (urlCategory && TABS.some((t) => t.key === urlCategory)) {
      setTab(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getProducts(token, search ? { search } : {})
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [token, search]);

  function selectTab(key) {
    setTab(key);
    if (key === 'all') {
      searchParams.delete('categorie');
    } else {
      searchParams.set('categorie', key);
    }
    setSearchParams(searchParams);
  }

  // Le catalogue vend fruits, légumes, et les produits classés Bio
  const produce = products.filter((p) =>
    ['Fruits', 'Légumes', 'Bio'].includes(p.category_name)
  );
  const filtered = tab === 'all'
    ? produce
    : tab === 'Bio'
      // Bio = catégorie "Bio" directe, OU produit Fruits/Légumes avec un prix bio renseigné
      ? produce.filter((p) => p.category_name === 'Bio' || p.price_bio)
      : produce.filter((p) => p.category_name === tab);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Catalogue</h2>
      <input
        style={{ ...inputStyle, maxWidth: 320, marginBottom: 18 }}
        placeholder="Rechercher un produit (tomates, mangues…)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => selectTab(t.key)}
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
            <ProductCard key={p.id} product={p} bioContext={tab === 'Bio'} />
          ))}
        </div>
      )}
    </div>
  );
}