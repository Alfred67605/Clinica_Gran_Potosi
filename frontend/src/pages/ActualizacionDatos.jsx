/**
 * ActualizacionDatos.jsx — Premium Data Edit
 * Conectado al backend Laravel para persistencia en PostgreSQL.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconEdit, IconSave, IconRefresh, IconAlert, IconCheck } from '../components/Icons';
import { actualizarPaciente } from '../services/api';
import CameraCapture from '../components/CameraCapture';

function validate(f) {
  const e = {};
  if (!f.nombre.trim() || f.nombre.trim().length < 5) e.nombre = 'Nombre requerido (mínimo 5 caracteres).';
  if (!/^\d{6,10}$/.test(f.ci.trim()))      e.ci       = 'CI inválido (6-10 dígitos).';
  if (!/^\d{7,10}$/.test(f.telefono.trim())) e.telefono = 'Teléfono inválido (7-10 dígitos).';
  if (!f.direccion.trim())                   e.direccion = 'Dirección requerida.';
  if (!f.fechaNacimiento)                    e.fechaNacimiento = 'Fecha requerida.';
  return e;
}

const INITIAL_FORM = { nombre: '', ci: '', telefono: '', direccion: '', fechaNacimiento: '', sexo: '', tipoSangre: 'O+', foto: null };

export default function ActualizacionDatos({ pacientes, reloadPacientes, pacienteSeleccionadoId, onNavigate }) {
  const original = pacientes.find(p => p.id === pacienteSeleccionadoId) || pacientes[0];

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (original) {
      setForm({
        nombre: original.nombre || '',
        ci: original.ci || '',
        telefono: original.telefono || '',
        direccion: original.direccion || '',
        fechaNacimiento: original.fechaNacimiento || '',
        sexo: original.sexo || '',
        tipoSangre: original.tipoSangre || 'O+',
        foto: original.foto || null
      });
      setTouched({});
      setErrors({});
    }
  }, [original]);

  if (!original) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <IconAlert width={48} height={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--color-warning)' }} />
        <h3 style={{ marginBottom: 8 }}>No hay paciente seleccionado</h3>
        <p style={{ fontSize: 13.5 }}>Seleccione un paciente de la lista de búsqueda para poder editar sus datos.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('busqueda')} style={{ marginTop: 14 }}>
          Ir a Búsqueda
        </button>
      </div>
    );
  }

  const changed = Object.keys(form).filter(k => form[k] !== (original[k] || ''));
  const hasChanges = changed.length > 0;

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
    const all = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(all);
    const errs = validate(form);
    setErrors(errs);
    
    if (!Object.keys(errs).length) {
      try {
        setSaving(true);
        await actualizarPaciente(original.id, {
          nombre: form.nombre.trim(),
          ci: form.ci.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
          fecha_nacimiento: form.fechaNacimiento,
          sexo: form.sexo,
          tipo_sangre: form.tipoSangre,
          foto: form.foto,
        });

        if (reloadPacientes) await reloadPacientes();

        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } catch (err) {
        setErrors({ general: err.message });
      } finally {
        setSaving(false);
      }
    }
  }

  function handleRevert() {
    if (original) {
      setForm({
        nombre: original.nombre || '',
        ci: original.ci || '',
        telefono: original.telefono || '',
        direccion: original.direccion || '',
        fechaNacimiento: original.fechaNacimiento || '',
        sexo: original.sexo || '',
        tipoSangre: original.tipoSangre || 'O+',
        foto: original.foto || null
      });
      setErrors({});
      setTouched({});
    }
  }

  function cls(name) {
    if (touched[name] && errors[name]) return 'form-control error';
    if (form[name] !== (original[name] || '')) return 'form-control modified';
    return 'form-control';
  }

  const initials = original.nombre ? original.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'JM';

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
          <h1>Actualización de Datos</h1>
          <p>Edite los datos generales del paciente seleccionado y aplique los cambios al expediente.</p>
        </div>
        <AnimatePresence>
          {hasChanges && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="chip chip-modified" style={{ padding: '6px 12px', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
              <IconEdit width={14} height={14} />
              {changed.length} campo{changed.length > 1 ? 's' : ''} modificado{changed.length > 1 ? 's' : ''}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 16 }} exit={{ opacity: 0, y: -10, height: 0 }} className="alert alert-success" style={{ overflow: 'hidden' }}>
            <IconCheck width={16} height={16} /> Datos del paciente actualizados correctamente en la base de datos.
          </motion.div>
        )}
        {errors.general && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 16 }} exit={{ opacity: 0, y: -10, height: 0 }} className="alert alert-danger" style={{ overflow: 'hidden' }}>
            <IconAlert width={16} height={16} /> Error: {errors.general}
          </motion.div>
        )}
        {hasChanges && !saved && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 16 }} exit={{ opacity: 0, y: -10, height: 0 }} className="alert alert-info" style={{ overflow: 'hidden' }}>
            <IconAlert width={16} height={16} /> Los campos resaltados contienen cambios pendientes de guardar.
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-bg), var(--color-primary-light))', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {original.foto ? (
                <img src={original.foto} alt={original.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{original.nombre}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>CI: <strong style={{ color: 'var(--color-text)' }}>{original.ci}</strong> &nbsp;·&nbsp; Registro ID: <strong>#00{original.id}</strong></p>
            </div>
            <span className="badge badge-neutral" style={{ marginLeft: 'auto', fontSize: 12 }}>Editando Expediente</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2><div className="card-header-icon"><IconEdit width={15} height={15} /></div>Datos Editables</h2>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="section-divider"><span>Fotografía del Paciente</span><hr /></div>
            <CameraCapture photo={form.foto} onChange={(b64) => setForm(p => ({ ...p, foto: b64 }))} />

            <div className="section-divider" style={{ marginTop: 20 }}><span>Información Personal</span><hr /></div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label" htmlFor="u-nombre">
                  Nombre Completo <span className="required">*</span>
                  <AnimatePresence>
                    {form.nombre !== (original.nombre || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <input id="u-nombre" name="nombre" type="text" className={cls('nombre')} value={form.nombre} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.nombre && errors.nombre && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.nombre}</motion.span>}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="u-ci">
                  Carnet de Identidad <span className="required">*</span>
                  <AnimatePresence>
                    {form.ci !== (original.ci || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <input id="u-ci" name="ci" type="text" className={cls('ci')} value={form.ci} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.ci && errors.ci && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.ci}</motion.span>}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="u-fecha">
                  Fecha de Nacimiento
                  <AnimatePresence>
                    {form.fechaNacimiento !== (original.fechaNacimiento || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <input id="u-fecha" name="fechaNacimiento" type="date" className={cls('fechaNacimiento')} value={form.fechaNacimiento} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.fechaNacimiento && errors.fechaNacimiento && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.fechaNacimiento}</motion.span>}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="u-sexo">
                  Sexo Biológico
                  <AnimatePresence>
                    {form.sexo !== (original.sexo || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <select id="u-sexo" name="sexo" className={cls('sexo')} value={form.sexo} onChange={handleChange}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="u-sangre">
                  Tipo de Sangre
                  <AnimatePresence>
                    {form.tipoSangre !== (original.tipoSangre || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <select id="u-sangre" name="tipoSangre" className={cls('tipoSangre')} value={form.tipoSangre} onChange={handleChange}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="section-divider" style={{ marginTop: 24 }}><span>Información de Contacto</span><hr /></div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="u-tel">
                  Teléfono
                  <AnimatePresence>
                    {form.telefono !== (original.telefono || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <input id="u-tel" name="telefono" type="tel" className={cls('telefono')} value={form.telefono} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.telefono && errors.telefono && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.telefono}</motion.span>}
                </AnimatePresence>
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="u-dir">
                  Dirección
                  <AnimatePresence>
                    {form.direccion !== (original.direccion || '') && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="chip chip-modified" style={{ marginLeft: 10, padding: '2px 8px', fontSize: 10.5 }}>Modificado</motion.span>}
                  </AnimatePresence>
                </label>
                <input id="u-dir" name="direccion" type="text" className={cls('direccion')} value={form.direccion} onChange={handleChange} onBlur={handleBlur} />
                <AnimatePresence>
                  {touched.direccion && errors.direccion && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error"><IconAlert width={12} height={12} />{errors.direccion}</motion.span>}
                </AnimatePresence>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 32 }}>
              <button type="button" className="btn btn-ghost" onClick={handleRevert} disabled={!hasChanges}>
                <IconRefresh width={14} height={14} /> Revertir cambios
              </button>
              <motion.button whileHover={hasChanges ? { scale: 1.02 } : {}} whileTap={hasChanges ? { scale: 0.98 } : {}} type="submit" className="btn btn-success btn-lg" disabled={!hasChanges || saving}>
                <IconSave width={15} height={15} /> {saving ? 'Guardando...' : 'Actualizar Datos'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
