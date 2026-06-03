import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacher } from '../../api';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    teacher.getGroups()
      .then(setGroups)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel del Docente</h1>
            <p className="text-gray-500">Bienvenido, {user?.name}. Gestiona tus grupos y estudiantes.</p>
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : groups.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 text-lg mb-2">Aún no tienes grupos</p>
            <p className="text-gray-400 text-sm mb-6">Crea tu primer grupo para comenzar a dar de alta estudiantes.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Crear primer grupo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Link to={`/teacher/groups/${g.id}`} className="btn-primary flex-1 text-center text-sm py-2">
                    Ver estudiantes
                  </Link>
                  <Link to={`/teacher/groups/${g.id}/stats`} className="btn-secondary flex-1 text-center text-sm py-2">
                    Estadísticas
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
