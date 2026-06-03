import React, { useEffect, useState } from 'react';
import { admin } from '../../api';
import Navbar from '../Navbar';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    admin.getTeachers()
      .then(setTeachers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Dar de baja al docente ${name}? Se eliminarán sus grupos y actividades. Los estudiantes quedarán sin grupo.`)) return;
    try {
      await admin.deleteTeacher(id);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Docentes</h1>
          <p className="text-gray-500">Gestión de cuentas de docentes registrados en el sistema.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm">
            {error} <button onClick={() => setError('')} className="ml-2 underline">Cerrar</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 text-lg mb-1">No hay docentes registrados</p>
            <p className="text-gray-400 text-sm">Los docentes se registran desde la pantalla de inicio de sesión.</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Docente</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Institución</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Grupos</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Estudiantes</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Registro</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.username}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <p>{t.school || '—'}</p>
                      <p className="text-xs text-gray-400">{[t.state, t.country].filter(Boolean).join(', ') || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg font-bold text-blue-600">{t.group_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg font-bold text-green-600">{t.student_count}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(t.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors">
                        Dar de baja
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
