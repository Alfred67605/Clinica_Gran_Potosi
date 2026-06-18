/**
 * HistorialClinico.jsx — Premium Medical History
 * Staggered timeline animations, sticky headers, premium badges, frosted glass alerts.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconUser, IconHistory, IconClipboard, IconDownload, 
  IconPrint, IconPlus, IconAlert, IconSearch, IconActivity 
} from '../components/Icons';

export default function HistorialClinico({ pacientes, pacienteSeleccionadoId, setPacienteSeleccionadoId, onNavigate }) {
  const [buscarNombre, setBuscarNombre] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const paciente = pacientes.find(p => p.id === pacienteSeleccionadoId) || pacientes[0];

  if (!paciente) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <IconAlert width={48} height={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--color-warning)' }} />
        <h3 style={{ marginBottom: 8 }}>Sin Pacientes en el Sistema</h3>
        <p style={{ fontSize: 13.5 }}>Registre un paciente nuevo para comenzar a ver sus historiales clínicos.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('registro')} style={{ marginTop: 14 }}>
          Registrar Paciente
        </button>
      </div>
    );
  }

  const getInitials = (nombre) => {
    return nombre ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'JM';
  };

  const infoRows = [
    ['Nombre Completo', paciente.nombre],
    ['Documento de Identidad (CI)', paciente.ci],
    ['Fecha de Nacimiento', paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toLocaleDateString('es-BO') : 'No registrada'],
    ['Edad', paciente.edad ? `${paciente.edad} años` : '—'],
    ['Sexo Biológico', paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : '—'],
    ['Estado Civil', paciente.estadoCivil || '—'],
    ['Grupo Sanguíneo', paciente.tipoSangre || '—'],
    ['Alergias Conocidas', paciente.alergias || 'Ninguna'],
    ['Teléfono de Contacto', paciente.telefono || '—'],
    ['Dirección Domiciliaria', paciente.direccion || '—'],
    ['Contacto de Emergencia', paciente.contactoEmergencia || 'No registrado']
  ];

  const sugerencias = buscarNombre.trim() !== ''
    ? pacientes.filter(p => p.nombre.toLowerCase().includes(buscarNombre.toLowerCase()) || p.ci.includes(buscarNombre))
    : [];

  const getColorForTipo = (tipo) => {
    if (tipo === 'Cirugía Menor' || tipo === 'Cirugías') return 'var(--color-danger)';
    if (tipo === 'Laboratorio') return 'var(--color-warning)';
    if (tipo === 'Odontología') return 'var(--color-success)';
    if (tipo === 'Consulta Especialidad') return 'var(--color-info)';
    return 'var(--color-primary)';
  };

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
          <h1>Historial Clínico</h1>
          <p>Consulte y gestione la ficha médica completa del paciente seleccionado.</p>
        </div>

        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="autocomplete-wrapper" style={{ minWidth: 260 }}>
            <div className="search-bar" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
              <IconSearch width={14} height={14} />
              <input 
                type="text"
                value={buscarNombre}
                onChange={e => { setBuscarNombre(e.target.value); setShowDropdown(true); }}
                placeholder="Cambiar paciente..."
                onFocus={() => setShowDropdown(true)}
                style={{ padding: '6px 0' }}
              />
              {buscarNombre && (
                <button onClick={() => setBuscarNombre('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2, color: 'var(--color-text-muted)' }}>
                  <IconX width={12} height={12} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showDropdown && sugerencias.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="autocomplete-dropdown" 
                  style={{ width: '100%', top: 'calc(100% + 4px)', boxShadow: 'var(--shadow-lg)' }}
                >
                  {sugerencias.map(s => (
                    <div key={s.id} className="autocomplete-item" onClick={() => {
                      setPacienteSeleccionadoId(s.id);
                      setBuscarNombre('');
                      setShowDropdown(false);
                    }}>
                      <span style={{ fontWeight: 600 }}>{s.nombre}</span>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>CI: {s.ci}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-success" onClick={() => onNavigate('registroClinico')}>
            <IconPlus width={14} height={14} /> Nueva Consulta
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-ghost" onClick={() => window.print()}>
            <IconPrint width={14} height={14} /> Imprimir Ficha
          </motion.button>
        </motion.div>
      </div>

      {/* Hero Profile Header */}
      <motion.div variants={itemVariants} className="ficha-header glass-card" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', 
        padding: '24px 28px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 20
      }}>
        <div className="ficha-avatar" style={{ background: 'var(--color-white)', color: 'var(--color-primary-dark)', fontSize: 24, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          {getInitials(paciente.nombre)}
        </div>
        <div className="ficha-header-info">
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{paciente.nombre}</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13.5, marginTop: 4 }}>
            CI: <strong>{paciente.ci}</strong> &nbsp;·&nbsp; 
            {paciente.edad ? `${paciente.edad} años` : 'Edad no reg.'} &nbsp;·&nbsp; 
            {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Sexo biológico no esp.'}
          </p>
          <div className="ficha-header-badges" style={{ marginTop: '12px', gap: 10 }}>
            <span className="ficha-badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Grupo Sanguíneo: <strong>{paciente.tipoSangre || '—'}</strong>
            </span>
            <span className="ficha-badge" style={{ background: paciente.alergias && paciente.alergias.toLowerCase() !== 'ninguna' ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Alergia: <strong>{paciente.alergias || 'Ninguna'}</strong>
            </span>
            <span className="ficha-badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Teléfono: <strong>{paciente.telefono || '—'}</strong>
            </span>
          </div>
        </div>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', marginLeft: 'auto', alignSelf: 'flex-start', fontWeight: 700, padding: '6px 12px', backdropFilter: 'blur(4px)' }}>
          Reg ID: #00{paciente.id}
        </span>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        
        {/* Datos Personales */}
        <motion.div variants={itemVariants} className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <h2><div className="card-header-icon"><IconUser width={14} height={14} /></div>Datos Personales</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {infoRows.map(([label, value]) => (
                <div key={label} style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text)' }}>{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Constantes Vitales */}
        <motion.div variants={itemVariants} className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <h2><div className="card-header-icon"><IconActivity width={14} height={14} /></div>Signos Vitales y Parámetros</h2>
            <span className="chip">Último control</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Peso', value: paciente.peso ? `${paciente.peso} Kg` : '—' },
                { label: 'Altura', value: paciente.altura ? `${paciente.altura} m` : '—' },
                { label: 'IMC', value: paciente.imc ? `${paciente.imc}` : '—', sub: paciente.imc ? `Categoría: ${paciente.imc >= 30 ? 'Obesidad' : paciente.imc >= 25 ? 'Sobrepeso' : 'Normal'}` : '' },
                { label: 'Presión Arterial', value: paciente.presionArterial ? `${paciente.presionArterial} mmHg` : '—' },
                { label: 'Frecuencia Cardíaca', value: paciente.frecuenciaCardiaca ? `${paciente.frecuenciaCardiaca} lpm` : '—' },
                { label: 'Temperatura', value: paciente.temperatura ? `${paciente.temperatura} °C` : '—' },
                { label: 'Saturación SpO2', value: paciente.saturacionOxigeno ? `${paciente.saturacionOxigeno} %` : '—' },
                { label: 'Ingreso', value: paciente.fechaIngreso ? new Date(paciente.fechaIngreso).toLocaleDateString('es-BO') : '—' }
              ].map((vital, idx) => (
                <div key={idx} style={{ background: 'var(--color-bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>{vital.label}</p>
                  <p style={{ fontSize: 14.5, fontWeight: 700, fontFamily: 'monospace' }}>{vital.value}</p>
                  {vital.sub && <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>{vital.sub}</span>}
                </div>
              ))}
            </div>
            
            {paciente.medicamentosActuales && (
              <div style={{ marginTop: '20px', background: 'var(--color-primary-light)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)', opacity: 0.9 }}>
                <h4 style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--color-primary-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>Medicación Habitual Activa</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--color-primary-dark)', fontWeight: 500, lineHeight: 1.5 }}>{paciente.medicamentosActuales}</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Timeline de Consultas */}
      <motion.div variants={itemVariants} className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <h2><div className="card-header-icon"><IconHistory width={14} height={14} /></div>Historial Clínico de Evolución</h2>
          <span className="chip">{paciente.historialConsultas ? paciente.historialConsultas.length : 0} atenciones</span>
        </div>
        <div className="card-body" style={{ padding: '16px 24px' }}>
          {(!paciente.historialConsultas || paciente.historialConsultas.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--color-text-muted)' }}>
              <IconHistory width={40} height={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: 14 }}>Sin consultas registradas</p>
              <p style={{ fontSize: 13 }}>Realice una consulta médica utilizando el módulo de Registro Clínico.</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, bottom: 20, left: 24, width: 2, background: 'var(--color-border-light)', zIndex: 0 }} />
              {paciente.historialConsultas.map((h, i) => (
                <motion.div 
                  key={i} 
                  className="historial-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  style={{ position: 'relative', zIndex: 1, paddingLeft: 60, marginBottom: 24, display: 'block' }}
                >
                  <div className="historial-date" style={{ position: 'absolute', left: 0, top: 4, width: 48, fontWeight: 700, fontSize: 12, textAlign: 'right', color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>
                    {h.fecha.includes('-') ? h.fecha.split('-').reverse().join('\n') : h.fecha.split('/').join('\n')}
                  </div>
                  <div className="historial-dot" style={{ position: 'absolute', left: 20, top: 6, width: 10, height: 10, borderRadius: '50%', background: getColorForTipo(h.tipo), border: '2px solid var(--color-surface)', boxShadow: `0 0 0 3px ${getColorForTipo(h.tipo)}33` }} />
                  
                  <div className="historial-content" style={{ background: 'var(--color-surface)', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      <span className="badge" style={{ background: `${getColorForTipo(h.tipo)}15`, color: getColorForTipo(h.tipo), fontSize: 11.5, fontWeight: 700, padding: '4px 10px' }}>
                        {h.tipo} - {h.areaMedica || 'Consulta General'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginLeft: 'auto' }}>Atendido por: {h.medico}</span>
                    </h4>
                    
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <strong style={{ fontSize: 11.5, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Sintomatología</strong>
                        <p style={{ fontSize: 13.5, color: 'var(--color-text)', margin: 0 }}>{h.sintomas || 'Consulta de rutina'}</p>
                      </div>
                      <div>
                        <strong style={{ fontSize: 11.5, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Diagnóstico Final</strong>
                        <p style={{ fontSize: 13.5, color: 'var(--color-text)', margin: 0, fontWeight: 500 }}>{h.diagnostico}</p>
                      </div>
                    </div>

                    {h.tratamiento && (
                      <div style={{ marginTop: '14px', background: 'var(--color-bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-success)' }}>
                        <strong style={{ fontSize: 11.5, textTransform: 'uppercase', color: 'var(--color-success)', display: 'block', marginBottom: 4 }}>Tratamiento prescrito</strong>
                        <p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: 13, color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.5 }}>{h.tratamiento}</p>
                        {h.indicaciones && <p style={{ margin: '8px 0 0 0', fontSize: 12.5, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Indicaciones: {h.indicaciones}</p>}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Observaciones Permanentes */}
      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2><div className="card-header-icon"><IconClipboard width={14} height={14} /></div>Observaciones y Notas de Seguimiento</h2>
        </div>
        <div className="card-body">
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '18px 24px', borderLeft: '4px solid var(--color-primary)', fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.7, fontWeight: 500 }}>
            {paciente.observacionesGenerales || 'No se han registrado observaciones permanentes sobre este paciente en su expediente clínico.'}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
