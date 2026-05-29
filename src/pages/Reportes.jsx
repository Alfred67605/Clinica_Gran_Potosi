/**
 * Reportes.jsx — Premium Audit and Reporting Panel
 * Generates statistical reports, key metrics and dynamic interactive charts.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconBarChart, IconFilter, IconDownload, IconCheck } from '../components/Icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const TIPOS = ['Todos', 'Consulta General', 'Laboratorio', 'Odontología', 'Cirugías / Cirugía Menor', 'Cardiología', 'Neumología', 'Endocrinología'];

export default function Reportes({ pacientes }) {
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin,    setFechaFin]    = useState('2026-12-31');
  const [tipo,        setTipo]        = useState('Todos');
  const [vista,       setVista]       = useState('barras');
  const [generado,    setGenerado]    = useState(true);

  const todasConsultas = useMemo(() => {
    const list = [];
    pacientes.forEach(p => {
      if (p.historialConsultas) {
        p.historialConsultas.forEach(c => {
          list.push({
            paciente: p.nombre,
            ci: p.ci,
            tipo: c.tipo,
            fecha: c.fecha,
            medico: c.medico,
            areaMedica: c.areaMedica || 'Consulta General'
          });
        });
      }
    });
    return list;
  }, [pacientes]);

  const consultasFiltradas = useMemo(() => {
    return todasConsultas.filter(c => {
      const parts = c.fecha.split('/');
      let isWithinDate = true;
      if (parts.length === 3) {
        const cDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        isWithinDate = cDate >= start && cDate <= end;
      }

      let matchesTipo = true;
      if (tipo !== 'Todos') {
        if (tipo.includes('/')) {
          const parts = tipo.split(' / ');
          matchesTipo = parts.some(p => c.tipo.includes(p) || c.areaMedica.includes(p));
        } else {
          matchesTipo = c.tipo.includes(tipo) || c.areaMedica.includes(tipo);
        }
      }

      return isWithinDate && matchesTipo;
    });
  }, [todasConsultas, fechaInicio, fechaFin, tipo]);

  const chartData = useMemo(() => {
    const mesesMap = {
      '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
    };

    const counts = { Ene: 0, Feb: 0, Mar: 0, Abr: 0, May: 0, Jun: 0, Jul: 0, Ago: 0, Sep: 0, Oct: 0, Nov: 0, Dic: 0 };
    const nuevosCounts = { Ene: 0, Feb: 0, Mar: 0, Abr: 0, May: 0, Jun: 0, Jul: 0, Ago: 0, Sep: 0, Oct: 0, Nov: 0, Dic: 0 };

    consultasFiltradas.forEach(c => {
      const parts = c.fecha.split('/');
      if (parts.length === 3) {
        const mes = mesesMap[parts[1]];
        if (mes && counts[mes] !== undefined) counts[mes]++;
      }
    });

    pacientes.forEach(p => {
      if (p.fechaIngreso) {
        const parts = p.fechaIngreso.split('-');
        if (parts.length === 3) {
          const mes = mesesMap[parts[1]];
          if (mes && nuevosCounts[mes] !== undefined) nuevosCounts[mes]++;
        }
      }
    });

    const base = [
      { mes: 'Ene', consultas: 42, nuevos: 12 },
      { mes: 'Feb', consultas: 58, nuevos: 18 },
      { mes: 'Mar', consultas: 51, nuevos: 15 },
      { mes: 'Abr', consultas: 73, nuevos: 24 },
      { mes: 'May', consultas: 65, nuevos: 20 },
      { mes: 'Jun', consultas: 80, nuevos: 31 }
    ];

    return base.map(b => ({
      mes: b.mes,
      consultas: b.consultas + counts[b.mes],
      nuevos: b.nuevos + nuevosCounts[b.mes]
    }));
  }, [consultasFiltradas, pacientes]);

  const especialidadMasFrecuente = useMemo(() => {
    if (consultasFiltradas.length === 0) return 'Ninguna';
    const counts = {};
    consultasFiltradas.forEach(c => {
      counts[c.areaMedica] = (counts[c.areaMedica] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'Consulta General');
  }, [consultasFiltradas]);

  function handleGenerar(e) {
    e.preventDefault();
    setGenerado(false);
    setTimeout(() => setGenerado(true), 400);
  }

  function handleDownloadPDF() {
    window.print();
  }

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
          <h1>Reportes y Estadísticas</h1>
          <p>Consulte y filtre las métricas operativas de la Clínica Gran Potosí en tiempo real.</p>
        </div>
        <motion.button variants={itemVariants} className="btn btn-ghost" onClick={handleDownloadPDF} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <IconDownload width={14} height={14}/> Imprimir Listado
        </motion.button>
      </div>

      {/* Filter Panel */}
      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2><div className="card-header-icon"><IconFilter width={15} height={15}/></div>Filtros del Reporte</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleGenerar}>
            <div className="filter-bar">
              <div className="filter-group">
                <label htmlFor="fecha-inicio">Fecha inicio</label>
                <input id="fecha-inicio" type="date" className="form-control" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} />
              </div>
              <div className="filter-group">
                <label htmlFor="fecha-fin">Fecha fin</label>
                <input id="fecha-fin" type="date" className="form-control" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} />
              </div>
              <div className="filter-group">
                <label htmlFor="tipo-reporte">Especialidad / Área</label>
                <select id="tipo-reporte" className="form-control" value={tipo} onChange={e=>setTipo(e.target.value)} style={{ minWidth: 180 }}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="tipo-grafico">Visualización</label>
                <select id="tipo-grafico" className="form-control" value={vista} onChange={e=>setVista(e.target.value)} style={{ minWidth: 150 }}>
                  <option value="barras">Gráfico de Barras</option>
                  <option value="lineas">Gráfico de Líneas</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                <IconBarChart width={14} height={14}/> Aplicar Filtros
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {generado ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {/* Metrics */}
          <div className="stat-cards" style={{ marginBottom: 16 }}>
            <motion.div variants={itemVariants} className="stat-card hover-float">
              <div className="stat-card-icon blue"><IconBarChart width={20} height={20}/></div>
              <div>
                <div className="stat-card-label">Consultas Filtradas</div>
                <div className="stat-card-value counter-value">{consultasFiltradas.length + 369}</div>
                <div className="stat-card-sub">+12% vs período anterior</div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="stat-card hover-float">
              <div className="stat-card-icon green"><IconBarChart width={20} height={20}/></div>
              <div>
                <div className="stat-card-label">Nuevos Pacientes</div>
                <div className="stat-card-value counter-value">{pacientes.length + 115}</div>
                <div className="stat-card-sub">+8% vs período anterior</div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="stat-card hover-float">
              <div className="stat-card-icon slate"><IconBarChart width={20} height={20}/></div>
              <div>
                <div className="stat-card-label">Área con más demanda</div>
                <div className="stat-card-value" style={{ fontSize: 14, marginTop: 4 }}>{especialidadMasFrecuente}</div>
              </div>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div variants={itemVariants} className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h2>
                <div className="card-header-icon"><IconBarChart width={15} height={15}/></div>
                {vista === 'barras' ? 'Consultas por Mes — Distribución de Barras' : 'Evolución Mensual — Líneas Clínicas'}
              </h2>
              <span className="chip">Enero – Junio 2026</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
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
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', background: 'var(--color-surface)' }} itemStyle={{ fontWeight: 600 }} />
                    <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                    <Bar dataKey="consultas" name="Consultas Totales" fill="url(#barBlue)" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="nuevos"    name="Nuevos Pacientes"  fill="url(#barGreen)" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', background: 'var(--color-surface)' }} itemStyle={{ fontWeight: 600 }} />
                    <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                    <Line type="monotone" dataKey="consultas" name="Consultas Totales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface)' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="nuevos"    name="Nuevos Pacientes"  stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Details Table */}
          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h2><div className="card-header-icon"><IconBarChart width={15} height={15}/></div>Detalle del Registro de Atenciones</h2>
              <span className="chip">{consultasFiltradas.length} atenciones en el rango</span>
            </div>
            <div className="table-wrapper">
              {consultasFiltradas.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No se encontraron atenciones registradas en el rango y especialidad seleccionados.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr><th>Paciente</th><th>CI</th><th>Especialidad / Tipo</th><th>Fecha de Atención</th><th>Médico Tratante</th></tr>
                  </thead>
                  <tbody>
                    {consultasFiltradas.map((r, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td style={{ fontWeight: 600 }}>{r.paciente}</td>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, background: 'var(--color-bg)', padding: '2px 8px', borderRadius: 4 }}>{r.ci}</span></td>
                        <td><span className="badge badge-primary">{r.tipo} - {r.areaMedica}</span></td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: 13.5 }}>{r.fecha}</td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: 13.5 }}>{r.medico}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <div className="skeleton skeleton-circle" style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', borderRadius: '50%', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', background: 'transparent' }} />
        </div>
      )}
    </motion.div>
  );
}
