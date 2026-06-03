import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacher } from '../../api';
import Navbar from '../Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line,
} from 'recharts';

const PIE_COLORS = { 'Básico': '#ef4444', 'En proceso': '#f59e0b', 'Competente': '#3b82f6', 'Avanzado': '#10b981' };
const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

function abilityLabel(avg) {
  if (avg == null) return { label: '—', cls: 'bg-gray-100 text-gray-500' };
  if (avg >= 1.5) return { label: 'Avanzado', cls: 'bg-green-100 text-green-700' };
  if (avg >= 0) return { label: 'Competente', cls: 'bg-blue-100 text-blue-700' };
  if (avg >= -1.5) return { label: 'En proceso', cls: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Básico', cls: 'bg-red-100 text-red-700' };
}

export default function GroupStats() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacher.getGroupStats(groupId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600">{error || 'Sin datos'}</p>
        <Link to="/teacher" className="btn-primary mt-4 inline-block">Volver</Link>
      </div>
    </div>
  );

  const pieData = (data.ability_distribution || []).map(d => ({
    name: d.level, value: d.count, fill: PIE_COLORS[d.level] || '#6b7280'
  }));

  const barData = (data.category_performance || []).map((c, i) => ({
    name: c.category.length > 18 ? c.category.slice(0, 18) + '…' : c.category,
    fullName: c.category,
    precision: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
    total: c.total,
    correct: c.correct,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  const timelineData = (data.sessions_by_day || []).map(d => ({
    date: d.date,
    sesiones: d.count,
  }));

  // Strengths / weaknesses from category_performance
  const strengths = barData.filter(c => c.precision >= 70);
  const inProgress = barData.filter(c => c.precision >= 40 && c.precision < 70);
  const weaknesses = barData.filter(c => c.precision < 40);

  // Per-student table sorted by avg_ability desc
  const perStudent = [...(data.per_student || [])].sort((a, b) => {
    if (a.avg_ability == null && b.avg_ability == null) return 0;
    if (a.avg_ability == null) return 1;
    if (b.avg_ability == null) return -1;
    return b.avg_ability - a.avg_ability;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/teacher/groups/${groupId}`} className="btn-secondary text-sm">← Estudiantes</Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estadísticas: {data.group?.name}</h1>
            <p className="text-gray-500 text-sm">{data.group?.description}</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI label="Estudiantes" value={data.students} />
          <KPI label="Sesiones" value={data.sessions} />
          <KPI label="Categorías evaluadas" value={barData.length} />
          <KPI label="Niveles de habilidad" value={pieData.length > 0 ? pieData.length : '—'} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Distribución de niveles */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Distribución de Niveles</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Legend /><Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>

          {/* Precisión por categoría */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Precisión por Categoría</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.correct}/${p.payload.total})`, 'Precisión']} />
                  <Bar dataKey="precision" radius={[4, 4, 0, 0]}>
                    {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>
        </div>

        {/* Session timeline */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Actividad del grupo — últimos 30 días</h2>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [v, 'Sesiones']} />
                <Line type="monotone" dataKey="sesiones" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              Sin sesiones en los últimos 30 días
            </div>
          )}
        </div>

        {/* Fortalezas y debilidades del grupo */}
        {barData.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Fortalezas y debilidades del grupo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                  Fortalezas (&ge; 70%)
                </p>
                {strengths.length > 0 ? (
                  <ul className="space-y-1">
                    {strengths.map(c => (
                      <li key={c.fullName} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate mr-2">{c.fullName}</span>
                        <span className="font-bold text-green-700 flex-shrink-0">{c.precision}%</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-gray-400">Ninguna categoría con alta precisión aún</p>}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">
                  En progreso (40–69%)
                </p>
                {inProgress.length > 0 ? (
                  <ul className="space-y-1">
                    {inProgress.map(c => (
                      <li key={c.fullName} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate mr-2">{c.fullName}</span>
                        <span className="font-bold text-yellow-700 flex-shrink-0">{c.precision}%</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-gray-400">Sin categorías en este rango</p>}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                  Debilidades (&lt; 40%)
                </p>
                {weaknesses.length > 0 ? (
                  <ul className="space-y-1">
                    {weaknesses.map(c => (
                      <li key={c.fullName} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate mr-2">{c.fullName}</span>
                        <span className="font-bold text-red-700 flex-shrink-0">{c.precision}%</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-gray-400">Sin categorías con baja precisión</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tabla comparativa de estudiantes */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Comparativa de estudiantes</h2>
          {perStudent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-gray-500 font-medium">Nombre</th>
                    <th className="text-left py-3 text-gray-500 font-medium">Matrícula</th>
                    <th className="text-center py-3 text-gray-500 font-medium">Nivel</th>
                    <th className="text-center py-3 text-gray-500 font-medium">Sesiones</th>
                    <th className="text-center py-3 text-gray-500 font-medium">Precisión</th>
                    <th className="text-left py-3 text-gray-500 font-medium">Mejor cat.</th>
                    <th className="text-left py-3 text-gray-500 font-medium">Peor cat.</th>
                    <th className="text-center py-3 text-gray-500 font-medium">Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {perStudent.map(s => {
                    const { label, cls } = abilityLabel(s.avg_ability);
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{s.name}</td>
                        <td className="py-3 text-gray-500 font-mono text-xs">{s.username}</td>
                        <td className="text-center py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
                        </td>
                        <td className="text-center py-3 text-gray-600">{s.total_sessions}</td>
                        <td className="text-center py-3">
                          {s.accuracy != null ? (
                            <span className={`font-medium ${
                              s.accuracy >= 70 ? 'text-green-700' :
                              s.accuracy >= 40 ? 'text-yellow-700' : 'text-red-600'
                            }`}>{s.accuracy}%</span>
                          ) : '—'}
                        </td>
                        <td className="py-3 text-gray-600 text-xs max-w-[120px] truncate">
                          {s.best_category || '—'}
                        </td>
                        <td className="py-3 text-gray-600 text-xs max-w-[120px] truncate">
                          {s.worst_category || '—'}
                        </td>
                        <td className="text-center py-3">
                          <Link to={`/teacher/students/${s.id}`}
                            className="text-xs text-blue-600 hover:underline font-medium">
                            Ver perfil
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <EmptyState />}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function EmptyState() {
  return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sin datos aún</div>;
}
