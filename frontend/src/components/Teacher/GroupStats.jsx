import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacher } from '../../api';
import Navbar from '../Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const PIE_COLORS = { 'Básico': '#ef4444', 'En proceso': '#f59e0b', 'Competente': '#3b82f6', 'Avanzado': '#10b981' };
const BAR_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#f97316','#14b8a6'];

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
    precision: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

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
                  <Tooltip formatter={v => [`${v}%`, 'Precisión']} />
                  <Bar dataKey="precision" radius={[4,4,0,0]}>
                    {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>
        </div>

        {/* Mejores estudiantes */}
        {data.top_students?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Estudiantes con Mayor Habilidad</h2>
            <div className="space-y-3">
              {data.top_students.map((s, i) => (
                <div key={s.username} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-blue-400'
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.sessions} sesiones</p>
                  </div>
                  <span className="font-bold text-blue-700">θ = {s.avg_ability?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
