import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const CATEGORIES = [
  { name: 'Légumes', icon: '🍅', color: 'var(--tomato)' },
  { name: 'Fruits', icon: '🥭', color: 'var(--leaf)' },
  { name: 'Céréales', icon: '🌾', color: 'var(--ochre)' },
  { name: 'Épices', icon: '🧅', color: '#8E6BA8' },
  { name: 'Viande/Poisson', icon: '🐟', color: 'var(--indigo)' },
];

export default function Home() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!token) return;
    api.getProducts(token).then(setProducts).catch(() => {});
  }, [token]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px' }}>
      <Link to="/demande-libre" style={{ display: 'block', marginBottom: 28 }}>
        <div style={{
          borderRadius: 18, padding: 28, background: 'linear-gradient(120deg, var(--leaf-deep), var(--leaf))',
          color: 'var(--cream)', position: 'relative', overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Vous ne trouvez pas ce qu'il vous faut ?</h2>
          <p style={{ fontSize: 13.5, opacity: 0.85 }}>Faites une demande libre, on s'occupe du reste →</p>
        </div>
      </Link>

      <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégories</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 34, flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <Link key={c.name} to="/catalogue" style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 6
            }}>{c.icon}</div>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{c.name}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponible aujourd'hui</h3>
        <Link to="/catalogue" style={{ fontSize: 13, color: 'var(--tomato)', fontWeight: 600 }}>Voir tout →</Link>
      </div>

      {!token ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          <Link to="/login" style={{ color: 'var(--tomato)', fontWeight: 600 }}>Connecte-toi</Link> pour voir le catalogue.
        </p>
      ) : products.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Aucun produit disponible pour l'instant.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductCard({ product }) {
  return (
    <Link to={`/produit/${product.id}`} style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden'
    }}>
      <div style={{ height: 110, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, overflow: 'hidden' }}>
        {product.photo_url ? (
          <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : '🍅'}
      </div>
      <div style={{ padding: '10px 12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{product.name}</div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6 }}>{product.vendor_name || 'Vendeur SAFi'}</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--tomato)', fontWeight: 600 }}>
          {Number(product.price).toLocaleString()} F/{product.unit}
        </div>
      </div>
    </Link>
  );
}
