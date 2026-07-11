import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, inputStyle } from '../components/UI';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{
        width: 360, background: 'var(--card)', borderRadius: 18, padding: 32,
        border: '1px solid var(--line)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--leaf), var(--tomato))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--indigo-deep)', fontSize: 20
          }}>S</div>
          <h2 style={{ fontSize: 19 }}>Bienvenue sur SAFi</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>Produits frais livrés, sans intermédiaires</p>
        </div>

        <Field label="Téléphone">
          <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+223 70 00 00 00" required />
        </Field>
        <Field label="Mot de passe">
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>

        {error && (
          <div style={{ background: '#FBEFE0', color: '#8A6116', fontSize: 12, padding: '9px 12px', borderRadius: 8, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <Button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-soft)', marginTop: 16 }}>
          Pas encore de compte ? <Link to="/inscription" style={{ color: 'var(--tomato)', fontWeight: 600 }}>Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
