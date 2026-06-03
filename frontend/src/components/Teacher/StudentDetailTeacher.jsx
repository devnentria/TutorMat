import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacher } from '../../api';
import Navbar from '../Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const LEVEL_COLORS = {
  'Básico': 'text-red-600 bg-red-50 border-red-200',
  'En proceso': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Competente': 'text-blue-600 bg-blue-50 border-blue-200',
  'Avanzado': 'text-green-600 bg-green-50 border-green-200',
};

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

function fmtTime(ms) {
  if (!ms) return '—';
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function StudentDetailTeacher() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacher.getStudentDetail(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

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
        <p className="text-red-600 mb-4">{error || 'No se encontraron datos del estudiante.'}</p>
        <Link to="/teacher" className="btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );

  const levelStyle = LEVEL_COLORS[data.ability_level] || 'text-gray-600 bg-gray-50 border-gray-200';

  const categoryData = Object.entries(data.category_stats).map(([cat, s], i) => ({
    subject: cat.length > 20 ? cat.slice(0, 20) + '…' : cat,
    fullName: cat,
    accuracy: Math.round(s.accuracy * 100),
    total: s.total,
    correct: s.correct,
    avg_time: s.avg_time,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const completedSessions = data.sessions.filter(s => s.status === 'completed');
  const totalQuestions = data.sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0);
  const totalCorrect = data.sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestTheta = completedSessions.length > 0
    ? Math.max(...completedSessions.map(s => s.final_ability || -99))
    : null;

  const backLink = data.student.group_id
    ? `/teacher/groups/${data.student.group_id}`
    : '/teacher';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={backLink} className="btn-secondary text-sm">← Volver al grupo</Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{data.student.name}</h1>
            <p className="text-gray-500 text-sm font-mono">{data.student.username}
              {data.student.grade && <span className="ml-2 font-sans">· {data.student.grade}</span>}
            </p>
          </div>
        </div>

        {/* Ability level badge */}
        <div className={`border-2 rounded-2xl p-5 mb-6 flex items-center gap-5 ${levelStyle}`}>
          <div className="text-4xl">
            {data.ability_level === 'Avanzado' ? '🏆' :
             data.ability_level === 'Competente' ? '✅' :
             data.ability_level === 'En proceso' ? '📈' : '📚'}
          </div>
          <div>
            <p className="text-sm font-medium opacity-70">Nivel de desempeño</p>
            <p className="text-xl font-bold">{data.ability_level}</p>
            <p className="text-sm opacity-80">{data.ability_description}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs opacity-60">θ (habilidad estimada)</p>
            <p className="text-2xl font-bold">{data.final_ability.toFixed(2)}</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Metric label="Sesiones totales" value={data.sessions.length} />
          <Metric label="Completadas" value={completedSessions.length} />
          <Metric label="Preguntas respondidas" value={totalQuestions} />
          <Metric label="Precisión promedio" value={`${avgAccuracy}%`} />
          <Metric label="Mejor θ" value={bestTheta != null ? bestTheta.toFixed(2) : '—'} />
        </div>

        {/* Charts */}
        {categoryData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bar chart */}
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Precisión por Categoría</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.correct}/${p.payload.total})`, 'Precisión']} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar chart */}
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Perfil de Habilidades</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={categoryData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Precisión" dataKey="accuracy" fill="#3b82f6" fillOpacity={0.3} stroke="#2563eb" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category detail table */}
        {categoryData.length > 0 && (
          <div className="card mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">Detalle por Categoría</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Categoría</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Preguntas</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Correctas</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Precisión</th>
                    <th className="text-center py-2 text-gray-500 font-medium">T. Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map(c => (
                    <tr key={c.fullName} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-700">{c.fullName}</td>
                      <td className="text-center py-3 text-gray-600">{c.total}</td>
                      <td className="text-center py-3 text-gray-600">{c.correct}</td>
                      <td className="text-center py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.accuracy >= 70 ? 'bg-green-100 text-green-700' :
                          c.accuracy >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {c.accuracy}%
                        </span>
                      </td>
                      <td className="text-center py-3 text-gray-500">{fmtTime(c.avg_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Session history */}
        {data.sessions.length > 0 && (
          <div className="card mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">Historial de sesiones</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Fecha</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Preguntas</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Precisión</th>
                    <th className="text-center py-2 text-gray-500 font-medium">θ final</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map(s => {
                    const acc = s.total_questions > 0
                      ? Math.round((s.correct_answers / s.total_questions) * 100)
                      : null;
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 text-gray-700">{fmtDate(s.start_time)}</td>
                        <td className="text-center py-3 text-gray-600">{s.total_questions || '—'}</td>
                        <td className="text-center py-3">
                          {acc != null ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              acc >= 70 ? 'bg-green-100 text-green-700' :
                              acc >= 40 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {acc}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-center py-3 text-gray-600 font-mono">
                          {s.final_ability != null ? s.final_ability.toFixed(2) : '—'}
                        </td>
                        <td className="text-center py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.status === 'completed' ? 'bg-green-100 text-green-700' :
                            s.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {s.status === 'completed' ? 'Completada' :
                             s.status === 'in_progress' ? 'En progreso' : s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations?.length > 0 && (
          <div className="card mb-8 bg-amber-50 border border-amber-200">
            <h2 className="font-semibold text-amber-800 mb-4">Recomendaciones de estudio</h2>
            <ul className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-amber-500 mt-0.5">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
