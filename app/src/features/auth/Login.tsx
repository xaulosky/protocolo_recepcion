import { useState } from 'react';
import { useAuth } from '../../store/auth-context';
import { api, ApiError } from '../../lib/api';
import { Icon } from '../../lib/icons';

export function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch {
      setSent(true); // no revelamos si el correo existe
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 14 }}>
            <Icon name="logo" size={26} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>Cialo Hub</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Sistema interno de Clínica Cialo</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={submit} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Correo</label>
              <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@cialo.cl" required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && (
              <div style={{ fontSize: 12.5, color: 'var(--orange)', background: 'var(--danger-soft)', border: '1px solid #F0E0D8', borderRadius: 7, padding: '8px 12px' }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: 11, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
            <button type="button" onClick={() => { setMode('forgot'); setError(null); setSent(false); }} style={linkBtn}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={submitForgot} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sent ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
                  <Icon name="check" size={18} /> Revisa tu correo
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                  Si <strong>{email}</strong> está registrado, te enviamos un enlace para crear una nueva contraseña. Vence en 1 hora.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <div>
                  <label className="label">Correo</label>
                  <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@cialo.cl" required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: 11, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Enviando…' : 'Enviar enlace'}
                </button>
              </>
            )}
            <button type="button" onClick={() => { setMode('login'); setError(null); setSent(false); }} style={linkBtn}>
              ← Volver a iniciar sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 500,
  cursor: 'pointer', textAlign: 'center', padding: 4,
};
