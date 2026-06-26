import { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { Icon } from '../../lib/icons';

export function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña');
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
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>Nueva contraseña</h1>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!token ? (
            <p style={{ fontSize: 13, color: 'var(--orange)', margin: 0 }}>Enlace inválido. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".</p>
          ) : done ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
                <Icon name="check" size={18} /> Contraseña actualizada
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <a href="/" className="btn btn-primary" style={{ padding: 11, marginTop: 4, textAlign: 'center', textDecoration: 'none' }}>Ir a iniciar sesión</a>
            </>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Nueva contraseña</label>
                <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
              </div>
              <div>
                <label className="label">Repetir contraseña</label>
                <input className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
              </div>
              {error && (
                <div style={{ fontSize: 12.5, color: 'var(--orange)', background: 'var(--danger-soft)', border: '1px solid #F0E0D8', borderRadius: 7, padding: '8px 12px' }}>
                  {error}
                </div>
              )}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: 11, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
