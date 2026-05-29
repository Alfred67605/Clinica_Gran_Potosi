/**
 * App.jsx — Enrutamiento por hash (#) con Estado Centralizado
 * Sincroniza datos en tiempo real entre Dashboard, Buscador, Historial, Reportes y Registro Clínico.
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

const PACIENTES_INICIALES = [
  {
    id: 1,
    nombre: 'Juan Carlos Mamani Quispe',
    ci: '7654321',
    fechaNacimiento: '1989-04-15',
    edad: 37,
    sexo: 'M',
    estadoCivil: 'Casado',
    direccion: 'Av. Oruro #123, Barrio Central',
    ciudad: 'Potosí',
    telefono: '75234567',
    correo: 'juan.mamani@gmail.com',
    contactoEmergencia: 'María Mamani (Esposa) - 75234568',
    peso: 78.5,
    altura: 1.72,
    imc: 26.53, // Sobrepeso
    tipoSangre: 'O+',
    presionArterial: '130/85',
    frecuenciaCardiaca: 72,
    temperatura: 36.5,
    saturacionOxigeno: 97,
    alergias: 'Penicilina',
    enfermedadesPrevias: 'Hipertensión arterial leve',
    medicamentosActuales: 'Losartán 50mg (1 vez al día), Aspirina 100mg (1 vez al día)',
    antecedentesFamiliares: 'Padre con hipertensión y diabetes tipo 2',
    historialQuirurgico: 'Extracción de quiste sebáceo en zona lumbar derecha (2025)',
    observacionesGenerales: 'Paciente con historial de hipertensión arterial bajo control. Se recomienda revisión mensual.',
    diagnosticoPreliminar: 'Cefalea tensional',
    diagnosticoFinal: 'Hipertensión arterial leve en control',
    tratamiento: 'Continuar Losartán 50mg diario, reducir consumo de sal y realizar ejercicio aeróbico 3 veces por semana.',
    indicacionesMedicas: 'Evitar consumo excesivo de sodio. Control de presión arterial cada semana.',
    fechaIngreso: '2025-05-10',
    doctorAsignado: 'Dr. Roberto López',
    areaMedica: 'Consulta General',
    prioridadMedica: 'Media',
    estado: 'Activo',
    historialConsultas: [
      { fecha: '2026-05-02', tipo: 'Consulta General', medico: 'Dr. Roberto López', areaMedica: 'Consulta General', diagnostico: 'Hipertensión arterial leve. Dieta baja en sodio y control mensual.', tratamiento: 'Losartán 50mg c/24h', indicaciones: 'Control de presión semanal', sintomas: 'Cefalea leve', presionArterial: '130/85', peso: 78.5, altura: 1.72, imc: 26.53, frecuenciaCardiaca: 72, temperatura: 36.5, saturacionOxigeno: 97, prioridad: 'Media', estadoClinico: 'Estable' },
      { fecha: '2026-03-15', tipo: 'Laboratorio', medico: 'Lic. Valeriano Ramos', areaMedica: 'Laboratorio', diagnostico: 'Hemograma completo dentro de rango. Glucemia: 105 mg/dl (levemente elevada).', tratamiento: 'Control nutricional', indicaciones: 'Evitar carbohidratos refinados', sintomas: 'Rutina', presionArterial: '120/80', peso: 79.0, altura: 1.72, imc: 26.70, frecuenciaCardiaca: 70, temperatura: 36.4, saturacionOxigeno: 98, prioridad: 'Baja', estadoClinico: 'Estable' },
      { fecha: '2026-01-10', tipo: 'Consulta General', medico: 'Dr. Roberto López', areaMedica: 'Consulta General', diagnostico: 'Gripe estacional. Tratamiento: reposo, hidratación, paracetamol 500mg cada 8h.', tratamiento: 'Paracetamol 500mg c/8h', indicaciones: 'Tomar abundante agua y reposo', sintomas: 'Fiebre y dolor de garganta', presionArterial: '115/75', peso: 78.0, altura: 1.72, imc: 26.36, frecuenciaCardiaca: 78, temperatura: 38.2, saturacionOxigeno: 95, prioridad: 'Baja', estadoClinico: 'Estable' }
    ]
  },
  {
    id: 2,
    nombre: 'María Elena Flores Condori',
    ci: '8123456',
    fechaNacimiento: '1998-08-22',
    edad: 27,
    sexo: 'F',
    estadoCivil: 'Soltera',
    direccion: 'Calle Bolivar #456, Zona Central',
    ciudad: 'Potosí',
    telefono: '70112233',
    correo: 'elena.flores@outlook.com',
    contactoEmergencia: 'Luis Flores (Padre) - 70112234',
    peso: 62.0,
    altura: 1.65,
    imc: 22.77, // Normal
    tipoSangre: 'A+',
    presionArterial: '110/70',
    frecuenciaCardiaca: 68,
    temperatura: 36.2,
    saturacionOxigeno: 99,
    alergias: 'Ninguna',
    enfermedadesPrevias: 'Asma bronquial leve',
    medicamentosActuales: 'Salbutamol inhalador SOS',
    antecedentesFamiliares: 'Madre con asma bronquial',
    historialQuirurgico: 'Ninguno',
    observacionesGenerales: 'Paciente estable. Control anual de función pulmonar por neumología.',
    diagnosticoPreliminar: 'Control de rutina asmática',
    diagnosticoFinal: 'Asma bronquial controlada',
    tratamiento: 'Salbutamol 100 mcg inhalador (2 puffs ante crisis). Control estricto.',
    indicacionesMedicas: 'Evitar alérgenos ambientales, ácaros y polvo.',
    fechaIngreso: '2026-02-18',
    doctorAsignado: 'Dra. Ana Torrez',
    areaMedica: 'Pediatría / Neumología',
    prioridadMedica: 'Baja',
    estado: 'Activo',
    historialConsultas: [
      { fecha: '2026-05-01', tipo: 'Consulta Especialidad', medico: 'Dra. Ana Torrez', areaMedica: 'Neumología', diagnostico: 'Asma bronquial bajo control. Espirometría normal.', tratamiento: 'Salbutamol SOS', indicaciones: 'Control en 6 meses', sintomas: 'Ninguno', presionArterial: '110/70', peso: 62.0, altura: 1.65, imc: 22.77, frecuenciaCardiaca: 68, temperatura: 36.2, saturacionOxigeno: 99, prioridad: 'Baja', estadoClinico: 'Estable' }
    ]
  },
  {
    id: 3,
    nombre: 'Carlos Alberto Ramos López',
    ci: '5987654',
    fechaNacimiento: '1974-11-03',
    edad: 51,
    sexo: 'M',
    estadoCivil: 'Divorciado',
    direccion: 'Av. Serrudo #890',
    ciudad: 'Potosí',
    telefono: '69887766',
    correo: 'carlos.ramos@hotmail.com',
    contactoEmergencia: 'Sonia Ramos (Hija) - 78945612',
    peso: 88.0,
    altura: 1.70,
    imc: 30.45, // Obesidad I
    tipoSangre: 'B+',
    presionArterial: '135/90',
    frecuenciaCardiaca: 75,
    temperatura: 36.6,
    saturacionOxigeno: 96,
    alergias: 'Aspirina',
    enfermedadesPrevias: 'Diabetes mellitus tipo 2, Obesidad I',
    medicamentosActuales: 'Metformina 850mg (2 veces al día)',
    antecedentesFamiliares: 'Ambos padres diabéticos',
    historialQuirurgico: 'Apendicectomía (1995)',
    observacionesGenerales: 'Requiere plan estricto de nutrición y control glucémico diario.',
    diagnosticoPreliminar: 'Hiperglucemia reactiva',
    diagnosticoFinal: 'Diabetes mellitus tipo 2 descontrolada',
    tratamiento: 'Metformina 850mg cada 12h con las comidas. Ajustar dieta hipoglúcida.',
    indicacionesMedicas: 'Control de glucemia capilar diario en ayunas.',
    fechaIngreso: '2026-03-30',
    doctorAsignado: 'Dr. Miguel Quispe',
    areaMedica: 'Consulta Especialidad',
    prioridadMedica: 'Alta',
    estado: 'Activo',
    historialConsultas: [
      { fecha: '2026-04-30', tipo: 'Consulta Especialidad', medico: 'Dr. Miguel Quispe', areaMedica: 'Endocrinología', diagnostico: 'Glucemia elevada en ayunas (152 mg/dl). Ajuste de dosis de Metformina.', tratamiento: 'Metformina 850mg c/12h', indicaciones: 'Control de glucemia capilar en ayunas', sintomas: 'Polidipsia y poliuria leves', presionArterial: '135/90', peso: 88.0, altura: 1.70, imc: 30.45, frecuenciaCardiaca: 75, temperatura: 36.6, saturacionOxigeno: 96, prioridad: 'Alta', estadoClinico: 'Estable' }
    ]
  },
  {
    id: 4,
    nombre: 'Ana Lucía Torrez Bustamante',
    ci: '6543210',
    fechaNacimiento: '1985-01-30',
    edad: 41,
    sexo: 'F',
    estadoCivil: 'Casada',
    direccion: 'Calle Junin #12, Zona San Clemente',
    ciudad: 'Potosí',
    telefono: '71234567',
    correo: 'ana.torrez@gmail.com',
    contactoEmergencia: 'Felipe Torrez (Hermano) - 71234568',
    peso: 58.0,
    altura: 1.60,
    imc: 22.66, // Normal
    tipoSangre: 'O-',
    presionArterial: '105/65',
    frecuenciaCardiaca: 64,
    temperatura: 36.7,
    saturacionOxigeno: 98,
    alergias: 'Sulfas',
    enfermedadesPrevias: 'Ninguna',
    medicamentosActuales: 'Vitamina D3 1000 UI diaria',
    antecedentesFamiliares: 'Abuela materna con cáncer de mama',
    historialQuirurgico: 'Cesárea segmentaria (2018)',
    observacionesGenerales: 'Control ginecológico y de salud anual preventivo. Paciente sana.',
    diagnosticoPreliminar: 'Control general preventivo',
    diagnosticoFinal: 'Paciente sana en control anual',
    tratamiento: 'Suplemento de Vitamina D por niveles en límite inferior.',
    indicacionesMedicas: 'Realizar mamografía de cribado anual.',
    fechaIngreso: '2026-04-29',
    doctorAsignado: 'Dra. Ana Flores',
    areaMedica: 'Consulta General',
    prioridadMedica: 'Baja',
    estado: 'Activo',
    historialConsultas: [
      { fecha: '2026-04-29', tipo: 'Consulta General', medico: 'Dra. Ana Flores', areaMedica: 'Ginecología', diagnostico: 'Control de salud femenino preventivo e inicio de suplemento de Vitamina D.', tratamiento: 'Vitamina D3 1000 UI diaria', indicaciones: 'Exposición solar 15 min diarios', sintomas: 'Fatiga leve', presionArterial: '105/65', peso: 58.0, altura: 1.60, imc: 22.66, frecuenciaCardiaca: 64, temperatura: 36.7, saturacionOxigeno: 98, prioridad: 'Baja', estadoClinico: 'Estable' }
    ]
  },
  {
    id: 5,
    nombre: 'Roberto Chávez Mendoza',
    ci: '4321098',
    fechaNacimiento: '1959-07-07',
    edad: 66,
    sexo: 'M',
    estadoCivil: 'Casado',
    direccion: 'Calle Chichas #101, Zona Cantumarca',
    ciudad: 'Potosí',
    telefono: '72998877',
    correo: 'roberto.chavez@gmail.com',
    contactoEmergencia: 'Lucía Chávez (Esposa) - 72998878',
    peso: 82.5,
    altura: 1.75,
    imc: 26.94, // Sobrepeso
    tipoSangre: 'A-',
    presionArterial: '142/88',
    frecuenciaCardiaca: 82,
    temperatura: 36.3,
    saturacionOxigeno: 94,
    alergias: 'Ninguna',
    enfermedadesPrevias: 'Cardiopatía isquémica crónica, Hipertensión arterial',
    medicamentosActuales: 'Amlodipino 10mg, Aspirina 100mg, Atorvastatina 20mg',
    antecedentesFamiliares: 'Padre fallecido por infarto agudo de miocardio',
    historialQuirurgico: 'Angioplastia coronaria con colocación de stent (2022)',
    observacionesGenerales: 'Cardiopatía isquémica controlada. Monitoreo regular por hipertensión descompensada.',
    diagnosticoPreliminar: 'Angina inestable descartada',
    diagnosticoFinal: 'Cardiopatía isquémica estable. Hipertensión descontrolada.',
    tratamiento: 'Ajuste de medicación cardiológica: Agregar Enalapril 10mg diario.',
    indicacionesMedicas: 'Control diario de presión arterial y evitar esfuerzos físicos extremos.',
    fechaIngreso: '2026-04-28',
    doctorAsignado: 'Dr. Miguel Quispe',
    areaMedica: 'Consulta Especialidad',
    prioridadMedica: 'Alta',
    estado: 'Activo',
    historialConsultas: [
      { fecha: '2026-04-28', tipo: 'Consulta Especialidad', medico: 'Dr. Miguel Quispe', areaMedica: 'Cardiología', diagnostico: 'Monitoreo post-angioplastia. Ajuste de antihipertensivos por presiones elevadas.', tratamiento: 'Atorvastatina 20mg, Amlodipino 10mg, Enalapril 10mg', indicaciones: 'Evitar alimentos grasos y sal', sintomas: 'Disnea leve de esfuerzo', presionArterial: '142/88', peso: 82.5, altura: 1.75, imc: 26.94, frecuenciaCardiaca: 82, temperatura: 36.3, saturacionOxigeno: 94, prioridad: 'Alta', estadoClinico: 'Estable' }
    ]
  }
];

const USUARIOS_INICIALES = [
  { id: 1, nombre: 'Dr. Admin', rol: 'Administrador', usuario: 'admin', estado: 'Activo' },
  { id: 2, nombre: 'Dr. Roberto López', rol: 'Médico', usuario: 'rlopez', estado: 'Activo' },
  { id: 3, nombre: 'Lic. Ana Ramos', rol: 'Enfermería', usuario: 'aramos', estado: 'Activo' },
  { id: 4, nombre: 'Srta. Carla Vargas', rol: 'Recepcionista', usuario: 'cvargas', estado: 'Inactivo' },
  { id: 5, nombre: 'Dr. Miguel Quispe', rol: 'Médico', usuario: 'mquispe', estado: 'Activo' }
];

const RESPALDOS_INICIALES = [
  { fecha: '2026-05-28 22:00', tipo: 'Automático', tamaño: '4.2 MB', estado: 'Exitoso' },
  { fecha: '2026-05-27 22:00', tipo: 'Automático', tamaño: '4.1 MB', estado: 'Exitoso' },
  { fecha: '2026-05-26 14:30', tipo: 'Manual',     tamaño: '4.0 MB', estado: 'Exitoso' },
  { fecha: '2026-05-25 22:00', tipo: 'Automático', tamaño: '3.9 MB', estado: 'Exitoso' },
  { fecha: '2026-05-24 22:00', tipo: 'Automático', tamaño: '3.8 MB', estado: 'Fallido' }
];

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

function getScreenFromHash() {
  const hash = window.location.hash.replace('#/', '').split('?')[0];
  return SCREENS[hash] ? hash : 'dashboard';
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState(getScreenFromHash);
  const [pacientes, setPacientes] = useState(() => {
    const raw = localStorage.getItem('clinica_pacientes');
    return raw ? JSON.parse(raw) : PACIENTES_INICIALES;
  });
  const [usuarios, setUsuarios] = useState(() => {
    const raw = localStorage.getItem('clinica_usuarios');
    return raw ? JSON.parse(raw) : USUARIOS_INICIALES;
  });
  const [respaldos, setRespaldos] = useState(() => {
    const raw = localStorage.getItem('clinica_respaldos');
    return raw ? JSON.parse(raw) : RESPALDOS_INICIALES;
  });
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(() => {
    const raw = localStorage.getItem('clinica_seleccionado_id');
    return raw ? parseInt(raw, 10) : 1;
  });

  // Persistencia reactiva del estado centralizado
  useEffect(() => {
    localStorage.setItem('clinica_pacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  useEffect(() => {
    localStorage.setItem('clinica_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem('clinica_respaldos', JSON.stringify(respaldos));
  }, [respaldos]);

  useEffect(() => {
    localStorage.setItem('clinica_seleccionado_id', pacienteSeleccionadoId.toString());
  }, [pacienteSeleccionadoId]);

  // Escucha cambios de hash (botón atrás/adelante del navegador)
  useEffect(() => {
    function onHashChange() { setActiveScreen(getScreenFromHash()); }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Al navegar, actualiza el hash en la URL
  function navigate(screenId) {
    window.location.hash = `/${screenId}`;
    setActiveScreen(screenId);
  }

  // Redirige a /dashboard si el hash está vacío al cargar
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '/dashboard';
    }
  }, []);

  const Screen = SCREENS[activeScreen]?.component || Dashboard;
  const label  = SCREENS[activeScreen]?.label || '';

  return (
    <div className="app-layout">
      <Sidebar active={activeScreen} onNavigate={navigate} />
      <div className="main-content">
        <Navbar pageTitle={label} />
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
              pacienteSeleccionadoId={pacienteSeleccionadoId}
              setPacienteSeleccionadoId={setPacienteSeleccionadoId}
              usuarios={usuarios}
              setUsuarios={setUsuarios}
              respaldos={respaldos}
              setRespaldos={setRespaldos}
              onNavigate={navigate} 
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
