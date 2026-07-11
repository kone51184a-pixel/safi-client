import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ProductCard } from './Home';
import { inputStyle } from '../components/UI';

export default function Catalog() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getProducts(token, search ? { search } : {})
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [token, search]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Catalogue</h2>
      <input
        style={{ ...inputStyle, maxWidth: 320, marginBottom: 24 }}
        placeholder="Rechercher un produit (tomates, riz…)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>
      ) : products.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Aucun produit trouvé.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
