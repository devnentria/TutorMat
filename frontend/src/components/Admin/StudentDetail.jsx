import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { admin } from '../../api';
import Navbar from '../Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.getStudent(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600">{error || 'No se encontró el estudiante.'}</p>
          <Link to="/admin/students" className="btn-primary mt-4 inline-block">Volver</Link>
        </div>
      </div>
    );
  }

  const { student, sessions, category_stats } = data;

  const chartData = category_stats.map((c, i) => ({
    name: c.category.length > 18 ? c.category.slice(0, 18) + '…' : c.category,
    precision: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgAbility = completedSessions.length > 0
    ? (completedSessions.reduce((a, s) => a + (s.final_ability || 0), 0) / completedSessions.length)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/students" className="btn-secondary text-sm">← Estudiantes</Link>
          <h1 className="text-2xl font-bold text-gray-800">{student.name || student.username}</h1>
        </div>

        {/* Info del estudiante */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-xs text-gray-500">Matrícula</p>
            <p className="font-bold text-gray-800">{student.username}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500">Grupo</p>
            <p className="font-bold text-gray-800">{student.grade || '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500">Sesiones</p>
            <p className="font-bold text-gray-800">{sessions.length}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500">Habilidad Promedio</p>
            <p className="font-bold text-gray-800">{avgAbility != null ? avgAbility.toFixed(2) : '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Progresión de habilidad */}
          {completedSessions.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Progresión de Habilidad</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={completedSessions.map((s, i) => ({ n: i + 1, θ: s.final_ability }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="n" label={{ value: 'Sesión', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v?.toFixed(3), 'θ']} />
                  <Bar dataKey="θ" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Precisión por categoría */}
          {chartData.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Precisión por Categoría</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Precisión']} />
                  <Bar dataKey="precision" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Historial de sesiones */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Historial de Sesiones</h2>
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Fecha</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Preguntas</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Correctas</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Precisión</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Habilidad Final</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Error</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{new Date(s.start_time).toLocaleDateString('es-MX')}</td>
                      <td className="text-center py-3 text-gray-600">{s.total_questions}</td>
                      <td className="text-center py-3 text-gray-600">{s.correct_answers}</td>
                      <td className="text-center py-3">
                        {s.total_questions > 0 ? `${Math.round((s.correct_answers / s.total_questions) * 100)}%` : '—'}
                      </td>
                      <td className="text-center py-3 text-gray-600">
                        {s.final_ability != null ? s.final_ability.toFixed(3) : '—'}
                      </td>
                      <td className="text-center py-3 text-gray-500">
                        {s.final_error != null ? s.final_error.toFixed(3) : '—'}
                      </td>
                      <td className="text-center py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.status === 'completed' ? 'Completa' : 'En progreso'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Sin sesiones registradas</p>
          )}
        </div>
      </div>
    </div>
  );
}
