/**
 * RegistroPaciente.jsx — Premium Patient Registration
 * Conectado al backend Laravel para persistencia en PostgreSQL.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSave, IconUser, IconCheck, IconAlert, IconX } from '../components/Icons';
import { crearPaciente } from '../services/api';
import CameraCapture from '../components/CameraCapture';

const INITIAL = { nombre:'', ci:'', telefono:'', direccion:'', fechaNacimiento:'', sexo:'', tipoSangre:'', foto: null };

function validate(f) {
  const e = {};
  if (!f.nombre.trim() || f.nombre.trim().length < 5) e.nombre = 'Nombre requerido (mínimo 5 caracteres).';
  if (!/^\d{6,10}$/.test(f.ci.trim()))      e.ci       = 'CI inválido (6–10 dígitos numéricos).';
  if (!/^\d{7,10}$/.test(f.telefono.trim())) e.telefono = 'Teléfono inválido (7–10 dígitos).';
  if (!f.direccion.trim())                   e.direccion = 'La dirección es requerida.';
  if (!f.fechaNacimiento)                    e.fechaNacimiento = 'La fecha de nacimiento es requerida.';
  if (!f.sexo)                               e.sexo = 'Seleccione el sexo biológico.';
  return e;
}

export default function RegistroPaciente({ reloadPacientes, onNavigate }) {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);

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
    const allTouched = Object.keys(INITIAL).reduce((a,k) => ({ ...a,[k]:true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (!Object.keys(errs).length) {
      try {
        setSaving(true);
        await crearPaciente({
          nombre: form.nombre.trim(),
          ci: form.ci.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
          fecha_nacimiento: form.fechaNacimiento,
          sexo: form.sexo,
          tipo_sangre: form.tipoSangre || 'O+',
          estado_civil: 'Soltero/a',
          ciudad: 'Potosí',
          foto: form.foto,
        });

        // Recargar pacientes desde el backend
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
          <h1>Registro de Paciente</h1>
          <p>Complete todos los campos para incorporar un nuevo paciente al sistema.</p>
        </div>
        <span className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: 12 }}>Nuevo registro</span>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginBottom: 18 }} 
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="alert alert-success"
            style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}
          >
            <IconCheck width={18} height={18} />
            <strong style={{ fontSize: 13.5 }}>Paciente registrado correctamente en la base de datos.</strong> El formulario se reiniciará en breve.
          </motion.div>
        )}
        {errors.general && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginBottom: 18 }} 
            exit={{ opacity: 0, height: 0 }}
            className="alert alert-danger"
            style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}
          >
            <IconAlert width={18} height={18} />
            <strong style={{ fontSize: 13.5 }}>Error: {errors.general}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2>
            <div className="card-header-icon"><IconUser width={15} height={15} /></div>
            Datos del Paciente
          </h2>
          <span style={{ fontSize:12, color:'var(--color-text-muted)' }}>
            Los campos marcados con <span style={{ color:'var(--color-danger)' }}>*</span> son obligatorios
          </span>
        </div>

        <div className="card-body" style={{ padding: '20px 24px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="section-divider"><span>Fotografía del Paciente</span><hr /></div>
            <CameraCapture photo={form.foto} onChange={(b64) => setForm(p => ({ ...p, foto: b64 }))} />

            <div className="section-divider" style={{ marginTop: 20 }}><span>Información Personal</span><hr /></div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label" htmlFor="nombre">Nombre Completo <span className="required">*</span></label>
                <input id="nombre" name="nombre" type="text" className={cls('nombre')} value={form.nombre}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Juan Carlos Mamani Quispe" autoComplete="name" />
                <AnimatePresence>
                  {touched.nombre && errors.nombre && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error">
                      <IconAlert width={12} height={12}/>{errors.nombre}
                    </motion.span>
                  )}
                  {touched.nombre && !errors.nombre && form.nombre && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-ok">
                      <IconCheck width={12} height={12}/>Nombre válido
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ci">Carnet de Identidad (CI) <span className="required">*</span></label>
                <input id="ci" name="ci" type="text" className={cls('ci')} value={form.ci}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Ej: 7654321" maxLength={10} />
                <AnimatePresence>
                  {touched.ci && errors.ci && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error">
                      <IconAlert width={12} height={12}/>{errors.ci}
                    </motion.span>
                  )}
                  {touched.ci && !errors.ci && form.ci && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-ok">
                      <IconCheck width={12} height={12}/>CI válido
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fechaNacimiento">Fecha de Nacimiento <span className="required">*</span></label>
                <input id="fechaNacimiento" name="fechaNacimiento" type="date" className={cls('fechaNacimiento')}
                  value={form.fechaNacimiento} onChange={handleChange} onBlur={handleBlur}
                  max={new Date().toISOString().split('T')[0]} />
                <AnimatePresence>
                  {touched.fechaNacimiento && errors.fechaNacimiento && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error">
                      <IconAlert width={12} height={12}/>{errors.fechaNacimiento}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sexo">Sexo Biológico <span className="required">*</span></label>
                <select id="sexo" name="sexo" className={cls('sexo')} value={form.sexo} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">— Seleccionar —</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                <AnimatePresence>
                  {touched.sexo && errors.sexo && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error">
                      <IconAlert width={12} height={12}/>{errors.sexo}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tipoSangre">Tipo de Sangre</label>
                <select id="tipoSangre" name="tipoSangre" className="form-control" value={form.tipoSangre} onChange={handleChange}>
                  <option value="">— Seleccionar —</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="section-divider" style={{ marginTop: 24 }}><span>Información de Contacto</span><hr /></div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="telefono">Teléfono <span className="required">*</span></label>
                <input id="telefono" name="telefono" type="tel" className={cls('telefono')} value={form.telefono}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Ej: 75234567" maxLength={10} />
                <AnimatePresence>
                  {touched.telefono && errors.telefono && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error">
                      <IconAlert width={12} height={12}/>{errors.telefono}
                    </motion.span>
                  )}
                  {touched.telefono && !errors.telefono && form.telefono && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-ok">
                      <IconCheck width={12} height={12}/>Teléfono válido
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="direccion">Dirección <span className="required">*</span></label>
                <input id="direccion" name="direccion" type="text" className={cls('direccion')} value={form.direccion}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Av. Oruro #123, Barrio Central, Potosí" />
                <AnimatePresence>
                  {touched.direccion && errors.direccion && (
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="form-error">
                      <IconAlert width={12} height={12}/>{errors.direccion}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 32 }}>
              <button type="button" className="btn btn-ghost"
                onClick={() => { setForm(INITIAL); setErrors({}); setTouched({}); }}>
                <IconX width={14} height={14} /> Limpiar Formulario
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <IconSave width={15} height={15} /> {saving ? 'Guardando...' : 'Guardar Paciente'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
