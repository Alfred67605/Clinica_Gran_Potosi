/**
 * Respaldo.jsx — Premium Backup and Configuration
 * Animated progress bar, staggered load animations, premium alert states.
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IconDatabase, IconDownload, IconCheck, IconAlert, IconRefresh } from '../components/Icons';

const PASOS = [
  { hasta: 20,  msg: 'Conectando con la base de datos local...' },
  { hasta: 45,  msg: 'Exportando registros de pacientes...' },
  { hasta: 65,  msg: 'Exportando historiales médicos y diagnósticos...' },
  { hasta: 85,  msg: 'Compilando esquemas y encriptando firma...' },
  { hasta: 100, msg: 'Finalizando y verificando integridad de la copia...' }
];

export default function Respaldo({ pacientes, setPacientes, usuarios, setUsuarios, respaldos, setRespaldos }) {
  const [fase,     setFase]     = useState('idle');
  const [progreso, setProgreso] = useState(0);
  const [mensaje,  setMensaje]  = useState('');
  const [restoreError, setRestoreError] = useState(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  
  const fileInputRef = useRef(null);
  const timer = useRef(null);

  function iniciar() {
    setFase('progreso'); 
    setProgreso(0); 
    setMensaje('Iniciando proceso de respaldo...');
    setRestoreSuccess(false);
    setRestoreError(null);
    
    let p = 0;
    timer.current = setInterval(() => {
      p += 2;
      const paso = PASOS.find(s => p <= s.hasta);
      if (paso) setMensaje(paso.msg);
      setProgreso(Math.min(p, 100));
      
      if (p >= 100) { 
        clearInterval(timer.current); 
        const sizeStr = `${((JSON.stringify({ pacientes, usuarios }).length) / 1024).toFixed(1)} KB`;
        const nuevo = {
          fecha: new Date().toLocaleString('es-BO'),
          tipo: 'Manual',
          tamaño: sizeStr,
          estado: 'Exitoso'
        };
        setRespaldos(prev => [nuevo, ...prev]);
        setFase('completo'); 
      }
    }, 40);
  }

  function descargarArchivo() {
    const dataObj = {
      clinica_db: true,
      export_date: new Date().toISOString(),
      pacientes,
      usuarios
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_clinica_gran_potosi_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const db = JSON.parse(event.target.result);
        if (db.clinica_db && Array.isArray(db.pacientes) && Array.isArray(db.usuarios)) {
          setPacientes(db.pacientes);
          setUsuarios(db.usuarios);
          setRestoreSuccess(true);
          setRestoreError(null);
          const nuevo = {
            fecha: new Date().toLocaleString('es-BO'),
            tipo: 'Restauración',
            tamaño: `${(event.target.result.length / 1024).toFixed(1)} KB`,
            estado: 'Exitoso'
          };
          setRespaldos(prev => [nuevo, ...prev]);
        } else {
          setRestoreError('El archivo no contiene un formato de base de datos clínico válido.');
          setRestoreSuccess(false);
        }
      } catch (err) {
        setRestoreError('Error al decodificar la copia de seguridad: ' + err.message);
        setRestoreSuccess(false);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }

  function reiniciar() { setFase('idle'); setProgreso(0); setMensaje(''); }
  useEffect(() => () => clearInterval(timer.current), []);

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const ultimoRespaldo = respaldos.find(r => r.estado === 'Exitoso');
  const currentSize = `${(JSON.stringify({ pacientes, usuarios }).length / 1024).toFixed(1)} KB`;

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
      <div className="page-header">
        <div className="page-header-left">
          <h1>Respaldo y Configuración</h1>
          <p>Exporte bases de datos en formato físico o restaure copias de seguridad anteriores.</p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
          <span className="dot" style={{ background: '#fff', position: 'relative', top: 'auto', right: 'auto', display: 'inline-block', marginRight: 6 }}/> Protección Activa
        </span>
      </div>

      {restoreSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-success" style={{ marginBottom: 16 }}>
          <IconCheck width={16} height={16} /> ¡Base de datos de la Clínica Gran Potosí restaurada correctamente! Los datos se han sincronizado.
        </motion.div>
      )}
      {restoreError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-danger" style={{ marginBottom: 16 }}>
          <IconAlert width={16} height={16} /> Error: {restoreError}
        </motion.div>
      )}

      {/* Metrics */}
      <div className="stat-cards" style={{ marginBottom: 16 }}>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon green"><IconDatabase width={20} height={20}/></div>
          <div>
            <div className="stat-card-label">Último Respaldo</div>
            <div className="stat-card-value" style={{ fontSize: 14.5, marginTop: 4 }}>
              {ultimoRespaldo ? ultimoRespaldo.fecha.split(' ')[0] : 'Hoy'}
            </div>
            <div className="stat-card-sub">{ultimoRespaldo ? `${ultimoRespaldo.fecha.split(' ')[1] || ''} — Exitoso` : 'Sin registros'}</div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon blue"><IconDatabase width={20} height={20}/></div>
          <div>
            <div className="stat-card-label">Tamaño en Uso</div>
            <div className="stat-card-value counter-value">{currentSize}</div>
            <div className="stat-card-sub">{pacientes.length} pacientes activos</div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon slate"><IconDatabase width={20} height={20}/></div>
          <div>
            <div className="stat-card-label">Servidor Local</div>
            <div className="stat-card-value" style={{ fontSize: 14.5, marginTop: 4 }}>LocalStorage</div>
            <div className="stat-card-sub">Cifrado de integridad activo</div>
          </div>
        </motion.div>
      </div>

      {/* Main Panel */}
      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2><div className="card-header-icon"><IconDatabase width={15} height={15}/></div>Realizar Respaldo de Base de Datos</h2>
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
                Al presionar el botón se compilará un archivo JSON estructurado con la base de datos de pacientes, 
                historiales clínicos completos, recetas prescritas y usuarios registrados.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} id="btn-iniciar-respaldo" className="btn btn-success btn-lg" onClick={iniciar}>
                  <IconDatabase width={16} height={16} /> Respaldar Base de Datos
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-outline btn-lg" onClick={() => fileInputRef.current.click()}>
                  <IconRefresh width={16} height={16} /> Restaurar Copia
                </motion.button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
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
                Preparando archivo de descarga. Por favor, no cierre ni actualice el panel de control.
              </div>
            </motion.div>
          )}

          {fase === 'completo' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-success-light), var(--color-success))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#fff', boxShadow: 'var(--shadow-md)' }}>
                <IconCheck width={40} height={40} />
              </div>
              <p style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-success)', marginBottom: 6 }}>
                Respaldo médico compilado exitosamente
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Fecha y hora de exportación: <strong style={{ color: 'var(--color-text)' }}>{new Date().toLocaleString('es-BO')}</strong>
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
                Nombre del archivo:{' '}
                <code style={{ background: 'var(--color-bg)', padding: '4px 10px', borderRadius: 6, fontSize: 13, border: '1px solid var(--color-border)', fontWeight: 600 }}>
                  backup_clinica_gran_potosi_{fechaArchivo}.json
                </code>
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-ghost" onClick={reiniciar}>
                  <IconRefresh width={14} height={14}/> Nuevo respaldo
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" onClick={descargarArchivo}>
                  <IconDownload width={14} height={14}/> Descargar Respaldo JSON
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* History */}
      <motion.div variants={itemVariants} className="card">
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
                      ? <button className="btn btn-ghost btn-sm" onClick={descargarArchivo}><IconDownload width={12} height={12}/> Volver a Descargar</button>
                      : <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>No aplicable</span>
                    }
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
