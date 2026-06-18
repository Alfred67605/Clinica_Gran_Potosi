/**
 * BusquedaPaciente.jsx — Premium Patient Search
 * Features: Staggered row animations, premium badges, animated stat cards, glassmorphism filter bar.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconPlus, IconEye, IconEdit, IconUser, IconX, IconClipboard, IconActivity } from '../components/Icons';

function getInitials(nombre) {
  return nombre.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
}

function getPriorityBadge(prioridad) {
  const map = {
    'Alta':  { cls: 'badge-danger',  label: 'Alta' },
    'Media': { cls: 'badge-warning', label: 'Media' },
    'Baja':  { cls: 'badge-info',    label: 'Baja' },
  };
  const p = map[prioridad] || map['Baja'];
  return <span className={`badge ${p.cls}`}>{p.label}</span>;
}

export default function BusquedaPaciente({ pacientes, onNavigate, setPacienteSeleccionadoId, currentUser }) {
  const [query,   setQuery]   = useState('');
  const [filterBy,setFilterBy]= useState('nombre');
  const [estado,  setEstado]  = useState('todos');

  const results = useMemo(() => pacientes.filter(p => {
    const q = query.toLowerCase().trim();
    const fieldValue = p[filterBy] ? p[filterBy].toString().toLowerCase() : '';
    return (q === '' || fieldValue.includes(q))
        && (estado === 'todos' || p.estado === estado);
  }), [pacientes, query, filterBy, estado]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -12 },
    show: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, type: 'spring', stiffness: 100, damping: 14 }
    }),
    exit: { opacity: 0, x: 12, transition: { duration: 0.15 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Búsqueda de Pacientes</h1>
          <p>Localice y gestione los registros de pacientes del sistema.</p>
        </div>
        <motion.button
          variants={itemVariants}
          className="btn btn-primary"
          onClick={() => onNavigate('registro')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus width={14} height={14} /> Nuevo Paciente
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {[
          { label: 'Total Pacientes', value: pacientes.length, icon: IconUser, color: 'blue' },
          { label: 'Activos', value: pacientes.filter(p=>p.estado==='Activo').length, icon: IconActivity, color: 'green' },
          { label: 'Resultados', value: results.length, icon: IconSearch, color: 'slate' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="stat-card hover-float">
            <div className={`stat-card-icon ${stat.color}`}><stat.icon width={20} height={20} /></div>
            <div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value counter-value">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '14px 22px' }}>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:1, minWidth:220 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--color-text-secondary)', display:'block', marginBottom:5 }}>Buscar</label>
              <div className="search-bar">
                <IconSearch width={15} height={15} />
                <input id="search-input" type="text" value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder={filterBy==='nombre' ? 'Buscar por nombre...' : 'Buscar por CI...'}
                  aria-label="Buscar paciente" />
                {query && (
                  <button onClick={()=>setQuery('')}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', padding:2, borderRadius: 4, transition: 'color 0.2s' }}>
                    <IconX width={14} height={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-by">Filtrar por</label>
              <select id="filter-by" className="form-control" value={filterBy} onChange={e=>setFilterBy(e.target.value)} style={{ minWidth:130 }}>
                <option value="nombre">Nombre</option>
                <option value="ci">CI</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-estado">Estado</label>
              <select id="filter-estado" className="form-control" value={estado} onChange={e=>setEstado(e.target.value)} style={{ minWidth:130 }}>
                <option value="todos">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Table */}
      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2><div className="card-header-icon"><IconSearch width={15} height={15}/></div>Listado de Pacientes</h2>
          <span className="chip">{results.length} encontrado{results.length!==1?'s':''}</span>
        </div>
        <div className="table-wrapper">
          <AnimatePresence mode="wait">
            {results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign:'center', padding:'40px 20px', color:'var(--color-text-muted)' }}
              >
                <IconSearch width={32} height={32} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
                <p style={{ fontWeight:600, marginBottom:4 }}>Sin resultados</p>
                <p style={{ fontSize:13 }}>No se encontraron pacientes con los filtros aplicados.</p>
              </motion.div>
            ) : (
              <table className="table" key="table">
                <thead>
                  <tr><th>#</th><th>Nombre Completo</th><th>CI</th><th>Teléfono</th><th>Edad</th><th>Prioridad</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {results.map((p,i) => (
                    <motion.tr
                      key={p.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ color:'var(--color-text-muted)', fontWeight:600, fontSize: 12 }}>{i+1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="avatar" style={{
                            background: `linear-gradient(135deg, var(--color-primary-bg), var(--color-primary-glow))`,
                          }}>{getInitials(p.nombre)}</div>
                          <div>
                            <span style={{ fontWeight:600, display: 'block', fontSize: 13.5 }}>{p.nombre}</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.areaMedica || 'General'}</span>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontFamily:'monospace', fontWeight:600, fontSize:13, background: 'var(--color-bg)', padding: '2px 8px', borderRadius: 4 }}>{p.ci}</span></td>
                      <td style={{ color:'var(--color-text-secondary)' }}>{p.telefono}</td>
                      <td><span style={{ fontWeight: 600 }}>{p.edad ? `${p.edad} años` : '—'}</span></td>
                      <td>{getPriorityBadge(p.prioridadMedica)}</td>
                      <td><span className={`badge ${p.estado==='Activo'?'badge-success':'badge-neutral'}`}>{p.estado}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {['Administrador', 'Médico', 'Enfermería'].includes(currentUser?.rol) && (
                            <button className="btn btn-primary btn-sm" onClick={()=>{ setPacienteSeleccionadoId(p.id); onNavigate('historial'); }} title="Ver historial">
                              <IconEye width={13} height={13}/> Historial
                            </button>
                          )}
                          {['Administrador', 'Médico', 'Enfermería'].includes(currentUser?.rol) && (
                            <button className="btn btn-success btn-sm" onClick={()=>{ setPacienteSeleccionadoId(p.id); onNavigate('registroClinico'); }} title="Nueva Consulta">
                              <IconClipboard width={13} height={13}/> Consulta
                            </button>
                          )}
                          {['Administrador', 'Médico', 'Recepcionista'].includes(currentUser?.rol) && (
                            <button className="btn btn-ghost btn-sm" onClick={()=>{ setPacienteSeleccionadoId(p.id); onNavigate('actualizacion'); }} title="Editar datos">
                              <IconEdit width={13} height={13}/> Editar
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
