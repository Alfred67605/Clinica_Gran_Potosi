/**
 * GestionUsuarios.jsx — Premium User Management
 * Conectado al backend Laravel.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconShield, IconSave, IconPlus, IconAlert, IconCheck, IconTrash, IconEdit } from '../components/Icons';
import { crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/api';

const INITIAL = { id: null, nombre: '', usuario: '', rol: 'Médico', estado: 'Activo', contrasena: '' };

function validate(f, isEdit) {
  const e = {};
  if (!f.nombre.trim()) e.nombre = 'Nombre requerido.';
  if (!f.usuario.trim() || f.usuario.length < 4) e.usuario = 'Usuario inválido (mínimo 4 caracteres).';
  if (!isEdit && (!f.contrasena || f.contrasena.length < 4)) e.contrasena = 'Contraseña requerida (mín. 4 caracteres).';
  return e;
}

export default function GestionUsuarios({ usuarios, reloadUsuarios }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (touched[name]) setErrors(validate({ ...form, [name]: value }, isEdit));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(validate(form, isEdit));
  }

  function handleEdit(user) {
    setForm({ ...user, contrasena: '' });
    setIsEdit(true);
    setErrors({});
    setTouched({});
    setShowModal(true);
  }

  function handleNew() {
    setForm(INITIAL);
    setIsEdit(false);
    setErrors({});
    setTouched({});
    setShowModal(true);
  }

  async function handleDelete(id, rol) {
    if (rol === 'Administrador') {
      const adminCount = usuarios.filter(u => u.rol === 'Administrador').length;
      if (adminCount <= 1) {
        setMessage({ type: 'error', text: 'No se puede eliminar al último Administrador del sistema.' });
        return;
      }
    }
    
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await eliminarUsuario(id);
        await reloadUsuarios();
        setMessage({ type: 'success', text: 'Usuario eliminado correctamente.' });
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const all = Object.keys(INITIAL).reduce((a,k) => ({ ...a,[k]:true }), {});
    setTouched(all);
    const errs = validate(form, isEdit);
    setErrors(errs);
    
    if (!Object.keys(errs).length) {
      try {
        setSaving(true);
        if (isEdit) {
          // Solo enviar la contraseña si se escribió algo (para cambiarla)
          const data = { ...form };
          if (!data.contrasena) delete data.contrasena;
          await actualizarUsuario(form.id, data);
          setMessage({ type: 'success', text: 'Usuario actualizado correctamente.' });
        } else {
          await crearUsuario(form);
          setMessage({ type: 'success', text: 'Usuario creado exitosamente.' });
        }
        await reloadUsuarios();
        setShowModal(false);
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setSaving(false);
      }
    }
  }

  function cls(name) {
    return touched[name] && errors[name] ? 'form-control error' : 'form-control';
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
          <h1>Gestión de Usuarios</h1>
          <p>Administre los accesos, roles y credenciales del personal médico y administrativo.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          <IconPlus width={16} height={16} /> Nuevo Usuario
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 18 }} exit={{ opacity: 0, height: 0 }} 
            className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            {message.type === 'success' ? <IconCheck width={18} height={18} /> : <IconAlert width={18} height={18} />}
            <strong style={{ fontSize: 13.5 }}>{message.text}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>No hay usuarios registrados.</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id}>
                <td style={{ color: 'var(--color-text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>#{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.usuario}</td>
                <td><span className="badge badge-neutral">{u.rol}</span></td>
                <td>
                  <span className={`badge ${u.estado === 'Activo' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                    {u.estado}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost" style={{ padding: 6, marginRight: 4 }} onClick={() => handleEdit(u)} title="Editar Usuario">
                    <IconEdit width={16} height={16} />
                  </button>
                  <button className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }} onClick={() => handleDelete(u.id, u.rol)} title="Eliminar Usuario">
                    <IconTrash width={16} height={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, margin: 'auto', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              <div className="card-header" style={{ padding: '20px 24px' }}>
                <h2 style={{ fontSize: 18 }}><div className="card-header-icon"><IconShield width={18} height={18} /></div> {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              </div>
              <div className="card-body" style={{ padding: '24px', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group full">
                    <label className="form-label">Nombre Completo <span className="required">*</span></label>
                    <input name="nombre" type="text" className={cls('nombre')} value={form.nombre} onChange={handleChange} onBlur={handleBlur} />
                    {touched.nombre && errors.nombre && <span className="form-error"><IconAlert width={12} height={12}/>{errors.nombre}</span>}
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Usuario de Login <span className="required">*</span></label>
                      <input name="usuario" type="text" className={cls('usuario')} value={form.usuario} onChange={handleChange} onBlur={handleBlur} autoComplete="off" />
                      {touched.usuario && errors.usuario && <span className="form-error"><IconAlert width={12} height={12}/>{errors.usuario}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Contraseña {isEdit ? '' : <span className="required">*</span>}
                      </label>
                      <input name="contrasena" type="password" className={cls('contrasena')} value={form.contrasena} onChange={handleChange} onBlur={handleBlur} placeholder={isEdit ? 'Dejar vacío para no cambiar' : ''} autoComplete="new-password" />
                      {touched.contrasena && errors.contrasena && <span className="form-error"><IconAlert width={12} height={12}/>{errors.contrasena}</span>}
                    </div>
                  </div>

                  <div className="form-grid" style={{ marginTop: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Rol del Sistema</label>
                      <select name="rol" className="form-control" value={form.rol} onChange={handleChange}>
                        <option>Administrador</option>
                        <option>Médico</option>
                        <option>Enfermería</option>
                        <option>Recepcionista</option>
                        <option>Laboratorista</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estado</label>
                      <select name="estado" className="form-control" value={form.estado} onChange={handleChange}>
                        <option>Activo</option>
                        <option>Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions" style={{ marginTop: 32, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      <IconSave width={14} height={14} /> {saving ? 'Guardando...' : 'Guardar Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
