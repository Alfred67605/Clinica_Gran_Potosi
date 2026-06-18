/**
 * RegistroClinico.jsx — Premium Clinical Record
 * Conectado al backend Laravel.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSave, IconUser, IconStethoscope, IconActivity, IconCheck, IconAlert } from '../components/Icons';
import { crearConsulta } from '../services/api';

const INITIAL = {
  fecha: new Date().toISOString().split('T')[0],
  hora: new Date().toTimeString().split(' ')[0].substring(0,5),
  doctor: 'Dr. Roberto López',
  tipo: 'Consulta General',
  area: 'Medicina General',
  prioridad: 'Baja',
  sintomas: '',
  diagnosticoPreliminar: '',
  diagnosticoFinal: '',
  tratamiento: '',
  indicaciones: '',
  peso: '',
  altura: '',
  presion: '',
  fc: '',
  temp: '',
  spo2: ''
};

function validate(f) {
  const e = {};
  if (!f.fecha) e.fecha = 'Fecha requerida.';
  if (!f.hora) e.hora = 'Hora requerida.';
  if (!f.doctor) e.doctor = 'Doctor requerido.';
  if (!f.diagnosticoFinal.trim()) e.diagnosticoFinal = 'El diagnóstico final es obligatorio.';
  if (!f.tratamiento.trim()) e.tratamiento = 'El tratamiento es obligatorio.';
  
  if (f.peso && (isNaN(f.peso) || f.peso < 0 || f.peso > 300)) e.peso = 'Peso inválido.';
  if (f.altura && (isNaN(f.altura) || f.altura < 0 || f.altura > 3)) e.altura = 'Altura inválida.';
  if (f.presion && !/^\d{2,3}\/\d{2,3}$/.test(f.presion)) e.presion = 'Formato inválido (Ej: 120/80).';
  return e;
}

export default function RegistroClinico({ pacientes, reloadPacientes, pacienteSeleccionadoId, usuarios }) {
  const paciente = pacientes.find(p => p.id === pacienteSeleccionadoId) || pacientes[0];
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!paciente) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <IconAlert width={48} height={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--color-warning)' }} />
        <h3 style={{ marginBottom: 8 }}>No hay pacientes disponibles</h3>
        <p style={{ fontSize: 13.5 }}>Debe registrar un paciente antes de poder añadir consultas clínicas.</p>
      </div>
    );
  }

  const medicos = usuarios.filter(u => u.rol === 'Médico' && u.estado === 'Activo');

  function handleChange(e) {
    const { name, value } = e.target;
    const u = { ...form, [name]: value };
    setForm(u);
    if (touched[name]) setErrors(p => ({ ...p, [name]: validate(u)[name] }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(form)[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const all = Object.keys(INITIAL).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(all);
    const errs = validate(form);
    setErrors(errs);
    
    if (!Object.keys(errs).length) {
      try {
        setSaving(true);
        const imcCalc = (form.peso && form.altura) ? (parseFloat(form.peso) / (parseFloat(form.altura) ** 2)).toFixed(2) : null;
        
        // Encontrar ID del médico seleccionado
        const medicoSeleccionado = medicos.find(m => m.nombre === form.doctor) || medicos[0];

        await crearConsulta({
          id_paciente: paciente.id,
          id_usuario: medicoSeleccionado ? medicoSeleccionado.id : 1, // Fallback al ID 1
          fecha_hora: `${form.fecha} ${form.hora}:00`,
          tipo_consulta: form.tipo,
          area_medica: form.area,
          prioridad_medica: form.prioridad,
          sintomas_observados: form.sintomas.trim() || null,
          diagnostico_preliminar: form.diagnosticoPreliminar.trim() || null,
          diagnostico_final: form.diagnosticoFinal.trim(),
          tratamiento: form.tratamiento.trim(),
          indicaciones_medicas: form.indicaciones.trim() || null,
          peso: form.peso ? parseFloat(form.peso) : null,
          altura: form.altura ? parseFloat(form.altura) : null,
          imc: imcCalc,
          presion_arterial: form.presion || null,
          frecuencia_cardiaca: form.fc ? parseInt(form.fc, 10) : null,
          temperatura: form.temp ? parseFloat(form.temp) : null,
          saturacion_oxigeno: form.spo2 ? parseInt(form.spo2, 10) : null,
        });

        if (reloadPacientes) await reloadPacientes();

        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          setForm(INITIAL);
          setTouched({});
          setErrors({});
        }, 3000);
      } catch (err) {
        setErrors({ general: err.message });
      } finally {
        setSaving(false);
      }
    }
  }

  function cls(name) {
    if (touched[name] && errors[name]) return 'form-control error';
    if (touched[name] && !errors[name] && form[name]) return 'form-control modified';
    return 'form-control';
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Registro Clínico</h1>
          <p>Añada una nueva consulta médica para el paciente seleccionado.</p>
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 18 }} exit={{ opacity: 0, height: 0 }} className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <IconCheck width={18} height={18} />
            <strong style={{ fontSize: 13.5 }}>Consulta registrada exitosamente.</strong> El historial del paciente ha sido actualizado.
          </motion.div>
        )}
        {errors.general && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 18 }} exit={{ opacity: 0, height: 0 }} className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <IconAlert width={18} height={18} />
            <strong style={{ fontSize: 13.5 }}>Error: {errors.general}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-bg), var(--color-primary-light))', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser width={20} height={20} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 2 }}>Paciente Actual</p>
            <p style={{ fontWeight: 800, fontSize: 16 }}>{paciente.nombre}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Carnet de Identidad</p>
            <p style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{paciente.ci}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2><div className="card-header-icon"><IconStethoscope width={15} height={15} /></div>Detalles de la Consulta</h2>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="fecha">Fecha <span className="required">*</span></label>
                <input id="fecha" name="fecha" type="date" className={cls('fecha')} value={form.fecha} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.fecha && errors.fecha && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.fecha}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hora">Hora <span className="required">*</span></label>
                <input id="hora" name="hora" type="time" className={cls('hora')} value={form.hora} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.hora && errors.hora && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.hora}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doctor">Médico Asignado <span className="required">*</span></label>
                <select id="doctor" name="doctor" className={cls('doctor')} value={form.doctor} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">— Seleccionar —</option>
                  {medicos.length > 0 ? (
                    medicos.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)
                  ) : (
                    <option value="Dr. Roberto López">Dr. Roberto López</option>
                  )}
                </select>
                <AnimatePresence>
                  {touched.doctor && errors.doctor && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.doctor}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prioridad">Prioridad <span className="required">*</span></label>
                <select id="prioridad" name="prioridad" className={cls('prioridad')} value={form.prioridad} onChange={handleChange} onBlur={handleBlur}>
                  <option value="Baja">Baja (Rutina)</option>
                  <option value="Media">Media (Atención Pronta)</option>
                  <option value="Alta">Alta (Urgencia)</option>
                  <option value="Crítica">Crítica (Emergencia)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tipo">Tipo de Consulta <span className="required">*</span></label>
                <select id="tipo" name="tipo" className={cls('tipo')} value={form.tipo} onChange={handleChange} onBlur={handleBlur}>
                  <option value="Consulta General">Consulta General</option>
                  <option value="Consulta Especialidad">Consulta Especialidad</option>
                  <option value="Control">Control / Reevaluación</option>
                  <option value="Emergencia">Emergencia</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="area">Área Médica <span className="required">*</span></label>
                <input id="area" name="area" type="text" className={cls('area')} value={form.area} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Cardiología" />
              </div>
            </div>

            <div className="section-divider" style={{ marginTop: 24 }}>
              <span><IconActivity width={16} height={16} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'text-bottom' }} /> Signos Vitales Triage</span>
              <hr />
            </div>
            
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="presion">P. Arterial</label>
                <input id="presion" name="presion" type="text" className={cls('presion')} value={form.presion} onChange={handleChange} onBlur={handleBlur} placeholder="120/80" />
                <AnimatePresence>
                  {touched.presion && errors.presion && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error"><IconAlert width={12} height={12} />{errors.presion}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fc">Frec. Cardíaca</label>
                <div style={{ position: 'relative' }}>
                  <input id="fc" name="fc" type="number" className={cls('fc')} value={form.fc} onChange={handleChange} onBlur={handleBlur} placeholder="72" />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 12, pointerEvents: 'none' }}>bpm</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="temp">Temperatura</label>
                <div style={{ position: 'relative' }}>
                  <input id="temp" name="temp" type="number" step="0.1" className={cls('temp')} value={form.temp} onChange={handleChange} onBlur={handleBlur} placeholder="36.5" />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 12, pointerEvents: 'none' }}>°C</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="spo2">Sat. Oxígeno</label>
                <div style={{ position: 'relative' }}>
                  <input id="spo2" name="spo2" type="number" className={cls('spo2')} value={form.spo2} onChange={handleChange} onBlur={handleBlur} placeholder="98" />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 12, pointerEvents: 'none' }}>%</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="peso">Peso</label>
                <div style={{ position: 'relative' }}>
                  <input id="peso" name="peso" type="number" step="0.1" className={cls('peso')} value={form.peso} onChange={handleChange} onBlur={handleBlur} placeholder="70.5" />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 12, pointerEvents: 'none' }}>kg</span>
                </div>
                <AnimatePresence>
                  {touched.peso && errors.peso && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error"><IconAlert width={12} height={12} />{errors.peso}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="altura">Altura</label>
                <div style={{ position: 'relative' }}>
                  <input id="altura" name="altura" type="number" step="0.01" className={cls('altura')} value={form.altura} onChange={handleChange} onBlur={handleBlur} placeholder="1.75" />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 12, pointerEvents: 'none' }}>m</span>
                </div>
                <AnimatePresence>
                  {touched.altura && errors.altura && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error"><IconAlert width={12} height={12} />{errors.altura}</motion.span>}
                </AnimatePresence>
              </div>
            </div>

            <div className="section-divider" style={{ marginTop: 24 }}><span>Evaluación Médica</span><hr /></div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label" htmlFor="sintomas">Síntomas Observados</label>
                <textarea id="sintomas" name="sintomas" className="form-control" rows="2" value={form.sintomas} onChange={handleChange}></textarea>
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="diagnosticoPreliminar">Diagnóstico Preliminar</label>
                <input id="diagnosticoPreliminar" name="diagnosticoPreliminar" type="text" className="form-control" value={form.diagnosticoPreliminar} onChange={handleChange} />
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="diagnosticoFinal">Diagnóstico Final (CIE-10) <span className="required">*</span></label>
                <input id="diagnosticoFinal" name="diagnosticoFinal" type="text" className={cls('diagnosticoFinal')} value={form.diagnosticoFinal} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.diagnosticoFinal && errors.diagnosticoFinal && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.diagnosticoFinal}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="tratamiento">Tratamiento Recetado <span className="required">*</span></label>
                <textarea id="tratamiento" name="tratamiento" className={cls('tratamiento')} rows="3" value={form.tratamiento} onChange={handleChange} onBlur={handleBlur}></textarea>
                <AnimatePresence>
                  {touched.tratamiento && errors.tratamiento && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.tratamiento}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="indicaciones">Indicaciones Médicas</label>
                <textarea id="indicaciones" name="indicaciones" className="form-control" rows="2" value={form.indicaciones} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 32 }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setForm(INITIAL); setErrors({}); setTouched({}); }}>
                Descartar Cambios
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <IconSave width={15} height={15} /> {saving ? 'Guardando...' : 'Guardar y Finalizar Consulta'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
