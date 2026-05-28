import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../api';
import Navbar from '../Navbar';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    admin.getStudents()
      .then(setStudents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.grade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Estudiantes</h1>
            <p className="text-gray-500">{students.length} estudiantes registrados</p>
          </div>
          <Link to="/admin" className="btn-secondary">← Dashboard</Link>
        </div>

        {/* Búsqueda */}
        <div className="card mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, matrícula o grupo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
          />
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-gray-500 font-medium">Nombre</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Matrícula</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Grupo</th>
                  <th className="text-center py-3 text-gray-500 font-medium">Sesiones</th>
                  <th className="text-center py-3 text-gray-500 font-medium">Habilidad Avg</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Última sesión</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Registro</th>
                  <th className="text-center py-3 text-gray-500 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{s.name || '—'}</td>
                    <td className="py-3 text-gray-600">{s.username}</td>
                    <td className="py-3 text-gray-600">{s.grade || '—'}</td>
                    <td className="text-center py-3 text-gray-600">{s.total_sessions}</td>
                    <td className="text-center py-3">
                      {s.avg_ability != null ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.avg_ability >= 1.5 ? 'bg-green-100 text-green-700' :
                          s.avg_ability >= 0 ? 'bg-blue-100 text-blue-700' :
                          s.avg_ability >= -1.5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {s.avg_ability.toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {s.last_session ? new Date(s.last_session).toLocaleDateString('es-MX') : '—'}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(s.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="text-center py-3">
                      <Link to={`/admin/students/${s.id}`}
                        className="text-blue-600 hover:underline text-xs">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      {search ? 'No se encontraron estudiantes con ese criterio' : 'Sin estudiantes registrados aún'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
