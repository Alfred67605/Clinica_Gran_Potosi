/**
 * Navbar.jsx — Premium Frosted Glass Top Bar with Dark Mode Toggle
 * Features: Theme switcher, glassmorphism, animated notification dot.
 */
import { useState, useEffect } from 'react';
import { IconBell, IconChevronRight } from './Icons';

/* Sun / Moon SVG icons for the theme toggle */
function IconSun({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Navbar({ pageTitle }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('clinica_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('clinica_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  return (
    <header className="navbar">
      {/* Breadcrumb */}
      <div className="navbar-left">
        <nav className="navbar-breadcrumb">
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Inicio</span>
          <IconChevronRight width={14} height={14} style={{ color: 'var(--color-text-muted)' }} />
          <span>{pageTitle}</span>
        </nav>
      </div>

      {/* Right side actions */}
      <div className="navbar-right">
        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar tema"
        >
          <div className="theme-toggle-thumb">
            {isDark ? <IconMoon size={10} /> : <IconSun size={10} />}
          </div>
        </button>

        <button className="navbar-icon-btn" title="Notificaciones" aria-label="Notificaciones">
          <IconBell width={17} height={17} />
          <span className="dot" aria-hidden="true" />
        </button>

        <div className="navbar-divider" />

        <button className="navbar-user" aria-label="Menú de usuario">
          <div className="navbar-user-avatar">DA</div>
          <div className="navbar-user-info">
            <p>Dr. Admin</p>
            <span>Administrador</span>
          </div>
        </button>
      </div>
    </header>
  );
}
