/**
 * Sidebar.jsx — Premium Floating Sidebar with Animated Active Indicator
 * Features: Framer Motion layoutId for sliding highlight, glowing logo, refined spacing.
 */
import { motion } from 'framer-motion';
import {
  IconHome, IconUser, IconStethoscope, IconSearch, IconHistory,
  IconBarChart, IconUsers, IconDatabase, IconLogOut,
} from './Icons';

const MENU_ITEMS = [
  {
    section: 'Inicio',
    items: [
      { id: 'dashboard',     icon: IconHome,     label: 'Dashboard Principal' },
    ],
  },
  {
    section: 'Pacientes',
    items: [
      { id: 'registro',        icon: IconUser,        label: 'Registro de Paciente' },
      { id: 'registroClinico', icon: IconStethoscope, label: 'Registro Clínico' },
      { id: 'busqueda',        icon: IconSearch,      label: 'Búsqueda Avanzada' },
      { id: 'historial',       icon: IconHistory,     label: 'Historial Clínico' },
    ],
  },
  {
    section: 'Administración',
    items: [
      { id: 'reportes',  icon: IconBarChart,  label: 'Reportes y Estadísticas' },
      { id: 'usuarios',  icon: IconUsers,     label: 'Gestión de Usuarios' },
      { id: 'respaldo',  icon: IconDatabase,  label: 'Respaldo y Configuración' },
    ],
  },
];

/* Premium Medical Cross Logo with glow */
function MedicalCross() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-3 11h-3v3a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3H6a1 1 0 01-1-1v-2a1 1 0 011-1h3V7a1 1 0 011-1h2a1 1 0 011 1v3h3a1 1 0 011 1v2a1 1 0 01-1 1z"/>
    </svg>
  );
}

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      {/* Logo with glow effect */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><MedicalCross /></div>
        <div className="sidebar-logo-text">
          <h2>Clínica Gran Potosí</h2>
          <span>Sistema de Gestión</span>
        </div>
      </div>

      {/* Navigation with animated indicator */}
      <nav className="sidebar-nav">
        {MENU_ITEMS.map(({ section, items }) => (
          <div key={section}>
            <p className="sidebar-section-title">{section}</p>
            {items.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`sidebar-item${active === id ? ' active' : ''}`}
                onClick={() => onNavigate(id)}
                aria-current={active === id ? 'page' : undefined}
                style={{ position: 'relative' }}
              >
                {/* Animated background highlight — slides between active items */}
                {active === id && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--sidebar-active)',
                      zIndex: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Icon width={16} height={16} strokeWidth={active === id ? 2 : 1.75} />
                  {label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-avatar">DA</div>
          <div className="sidebar-footer-text">
            <p>Dr. Admin</p>
            <span>Administrador</span>
          </div>
          <button
            style={{ marginLeft:'auto', background:'none', border:'none', color:'#475569', cursor:'pointer', padding:4, display:'flex', borderRadius: 6, transition: 'color 0.2s' }}
            title="Cerrar sesión"
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          >
            <IconLogOut width={15} height={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
