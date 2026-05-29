/**
 * RegistroClinico.jsx — Premium Clinical Module
 * Fully animated step transitions, dynamic tab indicators, auto-calculating fields, print layouts.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconClipboard, IconUser, IconCheck, IconAlert, 
  IconX, IconPrint, IconSave, IconSearch, IconActivity
} from '../components/Icons';

const AREAS_MEDICAS = [
  'Consulta General', 'Cardiología', 'Endocrinología', 'Pediatría',
  'Ginecología', 'Neumología', 'Odontología', 'Traumatología'
];

const INITIAL_FORM = {
  nombre: '', ci: '', fechaNacimiento: '', edad: '', sexo: '', estadoCivil: 'Soltero/a',
  direccion: '', ciudad: 'Potosí', telefono: '', correo: '', contactoEmergencia: '',
  peso: '', altura: '', imc: '', tipoSangre: '', frecuenciaCardiaca: '',
  presionArterial: '', temperatura: '', saturacionOxigeno: '', alergias: '',
  enfermedadesPrevias: '', medicamentosActuales: '', antecedentesFamiliares: '',
  historialQuirurgico: '', observacionesGenerales: '', diagnosticoPreliminar: '',
  diagnosticoFinal: '', tratamiento: '', indicacionesMedicas: '',
  fechaIngreso: new Date().toISOString().slice(0, 10), doctorAsignado: 'Dr. Roberto López',
  areaMedica: 'Consulta General', estado: 'Activo', prioridadMedica: 'Baja'
};

export default function RegistroClinico({ pacientes, setPacientes, pacienteSeleccionadoId, setPacienteSeleccionadoId, onNavigate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState('personales');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    if (pacienteSeleccionadoId) {
      const selected = pacientes.find(p => p.id === pacienteSeleccionadoId);
      if (selected) {
        setForm(prev => ({
          ...prev, ...selected,
          peso: selected.peso || '', altura: selected.altura || '', imc: selected.imc || '',
          frecuenciaCardiaca: selected.frecuenciaCardiaca || '', presionArterial: selected.presionArterial || '',
          temperatura: selected.temperatura || '', saturacionOxigeno: selected.saturacionOxigeno || '',
          diagnosticoPreliminar: '', diagnosticoFinal: '', tratamiento: '', indicacionesMedicas: '',
          fechaIngreso: new Date().toISOString().slice(0, 10)
        }));
        setSearchQuery(selected.nombre);
      }
    }
  }, [pacienteSeleccionadoId, pacientes]);

  useEffect(() => {
    const pesoNum = parseFloat(form.peso);
    const alturaNum = parseFloat(form.altura);
    if (pesoNum && alturaNum && alturaNum > 0) {
      setForm(prev => ({ ...prev, imc: (pesoNum / (alturaNum * alturaNum)).toFixed(2) }));
    } else {
      setForm(prev => ({ ...prev, imc: '' }));
    }
  }, [form.peso, form.altura]);

  useEffect(() => {
    if (form.fechaNacimiento) {
      const birthDate = new Date(form.fechaNacimiento);
      const calculatedAge = Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
      if (!isNaN(calculatedAge)) setForm(prev => ({ ...prev, edad: calculatedAge }));
    }
  }, [form.fechaNacimiento]);

  const suggestions = searchQuery.trim() !== ''
    ? pacientes.filter(p => p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || p.ci.includes(searchQuery))
    : [];

  function handleSelectPatient(p) {
    setForm(prev => ({
      ...prev, ...p,
      peso: p.peso || '', altura: p.altura || '', imc: p.imc || '',
      frecuenciaCardiaca: p.frecuenciaCardiaca || '', presionArterial: p.presionArterial || '',
      temperatura: p.temperatura || '', saturacionOxigeno: p.saturacionOxigeno || '',
      diagnosticoPreliminar: '', diagnosticoFinal: '', tratamiento: '', indicacionesMedicas: '',
      fechaIngreso: new Date().toISOString().slice(0, 10)
    }));
    setPacienteSeleccionadoId(p.id);
    setSearchQuery(p.nombre);
    setShowSuggestions(false);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }

  function getImcCategory(imcValue) {
    const val = parseFloat(imcValue);
    if (isNaN(val)) return { text: '—', color: 'var(--color-text-muted)' };
    if (val < 18.5) return { text: 'Bajo peso', color: 'var(--color-warning)' };
    if (val >= 18.5 && val <= 24.9) return { text: 'Normal', color: 'var(--color-success)' };
    if (val >= 25 && val <= 29.9) return { text: 'Sobrepeso', color: 'var(--color-warning)' };
    return { text: 'Obesidad', color: 'var(--color-danger)' };
  }

  const imcCat = getImcCategory(form.imc);

  function validateForm() {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!form.ci.trim()) errs.ci = 'El documento CI es obligatorio.';
    if (!form.diagnosticoFinal.trim()) errs.diagnosticoFinal = 'Requerido para registro clínico.';
    if (!form.tratamiento.trim()) errs.tratamiento = 'El plan de tratamiento es requerido.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (errs.nombre || errs.ci) setActiveTab('personales');
      else setActiveTab('consulta');
      return;
    }

    const nuevaConsulta = {
      fecha: new Date(form.fechaIngreso).toLocaleDateString('es-BO') || new Date().toLocaleDateString('es-BO'),
      tipo: 'Consulta Especialidad',
      medico: form.doctorAsignado,
      areaMedica: form.areaMedica,
      diagnostico: form.diagnosticoFinal,
      tratamiento: form.tratamiento,
      indicaciones: form.indicacionesMedicas,
      sintomas: form.diagnosticoPreliminar || 'Control clínico',
      presionArterial: form.presionArterial,
      peso: parseFloat(form.peso),
      altura: parseFloat(form.altura),
      imc: parseFloat(form.imc),
      frecuenciaCardiaca: parseInt(form.frecuenciaCardiaca, 10),
      temperatura: parseFloat(form.temperatura),
      saturacionOxigeno: parseInt(form.saturacionOxigeno, 10),
      prioridad: form.prioridadMedica,
      estadoClinico: form.estado
    };

    let updatedPacientes = [];
    const targetIdx = pacientes.findIndex(p => p.ci === form.ci);

    if (targetIdx !== -1) {
      const pacienteExistente = pacientes[targetIdx];
      const pacienteActualizado = {
        ...pacienteExistente, ...form,
        historialConsultas: [nuevaConsulta, ...(pacienteExistente.historialConsultas || [])],
        id: pacienteExistente.id
      };
      updatedPacientes = pacientes.map((p, idx) => idx === targetIdx ? pacienteActualizado : p);
      setPacienteSeleccionadoId(pacienteExistente.id);
    } else {
      const nuevoId = pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1;
      updatedPacientes = [...pacientes, { ...form, id: nuevoId, historialConsultas: [nuevaConsulta] }];
      setPacienteSeleccionadoId(nuevoId);
    }

    setPacientes(updatedPacientes);
    setPrintData({ ...form, consulta: nuevaConsulta });
    setSaved(true);
  }

  function handleReset() {
    setForm(INITIAL_FORM); setSearchQuery(''); setSaved(false);
    setPrintData(null); setErrors({}); setActiveTab('personales');
    setPacienteSeleccionadoId(null);
  }

  const filledFields = [
    form.nombre, form.ci, form.fechaNacimiento, form.sexo, form.telefono,
    form.peso, form.altura, form.presionArterial, form.frecuenciaCardiaca,
    form.alergias, form.diagnosticoPreliminar, form.diagnosticoFinal,
    form.tratamiento, form.doctorAsignado, form.areaMedica
  ].filter(val => val !== undefined && val !== '').length;
  const progressPercent = Math.min(Math.round((filledFields / 15) * 100), 100);

  const tabs = [
    { id: 'personales', label: 'Datos Personales', icon: IconUser },
    { id: 'fisicos', label: 'Constantes Físicas', icon: IconActivity },
    { id: 'antecedentes', label: 'Antecedentes', icon: IconClipboard },
    { id: 'consulta', label: 'Diagnóstico', icon: IconClipboard },
    { id: 'admin', label: 'Administrativo', icon: IconCheck }
  ];

  const tabVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
    exit: { opacity: 0, x: 15, transition: { duration: 0.15 } }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Registro Clínico Completo</h1>
          <p>Formulario de consulta médica detallada, constantes fisiológicas y emisión de receta.</p>
        </div>
        <button className="btn btn-ghost" onClick={handleReset}><IconX width={14} height={14}/> Limpiar Formulario</button>
      </div>

      <AnimatePresence>
        {saved && printData && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 18 }} exit={{ opacity: 0, height: 0 }} className="alert alert-success" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCheck width={18} height={18} />
                <strong style={{ fontSize: 14 }}>¡Consulta y registro clínico guardado exitosamente!</strong>
              </div>
              <p style={{ fontSize: 13.5, margin: 0 }}>La información ha sido guardada en la ficha del paciente. Puede imprimir el documento médico oficial.</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-success btn-sm" onClick={() => setTimeout(()=>window.print(), 200)}>
                  <IconPrint width={14} height={14} /> Imprimir / Exportar PDF
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('historial')}>Ver Historial</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-body" style={{ padding: '16px 24px' }}>
          <div className="autocomplete-wrapper" style={{ maxWidth: 500 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              Buscar paciente registrado para auto-completar datos:
            </label>
            <div className="search-bar" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <IconSearch width={16} height={16} />
              <input 
                type="text" value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); if(e.target.value==='') setPacienteSeleccionadoId(null); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Escriba el nombre o CI del paciente..."
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setForm(INITIAL_FORM); setPacienteSeleccionadoId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <IconX width={14} height={14} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="autocomplete-dropdown" style={{ top: 'calc(100% + 4px)', boxShadow: 'var(--shadow-lg)' }}>
                  {suggestions.map(p => (
                    <div key={p.id} className="autocomplete-item" onClick={() => handleSelectPatient(p)}>
                      <span style={{ fontWeight: 600 }}>{p.nombre}</span>
                      <div className="autocomplete-item-details">CI: {p.ci} &nbsp;·&nbsp; {p.edad} años</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="form-progress-bar" style={{ background: 'var(--color-surface)', padding: '16px 24px', borderRadius: 'var(--radius-lg)', marginBottom: 20, border: '1px solid var(--color-border-light)' }}>
        <IconClipboard width={18} height={18} style={{ color: 'var(--color-primary)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12.5, fontWeight: 700 }}>
            <span>Completitud del Expediente Médico</span>
            <span style={{ color: 'var(--color-primary)' }}>{progressPercent}%</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-glow))' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ borderBottom: '2px solid var(--color-border-light)', marginBottom: 24 }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ padding: '12px 16px', position: 'relative' }}
          >
            <tab.icon width={14} height={14} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-indicator" style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--color-primary)' }} />
            )}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <AnimatePresence mode="wait">
              {activeTab === 'personales' && (
                <motion.div key="personales" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="section-divider"><span>Ficha Identificativa</span><hr /></div>
                  <div className="form-grid">
                    <div className="form-group full">
                      <label className="form-label" htmlFor="nombre">Nombre Completo <span className="required">*</span></label>
                      <input id="nombre" name="nombre" type="text" className={`form-control${errors.nombre ? ' error' : ''}`} value={form.nombre} onChange={handleInputChange} placeholder="Ej: Juan Carlos Mamani" />
                      {errors.nombre && <span className="form-error"><IconAlert width={12} height={12} />{errors.nombre}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="ci">Documento de Identidad <span className="required">*</span></label>
                      <input id="ci" name="ci" type="text" className={`form-control${errors.ci ? ' error' : ''}`} value={form.ci} onChange={handleInputChange} placeholder="Ej: 7654321" />
                      {errors.ci && <span className="form-error"><IconAlert width={12} height={12} />{errors.ci}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                      <input id="fechaNacimiento" name="fechaNacimiento" type="date" className="form-control" value={form.fechaNacimiento} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Edad Calculada</label>
                      <input type="number" className="form-control" value={form.edad} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="sexo">Sexo Biológico</label>
                      <select id="sexo" name="sexo" className="form-control" value={form.sexo} onChange={handleInputChange}>
                        <option value="">— Seleccionar —</option>
                        <option value="M">Masculino</option><option value="F">Femenino</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'fisicos' && (
                <motion.div key="fisicos" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="section-divider"><span>Medidas Antropométricas</span><hr /></div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Peso (Kg)</label><input name="peso" type="number" step="0.1" className="form-control" value={form.peso} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Altura (m)</label><input name="altura" type="number" step="0.01" className="form-control" value={form.altura} onChange={handleInputChange} /></div>
                    <div className="form-group">
                      <label className="form-label">IMC Calculado</label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input type="text" className="form-control" value={form.imc} disabled style={{ fontWeight: 800 }} />
                        <span className="badge" style={{ background: imcCat.color, color: 'white', padding: '6px 12px' }}>{imcCat.text}</span>
                      </div>
                    </div>
                  </div>
                  <div className="section-divider" style={{ marginTop: 24 }}><span>Constantes Vitales</span><hr /></div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Presión Arterial (mmHg)</label><input name="presionArterial" type="text" className="form-control" value={form.presionArterial} onChange={handleInputChange} placeholder="120/80" /></div>
                    <div className="form-group"><label className="form-label">Frecuencia Cardíaca (lpm)</label><input name="frecuenciaCardiaca" type="number" className="form-control" value={form.frecuenciaCardiaca} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Temperatura (°C)</label><input name="temperatura" type="number" step="0.1" className="form-control" value={form.temperatura} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">SpO2 (%)</label><input name="saturacionOxigeno" type="number" className="form-control" value={form.saturacionOxigeno} onChange={handleInputChange} /></div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'antecedentes' && (
                <motion.div key="antecedentes" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="section-divider"><span>Ficha de Antecedentes</span><hr /></div>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div className="form-group"><label className="form-label">Alergias Conocidas</label><textarea name="alergias" className="form-control" rows="2" value={form.alergias} onChange={handleInputChange} placeholder="Escriba 'Ninguna' si no tiene." /></div>
                    <div className="form-group"><label className="form-label">Patologías Previas</label><textarea name="enfermedadesPrevias" className="form-control" rows="2" value={form.enfermedadesPrevias} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Medicación Habitual</label><textarea name="medicamentosActuales" className="form-control" rows="2" value={form.medicamentosActuales} onChange={handleInputChange} /></div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'consulta' && (
                <motion.div key="consulta" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="section-divider"><span>Diagnóstico Clínico</span><hr /></div>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div className="form-group"><label className="form-label">Motivo de Consulta</label><textarea name="diagnosticoPreliminar" className="form-control" rows="2" value={form.diagnosticoPreliminar} onChange={handleInputChange} /></div>
                    <div className="form-group">
                      <label className="form-label">Diagnóstico Final <span className="required">*</span></label>
                      <textarea name="diagnosticoFinal" className={`form-control${errors.diagnosticoFinal ? ' error' : ''}`} rows="2" value={form.diagnosticoFinal} onChange={handleInputChange} />
                      {errors.diagnosticoFinal && <span className="form-error"><IconAlert width={12} height={12} />{errors.diagnosticoFinal}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Plan de Tratamiento <span className="required">*</span></label>
                      <textarea name="tratamiento" className={`form-control${errors.tratamiento ? ' error' : ''}`} rows="3" value={form.tratamiento} onChange={handleInputChange} />
                      {errors.tratamiento && <span className="form-error"><IconAlert width={12} height={12} />{errors.tratamiento}</span>}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'admin' && (
                <motion.div key="admin" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="section-divider"><span>Gestión Administrativa</span><hr /></div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Fecha Atención</label><input name="fechaIngreso" type="date" className="form-control" value={form.fechaIngreso} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Especialidad</label>
                      <select name="areaMedica" className="form-control" value={form.areaMedica} onChange={handleInputChange}>
                        {AREAS_MEDICAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Prioridad</label>
                      <select name="prioridadMedica" className="form-control" value={form.prioridadMedica} onChange={handleInputChange}>
                        <option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Estado Clínico</label>
                      <select name="estado" className="form-control" value={form.estado} onChange={handleInputChange}>
                        <option value="Activo">Estable / Alta</option><option value="Inactivo">Observación</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-actions" style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {activeTab !== 'personales' && (
                  <button type="button" className="btn btn-ghost" onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1].id);
                  }}>« Anterior</button>
                )}
              </div>
              <div>
                {activeTab !== 'admin' ? (
                  <button type="button" className="btn btn-primary" onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                  }}>Siguiente »</button>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-success btn-lg">
                    <IconSave width={15} height={15} /> Guardar Expediente
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* PRINT STYLES - Unchanged structure, kept for PDF functionality */}
      {printData && (
        <div id="clinical-print-section" style={{ background: '#fff', color: '#000', padding: '40px', fontFamily: 'sans-serif', display: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1e3a8a', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', color: '#1e3a8a', fontWeight: 'bold' }}>CLÍNICA GRAN POTOSÍ</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569' }}>Servicio Médico Integral</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>RECETA Y EXPEDIENTE</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Fecha: <strong>{new Date(printData.fechaIngreso).toLocaleDateString('es-BO')}</strong></p>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: '1px solid #cbd5e1', fontSize: '13px', color: '#1e3a8a' }}>Datos del Paciente</h3>
            <p style={{ fontSize: 12 }}><strong>Nombre:</strong> {printData.nombre} &nbsp; <strong>CI:</strong> {printData.ci}</p>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: '1px solid #cbd5e1', fontSize: '13px', color: '#1e3a8a' }}>Diagnóstico y Tratamiento</h3>
            <p style={{ fontSize: 12 }}><strong>Diagnóstico:</strong> {printData.diagnosticoFinal}</p>
            <p style={{ fontSize: 12, marginTop: 10 }}><strong>Tratamiento Médico Prescrito:</strong><br />{printData.tratamiento}</p>
          </div>
          <div style={{ marginTop: '60px', textAlign: 'center', fontSize: 12 }}>
            <div style={{ borderTop: '1px solid #000', width: '200px', margin: '0 auto', paddingTop: 8 }}>Firma del Médico Tratante</div>
            <p>{printData.doctorAsignado}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
