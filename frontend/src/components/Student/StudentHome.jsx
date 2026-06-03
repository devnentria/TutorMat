import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { student, sessions } from '../../api';
import Navbar from '../Navbar';

export default function StudentHome() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(null); // activityId being started

  useEffect(() => {
    student.getHome()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (activityId) => {
    setStarting(activityId);
    try {
      const { session_id } = await sessions.create(activityId);
      navigate(`/evaluation/${session_id}`);
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fmtTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">Cerrar</button>
          </div>
        )}

        {/* Saludo */}
        {data && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Hola, {data.user.name}
            </h1>
            {data.user.group_name ? (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Grupo: <span className="font-medium text-gray-700 dark:text-gray-300">{data.user.group_name}</span>
                {data.user.teacher_name && (
                  <span className="ml-2 text-gray-400">· Docente: {data.user.teacher_name}</span>
                )}
              </p>
            ) : (
              <p className="text-yellow-600 mt-1 text-sm">
                Aún no estás asignado a un grupo. Tu docente te asignará próximamente.
              </p>
            )}
          </div>
        )}

        {/* Actividades disponibles */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Actividades disponibles
          </h2>

          {data?.activities?.length === 0 && (
            <div className="card text-center text-gray-500 dark:text-gray-400 py-12">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium">No hay actividades asignadas aún.</p>
              <p className="text-sm mt-1">Tu docente publicará actividades próximamente.</p>
            </div>
          )}

          <div className="space-y-4">
            {data?.activities?.map(act => (
              <div key={act.id}
                className="card flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{act.name}</h3>
                  {act.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{act.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {act.due_date && (
                      <span>Fecha límite: <strong className="text-gray-600 dark:text-gray-300">{fmtDate(act.due_date)}</strong></span>
                    )}
                    {act.attempts > 0 && (
                      <span>{act.attempts} intento{act.attempts !== 1 ? 's' : ''} realizado{act.attempts !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* Acción */}
                <div className="flex-shrink-0">
                  {act.completed_session_id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 rounded-full px-3 py-1">
                        Completada
                      </span>
                      <button
                        onClick={() => navigate(`/results/${act.completed_session_id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline">
                        Ver resultados
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStart(act.id)}
                      disabled={starting === act.id}
                      className="btn-primary px-6 disabled:opacity-60">
                      {starting === act.id ? 'Iniciando...' : act.attempts > 0 ? 'Reintentar' : 'Comenzar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sesiones recientes */}
        {data?.recent_sessions?.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Actividad reciente
            </h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-400 font-medium">Actividad</th>
                    <th className="text-center py-2 text-gray-400 font-medium">Preguntas</th>
                    <th className="text-center py-2 text-gray-400 font-medium">Correctas</th>
                    <th className="text-center py-2 text-gray-400 font-medium">Estado</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_sessions.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 text-gray-700 dark:text-gray-300">
                        {s.activity_name || 'Evaluación libre'}
                      </td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">{s.total_questions}</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">{s.correct_answers ?? '—'}</td>
                      <td className="text-center py-3">
                        {s.status === 'completed' ? (
                          <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Completada</span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">En curso</span>
                        )}
                      </td>
                      <td className="text-right py-3 text-gray-400 dark:text-gray-500 text-xs">{fmtTime(s.start_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
