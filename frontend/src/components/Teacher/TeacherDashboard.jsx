import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacher } from '../../api';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const PIE_COLORS = { 'Básico': '#ef4444', 'En proceso': '#f59e0b', 'Competente': '#3b82f6', 'Avanzado': '#10b981' };
const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    teacher.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await teacher.createGroup(form.name, form.description);
      setForm({ name: '', description: '' });
      setShowCreate(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar el grupo? Los estudiantes no serán borrados.')) return;
    try { await teacher.deleteGroup(id); load(); }
    catch (e) { setError(e.message); }
  };

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

  const { totals, ability_distribution, sessions_by_day, category_performance, groups } = data;

  const pieData = ability_distribution.map(d => ({
    name: d.level,
    value: d.count,
    fill: PIE_COLORS[d.level] || '#6b7280',
  }));

  const lineData = sessions_by_day.map(d => ({
    date: d.date.slice(5),
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
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel del Docente</h1>
            <p className="text-gray-500">Bienvenido, {user?.name}. Aquí está el resumen de tus grupos.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + Nuevo grupo
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm">
            {error} <button onClick={() => setError('')} className="ml-2 underline">Cerrar</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI label="Estudiantes" value={totals.students} icon="👤" color="blue" />
          <KPI label="Sesiones" value={totals.sessions} icon="📝" color="green" />
          <KPI label="Completadas" value={totals.completed_sessions} icon="✅" color="purple" />
          <KPI label="Precisión Prom." value={`${totals.avg_accuracy}%`} icon="🎯" color="teal" />
        </div>

        {/* Gráficas */}
        {(pieData.length > 0 || lineData.length > 0 || barData.length > 0) && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-4">Distribución de Niveles de Habilidad</h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart text="Sin sesiones completadas aún" />}
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-4">Sesiones por Día (últimos 30 días)</h2>
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sesiones" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <EmptyChart text="Sin actividad reciente" />}
              </div>
            </div>

            {barData.length > 0 && (
              <div className="card mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">Precisión por Categoría</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v, n, p) => [`${v}% (${p.payload.total} respuestas)`, 'Precisión']}
                      labelFormatter={(label) => barData.find(d => d.name === label)?.fullName || label}
                    />
                    <Bar dataKey="precision" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Grupos */}
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Mis Grupos</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {groups.length}
          </span>
        </div>

        {groups.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 text-lg mb-2">Aún no tienes grupos</p>
            <p className="text-gray-400 text-sm mb-6">Crea tu primer grupo para comenzar a dar de alta estudiantes.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Crear primer grupo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(g => (
              <div key={g.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{g.name}</h3>
                    {g.description && <p className="text-sm text-gray-500">{g.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(g.id)}
                    className="text-gray-300 hover:text-red-400 text-xl leading-none" title="Eliminar grupo">
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-blue-700">{g.student_count}</span>
                  <span className="text-sm text-gray-500">estudiantes registrados</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/teacher/groups/${g.id}`}
                    className="btn-primary flex-1 text-center text-sm py-2">
                    Ver estudiantes
                  </Link>
                  <Link to={`/teacher/groups/${g.id}/stats`}
                    className="btn-secondary flex-1 text-center text-sm py-2">
                    Estadísticas
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear grupo */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crear nuevo grupo</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Grupo A — 2do Semestre" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ej: Turno matutino, módulo de trigonometría" className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creando...' : 'Crear grupo'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function EmptyChart({ text }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">{text}</div>
  );
}
