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
      { id: 'actualizacion',   icon: IconUser,        label: 'Actualizar Datos' }, // Accesible si tiene permiso, oculto en nav por defecto para algunos, pero lo dejamos por si acaso. Aunque Busqueda es mejor. Lo quitaré de la sidebar principal para no saturar, pero lo dejamos si quieres.
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

export default function Sidebar({ active, onNavigate, currentUser, allowedScreens = [] }) {
  // Filtramos el menú para mostrar solo lo permitido
  const filteredMenu = MENU_ITEMS.map(section => {
    return {
      ...section,
      // Filtramos los items de esta sección
      // (Omitimos 'actualizacion' del sidebar para no recargarlo, se accede desde búsqueda)
      items: section.items.filter(item => allowedScreens.includes(item.id) && item.id !== 'actualizacion')
    };
  }).filter(section => section.items.length > 0); // Ocultar secciones vacías

  const getInitials = (nombre) => nombre ? nombre.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : 'US';

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
        {filteredMenu.map(({ section, items }) => (
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
      {currentUser && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <div className="sidebar-avatar">{getInitials(currentUser.nombre)}</div>
            <div className="sidebar-footer-text">
              <p>{currentUser.nombre}</p>
              <span>{currentUser.rol}</span>
            </div>
            {/* Opcional: El logout lo hacemos desde el Navbar, pero si el usuario hace clic aquí también podría funcionar.
                Por ahora es decorativo si no pasamos onLogout aquí. Lo quitaremos o lo dejamos inactivo si usamos Navbar. */}
          </div>
        </div>
      )}
    </aside>
  );
}
