/**
 * App.jsx — Enrutamiento, Estado Centralizado y RBAC (Control de Acceso Basado en Roles)
 * Conectado al backend Laravel + PostgreSQL.
 */
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Navbar  from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RegistroPaciente   from './pages/RegistroPaciente';
import RegistroClinico from './pages/RegistroClinico';
import BusquedaPaciente   from './pages/BusquedaPaciente';
import ActualizacionDatos from './pages/ActualizacionDatos';
import HistorialClinico   from './pages/HistorialClinico';
import Reportes           from './pages/Reportes';
import GestionUsuarios    from './pages/GestionUsuarios';
import Respaldo           from './pages/Respaldo';
import Login              from './pages/Login';
import { fetchPacientes, fetchUsuarios } from './services/api';

const RESPALDOS_INICIALES = [];

// Mapa de todas las pantallas disponibles
const SCREENS = {
  dashboard:    { label: 'Dashboard Principal',     component: Dashboard },
  registro:     { label: 'Registro de Paciente',    component: RegistroPaciente },
  registroClinico: { label: 'Registro Clínico Completo', component: RegistroClinico },
  busqueda:     { label: 'Búsqueda de Paciente',    component: BusquedaPaciente },
  actualizacion:{ label: 'Actualización de Datos',  component: ActualizacionDatos },
  historial:    { label: 'Historial Clínico',        component: HistorialClinico },
  reportes:     { label: 'Generación de Reportes',  component: Reportes },
  usuarios:     { label: 'Gestión de Usuarios',     component: GestionUsuarios },
  respaldo:     { label: 'Respaldo de Información', component: Respaldo }
};

// Configuración de permisos por rol (RBAC)
const ROLE_PERMISSIONS = {
  'Administrador': Object.keys(SCREENS), // Acceso a todo
  'Médico': ['dashboard', 'registro', 'busqueda', 'historial', 'registroClinico', 'reportes', 'actualizacion'],
  'Enfermería': ['dashboard', 'busqueda', 'historial', 'registroClinico'], // Registro clínico para constantes vitales
  'Recepcionista': ['dashboard', 'registro', 'busqueda', 'actualizacion']
};

function getScreenFromHash() {
  const hash = window.location.hash.replace('#/', '').split('?')[0];
  return SCREENS[hash] ? hash : 'dashboard';
}

export default function App() {
  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('clinica_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeScreen, setActiveScreen] = useState(getScreenFromHash);
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [respaldos, setRespaldos] = useState(RESPALDOS_INICIALES);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos solo si hay un usuario logueado
  useEffect(() => {
    if (!currentUser) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        // Recepcionistas no necesitan cargar la lista completa de usuarios si no tienen acceso, 
        // pero cargamos por simplicidad (se puede optimizar en la API si es necesario).
        const [pacientesData, usuariosData] = await Promise.all([
          fetchPacientes(),
          currentUser.rol === 'Administrador' ? fetchUsuarios() : Promise.resolve([]),
        ]);
        setPacientes(pacientesData);
        setUsuarios(usuariosData);
        if (pacientesData.length > 0) {
          setPacienteSeleccionadoId(pacientesData[0].id);
        }
      } catch (err) {
        console.error('Error cargando datos del backend:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  async function reloadPacientes() {
    try {
      const data = await fetchPacientes();
      setPacientes(data);
    } catch (err) {
      console.error('Error recargando pacientes:', err);
    }
  }

  async function reloadUsuarios() {
    try {
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error('Error recargando usuarios:', err);
    }
  }

  // Manejo de URL Hash
  useEffect(() => {
    function onHashChange() { setActiveScreen(getScreenFromHash()); }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigate(screenId) {
    window.location.hash = `/${screenId}`;
    setActiveScreen(screenId);
  }

  // Redirige al Dashboard inicial
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '/dashboard';
    }
  }, []);

  function handleLogin(user) {
    setCurrentUser(user);
    localStorage.setItem('clinica_user', JSON.stringify(user));
    navigate('dashboard');
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem('clinica_user');
    window.location.hash = '';
  }

  // Si no está logueado, muestra la pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // Pantalla de carga mientras se obtienen datos iniciales
  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar active={activeScreen} onNavigate={navigate} currentUser={currentUser} allowedScreens={ROLE_PERMISSIONS[currentUser.rol]} />
        <div className="main-content">
          <Navbar pageTitle="Iniciando Sesión..." currentUser={currentUser} onLogout={handleLogout} />
          <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="loading-spinner" style={{
                width: 48, height: 48, border: '4px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
              }} />
              <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Cargando datos del sistema...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar active={activeScreen} onNavigate={navigate} currentUser={currentUser} allowedScreens={ROLE_PERMISSIONS[currentUser.rol]} />
        <div className="main-content">
          <Navbar pageTitle="Error de Conexión" currentUser={currentUser} onLogout={handleLogout} />
          <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28
              }}>⚠️</div>
              <h2 style={{ marginBottom: 8, color: 'var(--color-danger)' }}>Error de Conexión</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>{error}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Reintentar Conexión</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GUARDIÁN DE RUTAS (ROUTE GUARD) ---
  const allowedScreens = ROLE_PERMISSIONS[currentUser.rol] || ['dashboard'];
  
  // Si el usuario intenta acceder a una ruta que no tiene permitida
  if (!allowedScreens.includes(activeScreen)) {
    return (
      <div className="app-layout">
        <Sidebar active={activeScreen} onNavigate={navigate} currentUser={currentUser} allowedScreens={allowedScreens} />
        <div className="main-content">
          <Navbar pageTitle="Acceso Denegado" currentUser={currentUser} onLogout={handleLogout} />
          <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
              <h2 style={{ marginBottom: 8, color: 'var(--color-danger)', fontSize: 24 }}>Acceso Restringido</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                Su rol de <strong>{currentUser.rol}</strong> no tiene los permisos necesarios para acceder al módulo de <strong>{SCREENS[activeScreen]?.label}</strong>.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('dashboard')}>
                Volver al Panel Principal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Screen = SCREENS[activeScreen]?.component || Dashboard;
  const label  = SCREENS[activeScreen]?.label || '';

  return (
    <div className="app-layout">
      <Sidebar active={activeScreen} onNavigate={navigate} currentUser={currentUser} allowedScreens={allowedScreens} />
      <div className="main-content">
        <Navbar pageTitle={label} currentUser={currentUser} onLogout={handleLogout} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            className="page-wrapper"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <Screen 
              pacientes={pacientes}
              setPacientes={setPacientes}
              reloadPacientes={reloadPacientes}
              pacienteSeleccionadoId={pacienteSeleccionadoId}
              setPacienteSeleccionadoId={setPacienteSeleccionadoId}
              usuarios={usuarios}
              setUsuarios={setUsuarios}
              reloadUsuarios={reloadUsuarios}
              respaldos={respaldos}
              setRespaldos={setRespaldos}
              onNavigate={navigate} 
              currentUser={currentUser} // Pasamos el usuario a las vistas por si necesitan validaciones finas
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
