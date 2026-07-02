/**
 * Dashboard.jsx — Premium Clinical Dashboard
 * Features: Animated counters, gradient charts, staggered animations, premium bento-grid.
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';
import { 
  IconUser, IconHistory, IconBarChart, IconAlert, IconHome,
  IconPlus, IconSearch, IconDatabase, IconClipboard, IconActivity
} from '../components/Icons';

/* === Animated Counter Hook === */
function useAnimatedCounter(end, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);
  
  useEffect(() => {
    if (end === prevEnd.current) return;
    prevEnd.current = end;
    
    let start = 0;
    const startTime = performance.now();
    
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(start + (end - start) * eased);
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    
    requestAnimationFrame(step);
  }, [end, duration]);
  
  return count;
}

/* === Skeleton Loader Component === */
function SkeletonCard() {
  return (
    <div className="skeleton skeleton-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
      <div className="skeleton skeleton-circle" style={{ width: 48, height: 48, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        <div className="skeleton skeleton-title" style={{ width: '40%', height: 28, marginBottom: 4 }} />
        <div className="skeleton skeleton-text" style={{ width: '50%', height: 10 }} />
      </div>
    </div>
  );
}

/* === Custom Gradient Tooltip === */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 12.5,
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard({ pacientes, onNavigate, setPacienteSeleccionadoId }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial loading for skeleton effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // 1. Estadísticas Consolidadas
  const totalPacientes = pacientes.length;
  const activos = pacientes.filter(p => p.estado === 'Activo').length;
  const prioridadAlta = pacientes.filter(p => p.prioridadMedica === 'Alta').length;
  
  const totalConsultas = pacientes.reduce((sum, p) => {
    return sum + (p.historialConsultas ? p.historialConsultas.length : 0);
  }, 0);

  // Animated counters
  const animatedTotal = useAnimatedCounter(isLoading ? 0 : totalPacientes);
  const animatedConsultas = useAnimatedCounter(isLoading ? 0 : totalConsultas);
  const animatedActivos = useAnimatedCounter(isLoading ? 0 : activos);
  const animatedAlta = useAnimatedCounter(isLoading ? 0 : prioridadAlta);

  // 2. Gráfico: Consultas por Especialidad/Área Médica
  const areaCounts = {};
  pacientes.forEach(p => {
    if (p.historialConsultas) {
      p.historialConsultas.forEach(c => {
        const area = c.areaMedica || 'Consulta General';
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      });
    }
  });

  const chartDataEspecialidades = Object.keys(areaCounts).map(area => ({
    name: area,
    consultas: areaCounts[area]
  })).sort((a, b) => b.consultas - a.consultas);

  // 3. Gráfico: Distribución de Prioridad Médica
  const priorityCounts = { Alta: 0, Media: 0, Baja: 0 };
  pacientes.forEach(p => {
    const prio = p.prioridadMedica || 'Baja';
    if (priorityCounts[prio] !== undefined) {
      priorityCounts[prio]++;
    }
  });
  
  const chartDataPrioridad = Object.keys(priorityCounts).map(key => ({
    name: `Prioridad ${key}`,
    value: priorityCounts[key]
  }));

  const COLORS_PRIORITY = ['#EF4444', '#F59E0B', '#3B82F6'];

  // 4. Trend data (simulated monthly trend)
  const trendData = [
    { name: 'Ene', consultas: 12 },
    { name: 'Feb', consultas: 18 },
    { name: 'Mar', consultas: 15 },
    { name: 'Abr', consultas: 22 },
    { name: 'May', consultas: totalConsultas },
  ];

  // 5. Actividad Reciente
  const todasConsultas = [];
  pacientes.forEach(p => {
    if (p.historialConsultas) {
      p.historialConsultas.forEach(c => {
        todasConsultas.push({
          pacienteId: p.id,
          pacienteNombre: p.nombre,
          fecha: c.fecha,
          medico: c.medico,
          areaMedica: c.areaMedica,
          diagnostico: c.diagnostico,
          sintomas: c.sintomas || 'Consulta de rutina'
        });
      });
    }
  });

  const consultasRecientes = todasConsultas
    .sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-')))
    .slice(0, 4);

  // 6. Alertas Clínicas
  const alertasClinicas = [];
  
  pacientes.forEach(p => {
    if (p.presionArterial) {
      const parts = p.presionArterial.split('/');
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (sys >= 140 || dia >= 90) {
          alertasClinicas.push({
            id: `pa-${p.id}`,
            tipo: 'danger',
            pacienteId: p.id,
            pacienteNombre: p.nombre,
            mensaje: `Presión arterial crítica (${p.presionArterial} mmHg). Requiere ajuste de tratamiento.`
          });
        }
      }
    }
    
    if (p.alergias && p.alergias.toLowerCase() !== 'ninguna' && p.alergias.toLowerCase() !== 'ninguno') {
      alertasClinicas.push({
        id: `al-${p.id}`,
        tipo: 'warning',
        pacienteId: p.id,
        pacienteNombre: p.nombre,
        mensaje: `Alerta de Alergias: Sensibilidad severa a "${p.alergias}".`
      });
    }
  });

  if (alertasClinicas.length === 0) {
    alertasClinicas.push({
      id: 'general-1',
      tipo: 'info',
      mensaje: 'Sistema clínico funcionando normalmente. Todos los pacientes estables.'
    });
  }

  function handleVerPaciente(id) {
    setPacienteSeleccionadoId(id);
    onNavigate('historial');
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };

  const statCards = [
    { label: 'Pacientes Registrados', value: animatedTotal, icon: IconUser, color: 'blue', sub: 'Activos en la clínica' },
    { label: 'Consultas Realizadas', value: animatedConsultas, icon: IconHistory, color: 'green', sub: 'Historial acumulado' },
    { label: 'Pacientes Activos', value: animatedActivos, icon: IconClipboard, color: 'slate', sub: 'En seguimiento continuo' },
    { label: 'Prioridad Médica Alta', value: animatedAlta, icon: IconAlert, color: 'red', sub: 'Requieren atención urgente' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="dashboard-container"
    >
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clínica Gran Potosí</h1>
          <p>Bienvenido, Dr. Admin. Resumen del estado médico de la clínica al día de hoy.</p>
        </div>
        <span className="badge badge-primary" style={{ padding: '7px 14px', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center' }}>
          <IconActivity width={14} height={14} /> Panel Clínico Premium
        </span>
      </div>

      {/* Stat Cards with Animated Counters */}
      <div className="stat-cards">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          statCards.map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="stat-card hover-float" 
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('busqueda')}
            >
              <div className={`stat-card-icon ${stat.color}`}>
                <stat.icon width={22} height={22} />
              </div>
              <div>
                <div className="stat-card-label">{stat.label}</div>
                <div className="stat-card-value counter-value">{stat.value}</div>
                <div className="stat-card-sub" style={{ color: stat.color === 'red' ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                  {stat.sub}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Bar Chart with Gradient */}
          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h2>
                <div className="card-header-icon"><IconBarChart width={15} height={15} /></div>
                Carga Médica por Área Especializada
              </h2>
              <span className="chip">Consultas por Área</span>
            </div>
            <div className="card-body">
              {chartDataEspecialidades.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No hay datos suficientes para graficar especialidades.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartDataEspecialidades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-gradient-start)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--chart-gradient-end)" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="consultas" name="Atenciones Clínicas" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={44}>
                      {chartDataEspecialidades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#barGradient)' : 'var(--color-primary)'} opacity={1 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Bottom Row: Pie + Trend + Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            
            {/* Donut Chart */}
            <motion.div variants={itemVariants} className="card">
              <div className="card-header">
                <h2>
                  <div className="card-header-icon"><IconActivity width={15} height={15} /></div>
                  Pacientes por Prioridad
                </h2>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={chartDataPrioridad}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartDataPrioridad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PRIORITY[index % COLORS_PRIORITY.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                  {chartDataPrioridad.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS_PRIORITY[index] }} />
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="card">
              <div className="card-header">
                <h2>
                  <div className="card-header-icon"><IconHome width={15} height={15} /></div>
                  Accesos Rápidos
                </h2>
              </div>
              <div className="card-body" style={{ height: 'calc(100% - 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="quick-actions-grid">
                  <div className="quick-action-btn" onClick={() => onNavigate('registro')}>
                    <IconPlus width={20} height={20} strokeWidth={2} />
                    <span>Registrar Paciente</span>
                  </div>
                  <div className="quick-action-btn" onClick={() => onNavigate('registroClinico')}>
                    <IconClipboard width={20} height={20} strokeWidth={2} />
                    <span>Ficha Clínica</span>
                  </div>
                  <div className="quick-action-btn" onClick={() => onNavigate('busqueda')}>
                    <IconSearch width={20} height={20} strokeWidth={2} />
                    <span>Búsqueda</span>
                  </div>
                  <div className="quick-action-btn" onClick={() => onNavigate('respaldo')}>
                    <IconDatabase width={20} height={20} strokeWidth={2} />
                    <span>Respaldo</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Right Column: Alerts + Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Clinical Alerts */}
          <motion.div variants={itemVariants} className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h2>
                <div className="card-header-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                  <IconAlert width={15} height={15} />
                </div>
                Alertas Clínicas Activas
              </h2>
              <span className="chip" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', fontWeight: 700, borderColor: 'transparent' }}>
                {alertasClinicas.length} Alerta{alertasClinicas.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alertasClinicas.map((alert, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`alert alert-${alert.tipo || 'info'}`}
                  style={{ 
                    margin: 0, 
                    cursor: alert.pacienteId ? 'pointer' : 'default',
                    borderLeftWidth: '4px'
                  }}
                  onClick={() => alert.pacienteId && handleVerPaciente(alert.pacienteId)}
                >
                  <IconAlert width={15} height={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    {alert.pacienteNombre && <strong style={{ display: 'block', fontSize: 12.5 }}>{alert.pacienteNombre}</strong>}
                    <span style={{ fontSize: 12 }}>{alert.mensaje}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trend Mini-Chart */}
          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h2>
                <div className="card-header-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                  <IconActivity width={15} height={15} />
                </div>
                Tendencia de Consultas
              </h2>
            </div>
            <div className="card-body" style={{ paddingBottom: 10 }}>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-gradient-start)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-gradient-start)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="consultas" stroke="var(--chart-gradient-start)" fill="url(#areaGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <h2>
            <div className="card-header-icon"><IconHistory width={15} height={15} /></div>
            Actividad Clínica Reciente
          </h2>
          <span className="chip">{consultasRecientes.length} consultas médicas en curso</span>
        </div>
        <div className="card-body" style={{ padding: '0 22px' }}>
          <div className="activity-feed" style={{ padding: '18px 0' }}>
            {consultasRecientes.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No hay atenciones médicas registradas recientemente.
              </div>
            ) : (
              consultasRecientes.map((act, i) => (
                <motion.div
                  key={i}
                  className="activity-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="activity-icon">
                    <IconClipboard width={14} height={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                      <span 
                        style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--color-primary)', cursor: 'pointer' }}
                        onClick={() => handleVerPaciente(act.pacienteId)}
                      >
                        {act.pacienteNombre}
                      </span>
                      <span className="activity-time">{act.fecha}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      Especialidad: <span style={{ fontWeight: 600 }}>{act.areaMedica}</span> &nbsp;·&nbsp; 
                      Atendido por: <span style={{ fontWeight: 600 }}>{act.medico}</span>
                    </p>
                    <p style={{ fontSize: 12.5, color: 'var(--color-text)', marginTop: 4, background: 'var(--color-bg-subtle)', padding: '7px 12px', borderRadius: 6, borderLeft: '3px solid var(--color-primary-glow)' }}>
                      <strong>Diagnóstico:</strong> {act.diagnostico}
                    </p>
                  </div>
                  <div style={{ alignSelf: 'center' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleVerPaciente(act.pacienteId)}
                      style={{ padding: '5px 12px', fontSize: 11.5 }}
                    >
                      Ver Historial
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
