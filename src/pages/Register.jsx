import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, inputStyle } from '../components/UI';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', client_type: 'restaurant' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 0' }}>
      <form onSubmit={handleSubmit} style={{
        width: 380, background: 'var(--card)', borderRadius: 18, padding: 32,
        border: '1px solid var(--line)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 19 }}>Créer un compte</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>Restaurant ou fast-food</p>
        </div>

        <Field label="Vous êtes">
          <select style={inputStyle} value={form.client_type} onChange={(e) => setForm({ ...form, client_type: e.target.value })}>
            <option value="restaurant">Restaurant</option>
            <option value="fast_food">Fast-food</option>
          </select>
        </Field>
        <Field label="Nom complet / Nom du restaurant">
          <input style={inputStyle} required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ex : Restaurant Teriya" />
        </Field>
        <Field label="Téléphone">
          <input style={inputStyle} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+223 70 00 00 00" />
        </Field>
        <Field label="Email (optionnel)">
          <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@exemple.com" />
        </Field>
        <Field label="Mot de passe">
          <input style={inputStyle} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </Field>

        {error && (
          <div style={{ background: '#FBEFE0', color: '#8A6116', fontSize: 12, padding: '9px 12px', borderRadius: 8, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <Button type="submit" variant="leaf" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Création…' : 'Créer mon compte'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-soft)', marginTop: 16 }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--tomato)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
