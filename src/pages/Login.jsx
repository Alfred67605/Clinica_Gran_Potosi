/**
 * Login.jsx — Premium Authentication Screen
 * Pantalla de inicio de sesión de la Clínica Gran Potosí.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconShield, IconAlert, IconActivity } from '../components/Icons';
import { iniciarSesion } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!usuario.trim() || !contrasena.trim()) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Llama a la API de Laravel
      const userData = await iniciarSesion(usuario, contrasena);
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.message || 'Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '20px'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'var(--color-primary-light)', filter: 'blur(100px)', opacity: 0.5, zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'var(--color-info-light)', filter: 'blur(80px)', opacity: 0.5, zIndex: 0 }} />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 20px', color: '#fff',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
          }}>
            <IconActivity width={32} height={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Clínica Gran Potosí
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Sistema Integrado de Gestión Hospitalaria
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <IconAlert width={16} height={16} /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Usuario de Acceso</label>
            <input 
              type="text" 
              className="form-control" 
              value={usuario} 
              onChange={e => setUsuario(e.target.value)}
              placeholder="Ej. admin"
              autoComplete="username"
              style={{ padding: '12px 16px', fontSize: '15px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              value={contrasena} 
              onChange={e => setContrasena(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ padding: '12px 16px', fontSize: '15px' }}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700', borderRadius: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Autenticando...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconShield width={18} height={18} /> Iniciar Sesión Segura
              </div>
            )}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} Clínica Gran Potosí. Todos los derechos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
