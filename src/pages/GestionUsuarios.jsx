/**
 * GestionUsuarios.jsx — Premium User Management
 * Staggered tables, floating modals with backdrop blur, hover-float stat cards.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconUsers, IconPlus, IconEdit, IconTrash, IconX, IconShield, IconAlert } from '../components/Icons';

const INIT = [
  { id:1, nombre:'Dr. Admin',          rol:'Administrador', usuario:'admin',   estado:'Activo' },
  { id:2, nombre:'Dr. Roberto López',  rol:'Médico',        usuario:'rlopez',  estado:'Activo' },
  { id:3, nombre:'Lic. Ana Ramos',     rol:'Enfermería',    usuario:'aramos',  estado:'Activo' },
  { id:4, nombre:'Srta. Carla Vargas', rol:'Recepcionista', usuario:'cvargas', estado:'Inactivo' },
  { id:5, nombre:'Dr. Miguel Quispe',  rol:'Médico',        usuario:'mquispe', estado:'Activo' },
];
const ROLES = ['Administrador','Médico','Enfermería','Recepcionista','Laboratorista'];
const FORM0 = { nombre:'', usuario:'', rol:'Médico', contrasena:'', confirmar:'', estado:'Activo' };

function getInitials(nombre) {
  return nombre.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState(INIT);
  const [modal,    setModal]    = useState(false);
  const [editando, setEditando] = useState(null);
  const [form,     setForm]     = useState(FORM0);
  const [errs,     setErrs]     = useState({});
  const [confirm,  setConfirm]  = useState(null);

  function abrirCrear()  { setEditando(null); setForm(FORM0); setErrs({}); setModal(true); }
  function abrirEditar(u){ setEditando(u.id); setForm({ nombre:u.nombre, usuario:u.usuario, rol:u.rol, contrasena:'', confirmar:'', estado:u.estado }); setErrs({}); setModal(true); }

  function validar() {
    const e = {};
    if (!form.nombre.trim())  e.nombre  = 'El nombre es requerido.';
    if (!form.usuario.trim()) e.usuario = 'El usuario es requerido.';
    if (!editando && !form.contrasena) e.contrasena = 'La contraseña es requerida.';
    if (form.contrasena && form.contrasena !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden.';
    return e;
  }

  function guardar() {
    const e = validar();
    if (Object.keys(e).length) { setErrs(e); return; }
    if (editando) {
      setUsuarios(p => p.map(u => u.id===editando ? { ...u, nombre:form.nombre, usuario:form.usuario, rol:form.rol, estado:form.estado } : u));
    } else {
      setUsuarios(p => [...p, { id:Date.now(), nombre:form.nombre, usuario:form.usuario, rol:form.rol, estado:form.estado }]);
    }
    setModal(false);
  }

  function eliminar(id) { setUsuarios(p => p.filter(u=>u.id!==id)); setConfirm(null); }
  const sf = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gestión de Usuarios</h1>
          <p>Administre los usuarios y roles de acceso al sistema.</p>
        </div>
        <motion.button variants={itemVariants} className="btn btn-primary" id="btn-crear-usuario" onClick={abrirCrear} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <IconPlus width={14} height={14}/> Crear Usuario
        </motion.button>
      </div>

      <div className="stat-cards" style={{ marginBottom: 16 }}>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon blue"><IconUsers width={20} height={20}/></div>
          <div><div className="stat-card-label">Total Usuarios</div><div className="stat-card-value counter-value">{usuarios.length}</div></div>
        </motion.div>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon green"><IconUsers width={20} height={20}/></div>
          <div><div className="stat-card-label">Activos</div><div className="stat-card-value counter-value">{usuarios.filter(u=>u.estado==='Activo').length}</div></div>
        </motion.div>
        <motion.div variants={itemVariants} className="stat-card hover-float">
          <div className="stat-card-icon yellow"><IconShield width={20} height={20}/></div>
          <div><div className="stat-card-label">Administradores</div><div className="stat-card-value counter-value">{usuarios.filter(u=>u.rol==='Administrador').length}</div></div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2><div className="card-header-icon"><IconUsers width={15} height={15}/></div>Usuarios del Sistema</h2>
          <span className="chip">{usuarios.length} registros</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>#</th><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <AnimatePresence>
                {usuarios.map((u,i) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td style={{ color:'var(--color-text-muted)', fontWeight:600, fontSize: 12 }}>{i+1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--color-primary-bg), var(--color-primary-light))', color: 'var(--color-primary-dark)' }}>{getInitials(u.nombre)}</div>
                        <span style={{ fontWeight:600, fontSize: 13.5 }}>{u.nombre}</span>
                      </div>
                    </td>
                    <td><code style={{ background:'var(--color-bg)', padding:'3px 8px', borderRadius:6, fontSize:12.5, color:'var(--color-text-secondary)', fontWeight: 600 }}>@{u.usuario}</code></td>
                    <td><span className="badge badge-info">{u.rol}</span></td>
                    <td><span className={`badge ${u.estado==='Activo'?'badge-success':'badge-neutral'}`}>{u.estado}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>abrirEditar(u)}>
                          <IconEdit width={13} height={13}/> Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(u.id)} disabled={u.rol==='Administrador'}>
                          <IconTrash width={13} height={13}/> Eliminar
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-usuario-title">
            <motion.div variants={modalVariants} className="modal" style={{ padding: '24px' }}>
              <div className="modal-header" style={{ paddingBottom: 16, borderBottom: '1px solid var(--color-border-light)', marginBottom: 20 }}>
                <h3 id="modal-usuario-title" style={{ fontSize: 18, fontWeight: 800 }}>{editando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                <button className="modal-close" onClick={()=>setModal(false)}><IconX width={16} height={16}/></button>
              </div>
              <div className="modal-body">
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {[
                    { id:'m-nombre',   label:'Nombre completo', key:'nombre',    type:'text',     req:true,    ph:'Nombre del usuario' },
                    { id:'m-usuario',  label:'Nombre de usuario', key:'usuario', type:'text',     req:true,    ph:'login_usuario' },
                    { id:'m-pass',     label:'Contraseña',      key:'contrasena',type:'password', req:!editando, ph: editando?'Dejar vacío para mantener':'Nueva contraseña' },
                    { id:'m-confirmar',label:'Confirmar contraseña', key:'confirmar', type:'password', req:false, ph:'Repetir contraseña' },
                  ].map(({ id, label, key, type, req, ph }) => (
                    <div className="form-group" key={key}>
                      <label className="form-label" htmlFor={id}>{label}{req && <span className="required">*</span>}</label>
                      <input id={id} type={type} className={`form-control${errs[key]?' error':''}`} value={form[key]} onChange={sf(key)} placeholder={ph} />
                      <AnimatePresence>
                        {errs[key] && <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-error"><IconAlert width={12} height={12}/>{errs[key]}</motion.span>}
                      </AnimatePresence>
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-rol">Rol de acceso</label>
                    <select id="m-rol" className="form-control" value={form.rol} onChange={sf('rol')}>
                      {ROLES.map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                  {editando && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="m-estado">Estado</label>
                      <select id="m-estado" className="form-control" value={form.estado} onChange={sf('estado')}>
                        <option>Activo</option><option>Inactivo</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button>
                <button className="btn btn-primary" id="btn-guardar-usuario" onClick={guardar}>
                  {editando ? 'Actualizar' : 'Crear Usuario'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {confirm && (
          <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="modal-overlay" role="alertdialog" aria-modal="true">
            <motion.div variants={modalVariants} className="modal" style={{ maxWidth:420, padding: 24 }}>
              <div className="modal-header" style={{ paddingBottom: 16, borderBottom: '1px solid var(--color-border-light)', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Confirmar Eliminación</h3>
                <button className="modal-close" onClick={()=>setConfirm(null)}><IconX width={16} height={16}/></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <IconAlert width={18} height={18} style={{ flexShrink: 0, marginTop: 2 }}/>
                  <span>Esta acción eliminará el usuario permanentemente del sistema y no puede deshacerse. ¿Está seguro de continuar?</span>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                <button className="btn btn-ghost" onClick={()=>setConfirm(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={()=>eliminar(confirm)}>
                  <IconTrash width={14} height={14}/> Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
