import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const FRESH_CATEGORIES = [
  { name: 'Légumes', icon: '🍅', color: 'var(--tomato)', image: 'https://images.pexels.com/photos/1400172/pexels-photo-1400172.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Fruits', icon: '🥭', color: 'var(--leaf)', image: 'https://images.pexels.com/photos/3978830/pexels-photo-3978830.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const OTHER_CATEGORIES = [
  { name: 'Céréales', icon: '🌾', color: 'var(--ochre)', image: 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Épices', icon: '🧅', color: '#8E6BA8', image: 'https://images.pexels.com/photos/6302105/pexels-photo-6302105.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Viande/Poisson', icon: '🐟', color: 'var(--indigo)', image: 'https://images.pexels.com/photos/19311538/pexels-photo-19311538.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

function CategoryTile({ c }) {
  return (
    <Link to="/catalogue" style={{ textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18, background: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 6,
        overflow: 'hidden'
      }}>
        {c.image ? (
          <img
            src={c.image}
            alt={c.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = c.icon; }}
          />
        ) : c.icon}
      </div>
      <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{c.name}</span>
    </Link>
  );
}

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15 }}>🌱</span>
        <h3 style={{ fontSize: 15, color: 'var(--leaf-deep)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fruits & légumes frais</h3>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 30, flexWrap: 'wrap' }}>
        {FRESH_CATEGORIES.map((c) => <CategoryTile key={c.name} c={c} />)}
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Autres produits</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 34, flexWrap: 'wrap' }}>
        {OTHER_CATEGORIES.map((c) => <CategoryTile key={c.name} c={c} />)}
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
