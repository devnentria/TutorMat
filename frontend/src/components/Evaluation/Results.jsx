import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessions } from '../../api';
import Navbar from '../Navbar';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

const LEVEL_COLORS = {
  'Básico': 'text-red-600 bg-red-50 border-red-200',
  'En proceso': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Competente': 'text-blue-600 bg-blue-50 border-blue-200',
  'Avanzado': 'text-green-600 bg-green-50 border-green-200',
};

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

export default function Results() {
  const { sessionId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    sessions.getResults(sessionId)
      .then(setResults)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

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

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600 mb-4">{error || 'No se encontraron resultados.'}</p>
          <Link to="/evaluation" className="btn-primary">Nueva evaluación</Link>
        </div>
      </div>
    );
  }

  const levelStyle = LEVEL_COLORS[results.ability_level] || 'text-gray-600 bg-gray-50 border-gray-200';

  const categoryData = Object.entries(results.category_stats).map(([cat, s], i) => ({
    subject: cat.length > 20 ? cat.slice(0, 20) + '…' : cat,
    fullName: cat,
    accuracy: Math.round(s.accuracy * 100),
    total: s.total,
    correct: s.correct,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const fmtTime = (ms) => {
    if (!ms) return '—';
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Resultados de tu Evaluación</h1>
        <p className="text-gray-500 mb-8">Sesión #{sessionId} · {results.student.name}</p>

        {/* Nivel de habilidad */}
        <div className={`border-2 rounded-2xl p-6 mb-6 flex items-center gap-6 ${levelStyle}`}>
          <div className="text-5xl">
            {results.ability_level === 'Avanzado' ? '🏆' :
             results.ability_level === 'Competente' ? '✅' :
             results.ability_level === 'En proceso' ? '📈' : '📚'}
          </div>
          <div>
            <p className="text-sm font-medium opacity-70">Nivel de desempeño</p>
            <p className="text-2xl font-bold">{results.ability_level}</p>
            <p className="text-sm opacity-80">{results.ability_description}</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Metric label="Preguntas" value={results.total_questions} />
          <Metric label="Correctas" value={results.correct_answers} />
          <Metric label="Precisión" value={`${Math.round(results.accuracy * 100)}%`} />
          <Metric label="Tiempo total" value={fmtTime(results.total_time_ms)} />
        </div>

        {/* Gráficas por categoría */}
        {categoryData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Barras de precisión */}
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Precisión por Categoría</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.correct}/${p.payload.total})`, 'Precisión']} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
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

        {/* Tabla de categorías */}
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
                {Object.entries(results.category_stats).map(([cat, s]) => (
                  <tr key={cat} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-700">{cat}</td>
                    <td className="text-center py-3 text-gray-600">{s.total}</td>
                    <td className="text-center py-3 text-gray-600">{s.correct}</td>
                    <td className="text-center py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.accuracy >= 0.7 ? 'bg-green-100 text-green-700' :
                        s.accuracy >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {Math.round(s.accuracy * 100)}%
                      </span>
                    </td>
                    <td className="text-center py-3 text-gray-500">{fmtTime(s.avg_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="card mb-8 bg-amber-50 border border-amber-200">
          <h2 className="font-semibold text-amber-800 mb-4">📚 Recomendaciones de Estudio</h2>
          <ul className="space-y-2">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-amber-500 mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones */}
        <div className="flex gap-4 justify-center">
          <Link to="/student" className="btn-primary px-8 py-3">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, sublabel }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sublabel || label}</p>
    </div>
  );
}
