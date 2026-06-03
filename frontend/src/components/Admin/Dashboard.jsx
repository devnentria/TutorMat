import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../api';
import Navbar from '../Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
const LEVEL_LABELS = { 'Básico': '#ef4444', 'En proceso': '#f59e0b', 'Competente': '#3b82f6', 'Avanzado': '#10b981' };
const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600">{error || 'No se pudo cargar el dashboard.'}</p>
        </div>
      </div>
    );
  }

  const { totals, ability_distribution, sessions_by_day, category_performance, recent_sessions } = data;

  const pieData = ability_distribution.map(d => ({
    name: d.level,
    value: d.count,
    fill: LEVEL_LABELS[d.level] || '#6b7280',
  }));

  const lineData = sessions_by_day.map(d => ({
    date: d.date.slice(5), // MM-DD
    sesiones: d.count,
  }));

  const barData = category_performance.map((c, i) => ({
    name: c.category.length > 18 ? c.category.slice(0, 18) + '…' : c.category,
    fullName: c.category,
    precision: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
    total: c.total,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard de Administrador</h1>
            <p className="text-gray-500">Indicadores generales del sistema EvaluTrig</p>
          </div>
          <Link to="/admin/students" className="btn-primary">Ver Estudiantes</Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KPI label="Estudiantes" value={totals.students} color="blue" icon="👤" />
          <KPI label="Sesiones" value={totals.sessions} color="green" icon="📝" />
          <KPI label="Completadas" value={totals.completed_sessions} color="purple" icon="✅" />
          <KPI label="Respuestas" value={totals.responses} color="yellow" icon="💬" />
          <KPI label="Preguntas" value={totals.questions} color="pink" icon="❓" />
          <KPI label="Precisión Avg" value={`${totals.avg_accuracy}%`} color="teal" icon="🎯" />
        </div>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribución de niveles */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Distribución de Niveles de Habilidad</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Sin sesiones completadas aún" />
            )}
          </div>

          {/* Sesiones por día */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Sesiones por Día (últimos 30 días)</h2>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sesiones" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Sin datos de sesiones recientes" />
            )}
          </div>
        </div>

        {/* Rendimiento por categoría */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Precisión por Categoría</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v, n, p) => [`${v}% (${p.payload.total} respuestas)`, 'Precisión']}
                  labelFormatter={(label) => barData.find(d => d.name === label)?.fullName || label}
                />
                <Bar dataKey="precision" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Sin respuestas registradas aún" />
          )}
        </div>

        {/* Sesiones recientes */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Sesiones Recientes</h2>
            <Link to="/admin/students" className="text-sm text-blue-600 hover:underline">Ver todos →</Link>
          </div>
          {recent_sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Estudiante</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Grupo</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Preguntas</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Precisión</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Habilidad</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Estado</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_sessions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{s.name || s.username}</p>
                        <p className="text-xs text-gray-400">{s.username}</p>
                      </td>
                      <td className="py-3 text-gray-600">{s.grade || '—'}</td>
                      <td className="text-center py-3 text-gray-600">{s.total_questions}</td>
                      <td className="text-center py-3">
                        {s.total_questions > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.correct_answers / s.total_questions >= 0.7 ? 'bg-green-100 text-green-700' :
                            s.correct_answers / s.total_questions >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {Math.round((s.correct_answers / s.total_questions) * 100)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-center py-3 text-gray-600">
                        {s.final_ability != null ? s.final_ability.toFixed(2) : '—'}
                      </td>
                      <td className="text-center py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.status === 'completed' ? 'Completa' : 'En progreso'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(s.start_time).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No hay sesiones registradas aún" />
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon }) {
  return (
    <div className="card text-center py-4">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">{text}</div>
  );
}
