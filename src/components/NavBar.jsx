import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import siteLogo from '../assets/logo.png';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/demande-libre', label: 'Demande libre' },
    { to: '/commandes', label: 'Mes commandes' },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
    setOpen(false);
  }

  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', background: 'var(--indigo-deep)', color: 'var(--cream)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!logoFailed ? (
            <img
              src={siteLogo}
              alt="SAFi"
              style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover' }}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: 'linear-gradient(135deg, var(--leaf), var(--tomato))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--indigo-deep)', fontSize: 15
            }}>S</div>
          )}
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18 }}>SAFi</span>
        </Link>

        <nav className="nav-desktop-links">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                fontSize: 13.5, fontWeight: 600,
                color: location.pathname === l.to ? 'var(--ochre)' : 'rgba(246,241,231,0.7)',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link to="/panier" style={{ position: 'relative', fontSize: 13.5, fontWeight: 600 }}>
            🛒
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -10, background: 'var(--tomato)', color: 'white',
                fontSize: 9.5, fontWeight: 700, borderRadius: '50%', width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{itemCount}</span>
            )}
          </Link>

          <div className="nav-user-desktop" style={{ alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <span className="user-name" style={{ fontSize: 12.5, color: 'rgba(246,241,231,0.7)' }}>{user.full_name}</span>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--tomato)', fontSize: 12.5, fontWeight: 600 }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ochre)' }}>Connexion</Link>
            )}
          </div>

          <button className="nav-hamburger-btn" onClick={() => setOpen(true)} aria-label="Menu">☰</button>
        </div>
      </header>

      <div className={`nav-mobile-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <div className={`nav-mobile-menu ${open ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setOpen(false)}
            style={{
              fontSize: 14.5, fontWeight: 600, padding: '12px 0',
              color: location.pathname === l.to ? 'var(--ochre)' : 'rgba(246,241,231,0.85)',
              borderBottom: '1px solid rgba(246,241,231,0.08)',
            }}
          >
            {l.label}
          </Link>
        ))}
        <div style={{ marginTop: 16 }}>
          {user ? (
            <>
              <div style={{ fontSize: 12.5, color: 'rgba(246,241,231,0.6)', marginBottom: 10 }}>{user.full_name}</div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--tomato)', fontSize: 13.5, fontWeight: 600, padding: 0 }}>
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ochre)' }}>Connexion</Link>
          )}
        </div>
      </div>
    </>
  );
}