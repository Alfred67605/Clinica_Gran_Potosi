/**
 * Reportes.jsx — Premium Audit and Reporting Panel
 * Fetching real statistics and filtered consultations list directly from Laravel/PostgreSQL.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBarChart, IconFilter, IconDownload, IconSearch } from '../components/Icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { fetchEstadisticas, fetchReportes, fetchPacientes, fetchUsuarios } from '../services/api';

export default function Reportes() {
  const [vista, setVista] = useState('barras');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [stats, setStats] = useState(null);
  const [consultas, setConsultas] = useState([]);

  // Catálogos para filtros
  const [pacientesList, setPacientesList] = useState([]);
  const [medicosList, setMedicosList] = useState([]);

  // Filtros de búsqueda
  const [filterPaciente, setFilterPaciente] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterMedico, setFilterMedico] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState(''); // '', 'dia', 'semana', 'mes', 'custom'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const selectedPatientObj = filterPaciente ? pacientesList.find(p => p.id === parseInt(filterPaciente, 10)) : null;

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  async function cargarDatosIniciales() {
    try {
      setLoadingStats(true);
      const [statsData, pacientesData, usuariosData] = await Promise.all([
        fetchEstadisticas(),
        fetchPacientes(),
        fetchUsuarios()
      ]);
      setStats(statsData);
      setPacientesList(pacientesData);
      setMedicosList(usuariosData);

      // Carga inicial sin filtros (todas las consultas)
      setLoadingReport(true);
      const reportData = await fetchReportes();
      setConsultas(reportData);
    } catch (err) {
      console.error('Error al cargar datos iniciales de reportes:', err);
    } finally {
      setLoadingStats(false);
      setLoadingReport(false);
    }
  }

  async function handleGenerar(e) {
    if (e) e.preventDefault();
    try {
      setLoadingReport(true);
      const filters = {
        id_paciente: filterPaciente,
        area_medica: filterArea,
        id_usuario: filterMedico,
        periodo: filterPeriodo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      };
      const data = await fetchReportes(filters);
      setConsultas(data);
    } catch (err) {
      console.error('Error al generar el reporte:', err);
    } finally {
      setLoadingReport(false);
    }
  }

  function handleDownloadPDF() {
    window.print();
  }

  // Mapear los datos de consultas por mes al formato de Recharts
  const chartData = stats?.consultasPorMes ? stats.consultasPorMes.map(item => {
    const mesesMap = {
      '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
    };
    const parts = item.mes.split('-'); // 2026-05
    return {
      mes: parts.length === 2 ? mesesMap[parts[1]] || item.mes : item.mes,
      consultas: parseInt(item.total, 10),
      nuevos: Math.round(parseInt(item.total, 10) * 0.3)
    };
  }) : [];

  const areasMedicas = Array.from(new Set(
    pacientesList.map(p => p.areaMedica).filter(Boolean)
    .concat(consultas.map(c => c.area_medica).filter(Boolean))
    .concat(['Medicina General', 'Odontología', 'Pediatría', 'Ginecología', 'Cardiología', 'Traumatología'])
  )).sort();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 15 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Cabecera Membretada Exclusiva para Impresión */}
      <div className="print-only-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22pt', fontWeight: 800, color: '#1e3a8a', letterSpacing: 0.5 }}>CLÍNICA GRAN POTOSÍ</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '9.5pt', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>Departamento de Archivo Clínico y Expedientes</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '13pt', fontWeight: 700, color: '#0f172a' }}>REPORTE DE ATENCIONES MÉDICAS</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '9pt', color: '#64748b', fontWeight: 500 }}>Fecha Emisión: {new Date().toLocaleDateString('es-BO')}</p>
          </div>
        </div>
        <hr className="print-brand-divider" />

        {/* Criterios de Filtro en la Impresión */}
        <div className="print-filters-box">
          <strong style={{ display: 'block', marginBottom: 8, fontSize: '10.5pt', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Criterios de Filtro Aplicados:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '9.5pt' }}>
            <div><span style={{ color: '#64748b', fontWeight: 600 }}>Paciente:</span> {filterPaciente ? pacientesList.find(p => p.id === parseInt(filterPaciente, 10))?.nombre || 'Paciente no encontrado' : 'Todos los pacientes'}</div>
            <div><span style={{ color: '#64748b', fontWeight: 600 }}>Médico Responsable:</span> {filterMedico ? medicosList.find(m => m.id_usuario === parseInt(filterMedico, 10))?.nombre || 'Médico no encontrado' : 'Todos los médicos'}</div>
            <div><span style={{ color: '#64748b', fontWeight: 600 }}>Área / Especialidad:</span> {filterArea || 'Todas las áreas'}</div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Periodo / Rango:</span> {
                filterPeriodo === 'dia' ? 'Hoy (Últimas 24 horas)' :
                filterPeriodo === 'semana' ? 'Última semana' :
                filterPeriodo === 'mes' ? 'Último mes' :
                filterPeriodo === 'custom' ? `Personalizado (${fechaInicio ? new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-BO') : 'Inicio'} al ${fechaFin ? new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-BO') : 'Fin'})` :
                'Todo el histórico'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Reportes y Estadísticas</h1>
          <p>Consulte y filtre las métricas operativas de la Clínica Gran Potosí en tiempo real.</p>
        </div>
        <motion.button variants={itemVariants} className="btn btn-ghost" onClick={handleDownloadPDF} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <IconDownload width={14} height={14}/> Imprimir Reporte
        </motion.button>
      </div>

      {/* Filter Panel (no-print) */}
      <motion.div variants={itemVariants} className="card no-print" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2>Filtros del Reporte</h2>
        </div>
        <div className="card-body" style={{ padding: '20px 24px' }}>
          <form onSubmit={handleGenerar}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              
              <div className="form-group">
                <label className="form-label" htmlFor="filter-paciente">Paciente Atendido</label>
                <select id="filter-paciente" className="form-control" value={filterPaciente} onChange={e => setFilterPaciente(e.target.value)}>
                  <option value="">-- Todos los Pacientes --</option>
                  {pacientesList.map((p, idx) => (
                    <option key={`p-${p.id || idx}`} value={p.id}>{p.nombre} (CI: {p.ci})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="filter-medico">Doctor / Médico Responsable</label>
                <select id="filter-medico" className="form-control" value={filterMedico} onChange={e => setFilterMedico(e.target.value)}>
                  <option value="">-- Todos los Doctores --</option>
                  {medicosList.map((m, idx) => (
                    <option key={`m-${m.id_usuario || idx}`} value={m.id_usuario}>{m.nombre} ({m.rol})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="filter-area">Área / Rama Médica</label>
                <select id="filter-area" className="form-control" value={filterArea} onChange={e => setFilterArea(e.target.value)}>
                  <option value="">-- Todas las Áreas --</option>
                  {areasMedicas.map((a, idx) => (
                    <option key={`a-${a || idx}`} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="filter-periodo">Periodo de Tiempo</label>
                <select id="filter-periodo" className="form-control" value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)}>
                  <option value="">Todo el histórico</option>
                  <option value="dia">Hoy (Últimas 24 horas)</option>
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mes</option>
                  <option value="custom">Rango personalizado</option>
                </select>
              </div>
            </div>

            {/* Custom Dates Rango */}
            <AnimatePresence>
              {filterPeriodo === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', overflow: 'hidden' }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="fecha-inicio">Fecha de Inicio</label>
                    <input id="fecha-inicio" type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fecha-fin">Fecha de Fin</label>
                    <input id="fecha-fin" type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSearch width={14} height={14}/> Generar Reporte Detallado
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Ficha de Identificación del Paciente (Visible en pantalla y al imprimir cuando se selecciona un paciente) */}
      <AnimatePresence>
        {selectedPatientObj && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
            style={{ marginBottom: 20, borderLeft: '4px solid var(--color-primary)' }}
          >
            <div className="card-header">
              <h2>Expediente e Identificación del Paciente</h2>
            </div>
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
                {/* Left side: Patient Avatar Photo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '110px' }}>
                  {selectedPatientObj.foto ? (
                    <img 
                      src={selectedPatientObj.foto} 
                      alt="Foto Paciente" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--color-border)' }} 
                    />
                  ) : (
                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '11px', background: 'var(--color-bg)', textAlign: 'center' }}>
                      Sin Foto
                    </div>
                  )}
                </div>

                {/* Right side: Personal Data Grid */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 24px' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Nombre Completo:</span>
                      <strong style={{ fontSize: '11.5pt' }}>{selectedPatientObj.nombre}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Cédula de Identidad (C.I.):</span>
                      <strong style={{ fontSize: '11.5pt', fontFamily: 'monospace' }}>{selectedPatientObj.ci}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Edad / Sexo:</span>
                      <strong style={{ fontSize: '11.5pt' }}>{selectedPatientObj.edad} años ({selectedPatientObj.sexo === 'M' ? 'Masculino' : selectedPatientObj.sexo === 'F' ? 'Femenino' : 'Otro'})</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Grupo Sanguíneo:</span>
                      <strong style={{ fontSize: '11.5pt' }}>{selectedPatientObj.tipoSangre || 'No registrado'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Teléfono de Contacto:</span>
                      <strong style={{ fontSize: '11.5pt' }}>{selectedPatientObj.telefono}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Procedencia / Ciudad:</span>
                      <strong style={{ fontSize: '11.5pt' }}>{selectedPatientObj.ciudad || 'Potosí'}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, display: 'block', marginBottom: 2 }}>Dirección Particular:</span>
                      <strong style={{ fontSize: '11pt' }}>{selectedPatientObj.direccion}</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--color-border-light)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '10.5pt', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 700 }}>Antecedentes Clínicos del Paciente</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px 24px' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, display: 'block', marginBottom: 2 }}>Alergias Conocidas:</span>
                    <div style={{ fontSize: '10pt', fontWeight: 600 }}>{selectedPatientObj.alergias || 'Ninguna'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, display: 'block', marginBottom: 2 }}>Enfermedades Previas / Diagnósticos Crónicos:</span>
                    <div style={{ fontSize: '10pt', fontWeight: 600 }}>{selectedPatientObj.enfermedadesPrevias || 'Ninguna registrada'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, display: 'block', marginBottom: 2 }}>Medicación Actual / Uso Habitual:</span>
                    <div style={{ fontSize: '10pt', fontWeight: 600 }}>{selectedPatientObj.medicamentosActuales || 'Ninguno'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, display: 'block', marginBottom: 2 }}>Contacto en Caso de Emergencia:</span>
                    <div style={{ fontSize: '10pt', fontWeight: 600 }}>{selectedPatientObj.contactoEmergencia || 'No registrado'}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Summary (no-print) */}
      {!loadingStats && stats && (
        <div className="stat-cards no-print" style={{ marginBottom: 16 }}>
          <motion.div variants={itemVariants} className="stat-card hover-float">
            <div className="stat-card-icon blue"><IconBarChart width={20} height={20}/></div>
            <div>
              <div className="stat-card-label">Resultados Encontrados</div>
              <div className="stat-card-value counter-value">{consultas.length}</div>
              <div className="stat-card-sub">Atenciones en el filtro actual</div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card hover-float">
            <div className="stat-card-icon green"><IconBarChart width={20} height={20}/></div>
            <div>
              <div className="stat-card-label">Pacientes Distintos Atendidos</div>
              <div className="stat-card-value counter-value">
                {new Set(consultas.map(c => c.paciente?.id_paciente).filter(Boolean)).size}
              </div>
              <div className="stat-card-sub">En el rango filtrado</div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="stat-card hover-float">
            <div className="stat-card-icon slate"><IconBarChart width={20} height={20}/></div>
            <div>
              <div className="stat-card-label">Total Pacientes en Sistema</div>
              <div className="stat-card-value counter-value">{stats.totalPacientes}</div>
              <div className="stat-card-sub">{stats.pacientesActivos} activos actualmente</div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed List Card */}
      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Listado Detallado de Atenciones Clínicas</h2>
          <span className="chip">{consultas.length} registros</span>
        </div>
        <div className="table-wrapper no-print">
          {loadingReport ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <div className="skeleton skeleton-circle" style={{ width: 30, height: 30, animation: 'spin 1s linear infinite', borderRadius: '50%', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', background: 'transparent' }} />
            </div>
          ) : consultas.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Paciente</th>
                  <th>C.I.</th>
                  <th>Médico Tratante</th>
                  <th>Área / Especialidad</th>
                  <th>Diagnóstico</th>
                  <th>Evolución</th>
                  <th>Prescripción y Tratamiento</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((c, i) => (
                  <tr key={c.id_consulta}>
                    <td style={{ fontSize: 12.5, whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {new Date(c.fecha_hora).toLocaleDateString('es-BO')} {new Date(c.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{c.paciente?.nombre}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12.5 }}>{c.paciente?.ci}</td>
                    <td style={{ fontWeight: 600 }}>{c.medico?.nombre}</td>
                    <td><span className="badge badge-primary" style={{ padding: '3px 8px', fontSize: 11 }}>{c.area_medica}</span></td>
                    <td style={{ fontSize: 13, maxWidth: 220, wordBreak: 'break-word', lineHeight: 1.4 }}>
                      <strong>{c.diagnostico_final}</strong>
                    </td>
                    <td>
                      <span className={`badge ${c.estado_paciente === 'Alta Médica' ? 'badge-success' : c.estado_paciente === 'Hospitalizado' ? 'badge-neutral' : 'badge-info'}`} style={{ padding: '3px 8px', fontSize: 11 }}>
                        {c.estado_paciente || 'En Seguimiento'}
                      </span>
                      {c.notas_seguimiento && (
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                          Nota: {c.notas_seguimiento}
                        </p>
                      )}
                    </td>
                    <td style={{ fontSize: 12.5, maxWidth: 240, wordBreak: 'break-word', lineHeight: 1.4 }}>
                      <div>{c.tratamiento}</div>
                      {(c.tratamiento_duracion || c.tratamiento_horarios) && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {c.tratamiento_duracion && (
                            <span style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-light)' }}>
                              Duración: {c.tratamiento_duracion}
                            </span>
                          )}
                          {c.tratamiento_horarios && (
                            <span style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-light)' }}>
                              Toma: {c.tratamiento_horarios}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No se encontraron consultas médicas con los filtros especificados.
            </div>
          )}
        </div>

        {/* Print-only view: Premium layout with banded items, patient photos, and wide rows */}
        <div className="print-only" style={{ padding: '12px' }}>
          {consultas.map((c, i) => (
            <div key={`print-c-${c.id_consulta}`} className="consultation-print-card">
              {/* Consultation header */}
              <div className="consultation-print-header">
                <div>Fecha/Hora: {new Date(c.fecha_hora).toLocaleDateString('es-BO')} {new Date(c.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>Área / Especialidad: <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{c.area_medica}</span></div>
                <div>Médico Tratante: <strong>{c.medico?.nombre}</strong></div>
              </div>
              
              {/* Consultation details */}
              <div style={{ display: 'flex', minHeight: '90px' }}>
                {/* Patient photo and info */}
                <div className="consultation-print-patient-col">
                  {c.paciente?.foto ? (
                    <img src={c.paciente.foto} alt="Foto Paciente" className="consultation-print-patient-photo" />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px dashed #64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8pt', color: '#64748b', background: '#fff', textAlign: 'center' }}>Sin Foto</div>
                  )}
                  <div>
                    <div className="consultation-print-patient-name">{c.paciente?.nombre}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="consultation-print-patient-ci">C.I. {c.paciente?.ci}</span>
                    </div>
                  </div>
                </div>
                
                {/* Clinical details */}
                <div className="consultation-print-details-col">
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <span className="consultation-print-section-title">Diagnóstico Clínico:</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.35, fontSize: '10pt' }}>{c.diagnostico_final}</div>
                    </div>
                    <div>
                      <span className="consultation-print-section-title">Estado de Evolución:</span>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {c.estado_paciente || 'En Seguimiento'}
                      </div>
                      {c.notas_seguimiento && (
                        <p style={{ fontSize: '8.5pt', color: '#64748b', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                          Nota de control: {c.notas_seguimiento}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="consultation-print-prescription-box">
                    <span className="consultation-print-section-title" style={{ color: '#166534' }}>Receta y Tratamiento Indicado:</span>
                    <div style={{ color: '#14532d', lineHeight: 1.45, fontWeight: 600, fontSize: '10pt' }}>{c.tratamiento}</div>
                    {(c.tratamiento_duracion || c.tratamiento_horarios) && (
                      <div style={{ marginTop: 10, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {c.tratamiento_duracion && (
                          <span style={{ fontSize: '8pt', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 4, border: '1px solid #bbf7d0', fontWeight: 700 }}>
                            Duración: {c.tratamiento_duracion}
                          </span>
                        )}
                        {c.tratamiento_horarios && (
                          <span style={{ fontSize: '8pt', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 4, border: '1px solid #bbf7d0', fontWeight: 700 }}>
                            Horarios: {c.tratamiento_horarios}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Section (no-print) */}
      {!loadingStats && stats && chartData.length > 0 && (
        <motion.div variants={itemVariants} className="card no-print" style={{ marginBottom: 16 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Estadísticas Generales de Demanda Mensual</h2>
            <select className="form-control" value={vista} onChange={e=>setVista(e.target.value)} style={{ width: 160, padding: '4px 8px', fontSize: 12 }}>
              <option value="barras">Gráfico de Barras</option>
              <option value="lineas">Gráfico de Líneas</option>
            </select>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              {vista === 'barras' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="consultas" name="Consultas Totales" fill="url(#barBlue)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="nuevos"    name="Nuevos Pacientes (Est.)"  fill="url(#barGreen)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="consultas" name="Consultas Totales" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3.5 }} />
                  <Line type="monotone" dataKey="nuevos"    name="Nuevos Pacientes (Est.)"  stroke="#10B981" strokeWidth={2.5} dot={{ r: 3.5 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Firma del Responsable en Impresión */}
      <div className="print-only-footer" style={{ display: 'none', marginTop: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', width: 220, borderTop: '1px solid #000', paddingTop: 8 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#000' }}>Director Médico / Responsable</p>
            <p style={{ margin: '2px 0 0 0', fontSize: 9, color: '#555' }}>Firma y Sello</p>
          </div>
          <div style={{ textAlign: 'center', width: 220, borderTop: '1px solid #000', paddingTop: 8 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#000' }}>Responsable de Archivo</p>
            <p style={{ margin: '2px 0 0 0', fontSize: 9, color: '#555' }}>Firma y Sello</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
