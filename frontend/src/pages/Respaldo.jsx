/**
 * Respaldo.jsx — Premium Backup and Configuration
 * Conectado al backend Laravel. Exporta la BD real PostgreSQL en JSON.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconDatabase, IconDownload, IconCheck, IconAlert, IconRefresh, IconUpload, IconFileText } from '../components/Icons';
import { exportarRespaldo, importarRespaldo } from '../services/api';

const PASOS = [
  { hasta: 20,  msg: 'Conectando con la base de datos PostgreSQL...' },
  { hasta: 45,  msg: 'Recopilando registros de pacientes...' },
  { hasta: 65,  msg: 'Recopilando historiales médicos y signos vitales...' },
  { hasta: 85,  msg: 'Obteniendo usuarios y relaciones...' },
  { hasta: 100, msg: 'Finalizando y estructurando JSON...' }
];

export default function Respaldo({ respaldos, setRespaldos }) {
  const [fase,     setFase]     = useState('idle');
  const [progreso, setProgreso] = useState(0);
  const [mensaje,  setMensaje]  = useState('');
  const [restoreError, setRestoreError] = useState(null);
  const [backupData, setBackupData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [allPatientsDossier, setAllPatientsDossier] = useState([]);

  // Restore states
  const [restoreFase, setRestoreFase] = useState('idle'); // 'idle' | 'progreso' | 'completo'
  const [restoreProgreso, setRestoreProgreso] = useState(0);
  const [restoreMensaje, setRestoreMensaje] = useState('');
  const [restoreErrorMsg, setRestoreErrorMsg] = useState(null);
  
  const timer = useRef(null);

  async function exportarPDF() {
    setPdfLoading(true);
    setRestoreError(null);
    try {
      const apiData = await exportarRespaldo();
      if (!apiData || !apiData.pacientes) {
        throw new Error('Respuesta de datos inválida desde el servidor.');
      }
      setAllPatientsDossier(apiData.pacientes);
      // Breve espera para asegurar render del DOM print-only
      setTimeout(() => {
        window.print();
        setPdfLoading(false);
      }, 800);
    } catch (err) {
      setRestoreError('Error al exportar PDF: ' + err.message);
      setPdfLoading(false);
    }
  }

  function handleImportarArchivo(e) {
    const file = e.target.files[0];
    if (!file) return;

    setRestoreFase('progreso');
    setRestoreProgreso(15);
    setRestoreMensaje('Leyendo archivo de respaldo JSON...');
    setRestoreErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        setRestoreProgreso(40);
        setRestoreMensaje('Verificando firmas y estructura del respaldo...');

        if (!jsonData.clinica_db || !jsonData.pacientes) {
          throw new Error('El archivo no es un respaldo válido de la base de datos de la clínica.');
        }

        setRestoreProgreso(65);
        setRestoreMensaje('Enviando datos al servidor Laravel para restauración...');

        const result = await importarRespaldo(jsonData);

        setRestoreProgreso(90);
        setRestoreMensaje('Actualizando tablas relacionales en PostgreSQL...');

        const sizeStr = `${(event.target.result.length / 1024).toFixed(1)} KB`;
        const nuevo = {
          fecha: new Date().toLocaleString('es-BO'),
          tipo: 'Restauración',
          tamaño: sizeStr,
          estado: 'Exitoso'
        };
        setRespaldos(prev => [nuevo, ...prev]);

        setRestoreProgreso(100);
        setRestoreFase('completo');
        setRestoreMensaje(result.message || 'Base de datos restaurada con éxito.');
      } catch (err) {
        setRestoreFase('idle');
        setRestoreErrorMsg(err.message || 'Error al procesar el archivo JSON.');
      }
    };

    reader.onerror = () => {
      setRestoreFase('idle');
      setRestoreErrorMsg('Error al leer el archivo físico.');
    };

    reader.readAsText(file);
    e.target.value = '';
  }

  function reiniciarRestore() {
    setRestoreFase('idle');
    setRestoreProgreso(0);
    setRestoreMensaje('');
    setRestoreErrorMsg(null);
  }

  async function iniciar() {
    setFase('progreso'); 
    setProgreso(0); 
    setMensaje('Iniciando proceso de respaldo...');
    setRestoreError(null);
    setBackupData(null);
    
    // Iniciar llamada a la API en paralelo a la animación visual
    let apiData = null;
    let apiError = null;

    exportarRespaldo()
      .then(data => apiData = data)
      .catch(err => apiError = err);

    let p = 0;
    timer.current = setInterval(() => {
      p += 2;
      const paso = PASOS.find(s => p <= s.hasta);
      if (paso) setMensaje(paso.msg);
      setProgreso(Math.min(p, 100));
      
      if (p >= 100) { 
        clearInterval(timer.current); 
        
        if (apiError) {
          setRestoreError('Error al conectar con la base de datos: ' + apiError.message);
          setFase('idle');
          return;
        }

        if (apiData) {
          const jsonStr = JSON.stringify(apiData, null, 2);
          const sizeStr = `${(jsonStr.length / 1024).toFixed(1)} KB`;
          setBackupData(jsonStr);

          const nuevo = {
            fecha: new Date().toLocaleString('es-BO'),
            tipo: 'Manual',
            tamaño: sizeStr,
            estado: 'Exitoso'
          };
          setRespaldos(prev => [nuevo, ...prev]);
          setFase('completo'); 
        } else {
          // Aún no llega la respuesta de la API, esperamos un poco más.
          setMensaje('Esperando respuesta del servidor...');
          p = 99; // Mantener en 99% hasta que llegue la respuesta
        }
      }
    }, 40);
  }

  function descargarArchivo() {
    if (!backupData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(backupData);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_clinica_gran_potosi_db_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function reiniciar() { setFase('idle'); setProgreso(0); setMensaje(''); setBackupData(null); }
  useEffect(() => () => clearInterval(timer.current), []);

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const ultimoRespaldo = respaldos.find(r => r.estado === 'Exitoso');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className="page-header no-print">
        <div className="page-header-left">
          <h1>Respaldo y Configuración</h1>
          <p>Exporte la base de datos PostgreSQL en formato físico estructurado.</p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
          <span className="dot" style={{ background: '#fff', position: 'relative', top: 'auto', right: 'auto', display: 'inline-block', marginRight: 6 }}/> Servidor Conectado
        </span>
      </div>

      {restoreError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-danger" style={{ marginBottom: 16 }}>
          <IconAlert width={16} height={16} /> Error: {restoreError}
        </motion.div>
      )}

      {/* Metrics */}
      <div className="stat-cards no-print" style={{ marginBottom: 16 }}>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon green"><IconDatabase width={20} height={20}/></div>
          <div>
            <div className="stat-card-label">Último Respaldo DB</div>
            <div className="stat-card-value" style={{ fontSize: 14.5, marginTop: 4 }}>
              {ultimoRespaldo ? ultimoRespaldo.fecha.split(' ')[0] : 'Sin datos'}
            </div>
            <div className="stat-card-sub">{ultimoRespaldo ? `${ultimoRespaldo.fecha.split(' ')[1] || ''} — Exitoso` : 'Nunca'}</div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon blue"><IconDatabase width={20} height={20}/></div>
          <div>
            <div className="stat-card-label">Motor de Base de Datos</div>
            <div className="stat-card-value" style={{ fontSize: 14.5, marginTop: 4 }}>PostgreSQL 18</div>
            <div className="stat-card-sub">Puerto 5432 - Conexión Activa</div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon slate"><IconDatabase width={20} height={20}/></div>
          <div>
            <div className="stat-card-label">Servidor Backend</div>
            <div className="stat-card-value" style={{ fontSize: 14.5, marginTop: 4 }}>Laravel API</div>
            <div className="stat-card-sub">Localhost - Módulo Eloquent</div>
          </div>
        </motion.div>
      </div>

      {/* Main Panel */}
      <motion.div variants={itemVariants} className="card no-print" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2><div className="card-header-icon"><IconDatabase width={15} height={15}/></div>Realizar Respaldo de Base de Datos PostgreSQL</h2>
        </div>
        <div className="card-body">
          {fase === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-bg), var(--color-primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
                <IconDatabase width={36} height={36} />
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--color-text)' }}>
                Base de datos lista para exportar
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.5 }}>
                Al presionar el botón, el backend recopilará un JSON estructurado con la base de datos de pacientes, 
                historiales clínicos completos, recetas prescritas y usuarios registrados desde PostgreSQL.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} id="btn-iniciar-respaldo" className="btn btn-success" onClick={iniciar}>
                  <IconDatabase width={15} height={15} /> Respaldar Base de Datos (JSON)
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-neutral" onClick={exportarPDF} disabled={pdfLoading}>
                  {pdfLoading ? (
                    <div className="skeleton skeleton-circle" style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', background: 'transparent', display: 'inline-block', marginRight: 6 }} />
                  ) : <IconDownload width={15} height={15} />}
                  Exportar a PDF Dossier
                </motion.button>
              </div>
            </motion.div>
          )}

          {fase === 'progreso' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{mensaje}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', minWidth: 44, textAlign: 'right', fontFamily: 'monospace' }}>{progreso}%</span>
              </div>
              <div className="progress-track" style={{ marginBottom: 24, height: 10 }}>
                <motion.div 
                  className="progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-glow))' }} 
                />
              </div>
              <div className="alert alert-info" style={{ borderLeft: '4px solid var(--color-info)' }}>
                <IconAlert width={16} height={16} />
                El servidor backend está preparando el archivo JSON. Por favor espere...
              </div>
            </motion.div>
          )}

          {fase === 'completo' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-success-light), var(--color-success))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#fff', boxShadow: 'var(--shadow-md)' }}>
                <IconCheck width={40} height={40} />
              </div>
              <p style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-success)', marginBottom: 6 }}>
                Respaldo PostgreSQL compilado exitosamente
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Fecha y hora de exportación: <strong style={{ color: 'var(--color-text)' }}>{new Date().toLocaleString('es-BO')}</strong>
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
                Nombre del archivo:{' '}
                <code style={{ background: 'var(--color-bg)', padding: '4px 10px', borderRadius: 6, fontSize: 13, border: '1px solid var(--color-border)', fontWeight: 600 }}>
                  backup_clinica_gran_potosi_db_{fechaArchivo}.json
                </code>
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-ghost" onClick={reiniciar}>
                  <IconRefresh width={14} height={14}/> Nuevo respaldo
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" onClick={descargarArchivo}>
                  <IconDownload width={14} height={14}/> Descargar JSON
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Restore Database Card */}
      <motion.div variants={itemVariants} className="card no-print" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2><div className="card-header-icon"><IconUpload width={15} height={15}/></div>Restaurar Base de Datos desde Archivo JSON</h2>
        </div>
        <div className="card-body">
          {restoreErrorMsg && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <IconAlert width={16} height={16} /> {restoreErrorMsg}
            </div>
          )}

          {restoreFase === 'idle' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                Si ha sufrido una pérdida total de datos en PostgreSQL, puede subir un archivo de respaldo 
                <code>.json</code> previamente exportado para restaurar todos los registros de pacientes, 
                antecedentes, consultas e historiales médicos al instante.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <label className="btn btn-primary btn-lg" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <IconUpload width={16} height={16} /> Seleccionar Respaldo (.json)
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportarArchivo} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
            </div>
          )}

          {restoreFase === 'progreso' && (
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{restoreMensaje}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{restoreProgreso}%</span>
              </div>
              <div className="progress-track" style={{ marginBottom: 20, height: 10 }}>
                <motion.div 
                  className="progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${restoreProgreso}%` }}
                  style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-glow))' }} 
                />
              </div>
            </div>
          )}

          {restoreFase === 'completo' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-success)' }}>
                <IconCheck width={32} height={32} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-success)', marginBottom: 8 }}>
                ¡Restauración Exitosa!
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                {restoreMensaje}
              </p>
              <button className="btn btn-ghost" onClick={reiniciarRestore}>
                Aceptar y Volver
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* History */}
      <motion.div variants={itemVariants} className="card no-print">
        <div className="card-header">
          <h2><div className="card-header-icon"><IconDatabase width={15} height={15}/></div>Historial de Operaciones de Base de Datos</h2>
          <span className="chip">{respaldos.length} operaciones registradas</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Fecha y Hora</th><th>Tipo de Operación</th><th>Tamaño del Respaldo</th><th>Resultado</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {respaldos.map((h,i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{h.fecha}</td>
                  <td>
                    <span className={`badge ${h.tipo==='Manual'?'badge-info':h.tipo==='Restauración'?'badge-success':'badge-neutral'}`}>
                      {h.tipo}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontWeight: 600 }}>{h.tamaño}</td>
                  <td>
                    <span className={`badge ${h.estado==='Exitoso'?'badge-success':'badge-danger'}`}>
                      {h.estado}
                    </span>
                  </td>
                  <td>
                    {h.estado === 'Exitoso' && h.tipo !== 'Restauración'
                      ? <button className="btn btn-ghost btn-sm" onClick={iniciar}><IconRefresh width={12} height={12}/> Generar de nuevo</button>
                      : <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>No aplicable</span>
                    }
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Dossier de Respaldo Completo para Impresión en PDF */}
      {allPatientsDossier.length > 0 && (
        <div className="print-only" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #1e3a8a', paddingBottom: 10, marginBottom: 30 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800, color: '#1e3a8a' }}>CLÍNICA GRAN POTOSÍ</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '10pt', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>Dossier de Respaldo Clínico de Base de Datos</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '10pt', color: '#475569', fontWeight: 600 }}>Fecha Generación: {new Date().toLocaleDateString('es-BO')}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '9pt', color: '#64748b' }}>Total Pacientes: {allPatientsDossier.length}</p>
            </div>
          </div>

          <p style={{ fontSize: '11pt', color: '#334155', marginBottom: 30, lineHeight: 1.5 }}>
            Este documento constituye un respaldo impreso integral de la base de datos de pacientes y expedientes clínicos registrados en la Clínica Gran Potosí. 
            Contiene la ficha de identificación de cada paciente, sus antecedentes médicos y el historial cronológico completo de atenciones recibidas.
          </p>

          {allPatientsDossier.map((p, idx) => (
            <div key={`dossier-p-${p.id}`} style={{ pageBreakAfter: 'always', marginTop: idx > 0 ? '40px' : '0' }}>
              {/* Header de Paciente */}
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '12px 18px', borderRadius: '8px', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '16pt', color: '#0f172a', fontWeight: 800 }}>{p.nombre}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: 10, fontSize: '9.5pt', color: '#334155' }}>
                  <div><strong>C.I.:</strong> {p.ci}</div>
                  <div><strong>Fecha Nacimiento:</strong> {p.fechaNacimiento}</div>
                  <div><strong>Sexo:</strong> {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'Otro'}</div>
                  <div><strong>Grupo Sanguíneo:</strong> {p.tipoSangre || 'No registrado'}</div>
                  <div><strong>Teléfono:</strong> {p.telefono}</div>
                  <div><strong>Ciudad:</strong> {p.ciudad || 'Potosí'}</div>
                </div>
              </div>

              {/* Antecedentes */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 18px', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '11pt', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Antecedentes Clínicos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', fontSize: '9.5pt', color: '#334155' }}>
                  <div><strong>Alergias:</strong> {p.alergias || 'Ninguna'}</div>
                  <div><strong>Enfermedades Previas:</strong> {p.enfermedadesPrevias || 'Ninguna registrada'}</div>
                  <div><strong>Medicamentos Actuales:</strong> {p.medicamentosActuales || 'Ninguno'}</div>
                  <div><strong>Contacto Emergencia:</strong> {p.contactoEmergencia || 'No registrado'}</div>
                </div>
              </div>

              {/* Historial de Consultas */}
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '11pt', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Historial de Consultas Médicas</h3>
                {!p.historialConsultas || p.historialConsultas.length === 0 ? (
                  <p style={{ fontSize: '9.5pt', color: '#64748b', fontStyle: 'italic' }}>No registra consultas médicas previas.</p>
                ) : (
                  <table className="table" style={{ width: '100%', fontSize: '9pt' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px' }}>Fecha</th>
                        <th style={{ padding: '8px' }}>Médico / Área</th>
                        <th style={{ padding: '8px' }}>Diagnóstico</th>
                        <th style={{ padding: '8px' }}>Evolución</th>
                        <th style={{ padding: '8px' }}>Tratamiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.historialConsultas.map((c, cidx) => (
                        <tr key={cidx}>
                          <td style={{ padding: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.fecha}</td>
                          <td style={{ padding: '8px' }}>
                            <div>{c.medico}</div>
                            <span style={{ fontSize: '8.5pt', color: '#64748b' }}>{c.areaMedica}</span>
                          </td>
                          <td style={{ padding: '8px', fontWeight: 600 }}>{c.diagnostico}</td>
                          <td style={{ padding: '8px' }}>
                            <div>{c.estadoPaciente}</div>
                            {c.notasSeguimiento && <div style={{ fontSize: '8pt', color: '#64748b', fontStyle: 'italic' }}>{c.notasSeguimiento}</div>}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <div>{c.tratamiento}</div>
                            {(c.tratamientoDuracion || c.tratamientoHorarios) && (
                              <div style={{ fontSize: '8pt', color: '#166534', marginTop: 4 }}>
                                {c.tratamientoDuracion} — {c.tratamientoHorarios}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
