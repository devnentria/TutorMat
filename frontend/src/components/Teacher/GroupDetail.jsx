import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacher } from '../../api';
import Navbar from '../Navbar';
import GeoSelector from '../common/GeoSelector';

function genPassword(username) {
  return username + Math.floor(100 + Math.random() * 900);
}

const TABS = ['estudiantes', 'actividades'];

export default function GroupDetail() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('estudiantes');

  // Estudiantes
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', grade: '', password: '' });
  const [geoForm, setGeoForm] = useState({ country: 'México', state: '', school: '' });
  const [saving, setSaving] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [search, setSearch] = useState('');

  // Actividades
  const [activities, setActivities] = useState([]);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [actForm, setActForm] = useState({ name: '', description: '', due_date: '' });
  const [savingAct, setSavingAct] = useState(false);

  const load = () => {
    setLoading(true);
    teacher.getGroupStudents(groupId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const loadActivities = () => {
    teacher.getActivities(groupId)
      .then(setActivities)
      .catch(e => setError(e.message));
  };

  useEffect(() => { load(); loadActivities(); }, [groupId]);

  // ── Estudiantes ──────────────────────────────────────────────────────────────

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const pwd = form.password || genPassword(form.username);
      const student = await teacher.addStudent(groupId, {
        name: form.name, username: form.username, grade: form.grade, password: pwd,
        country: geoForm.country, state: geoForm.state, school: geoForm.school,
      });
      setNewCredentials({ name: student.name, username: student.username, password: student.password });
      setForm({ name: '', username: '', grade: '', password: '' });
      setGeoForm({ country: 'México', state: '', school: '' });
      setShowAdd(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleReset = async (studentId, username) => {
    const newPwd = genPassword(username);
    try {
      const res = await teacher.resetPassword(studentId, newPwd);
      setResetTarget({ username, password: res.password });
    } catch (e) { setError(e.message); }
  };

  const handleRemove = async (studentId) => {
    if (!confirm('¿Quitar este estudiante del grupo? Su historial no se borrará.')) return;
    try { await teacher.removeStudent(studentId); load(); }
    catch (e) { setError(e.message); }
  };

  // ── Actividades ──────────────────────────────────────────────────────────────

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setSavingAct(true);
    setError('');
    try {
      await teacher.createActivity(groupId, actForm);
      setActForm({ name: '', description: '', due_date: '' });
      setShowNewActivity(false);
      loadActivities();
    } catch (e) { setError(e.message); }
    finally { setSavingAct(false); }
  };

  const handleToggleActivity = async (actId, currentStatus) => {
    const next = currentStatus === 'active' ? 'inactive' : 'active';
    try { await teacher.toggleActivity(actId, next); loadActivities(); }
    catch (e) { setError(e.message); }
  };

  const handleDeleteActivity = async (actId) => {
    if (!confirm('¿Eliminar esta actividad? Las sesiones ya realizadas no se borrarán.')) return;
    try { await teacher.deleteActivity(actId); loadActivities(); }
    catch (e) { setError(e.message); }
  };

  const fmtDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = (data?.students || []).filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/teacher" className="btn-secondary text-sm">← Mis grupos</Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{data?.group?.name || 'Cargando...'}</h1>
            {data?.group?.description && <p className="text-gray-500 text-sm">{data.group.description}</p>}
          </div>
          <Link to={`/teacher/groups/${groupId}/stats`} className="btn-secondary text-sm">
            Ver estadísticas
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline ml-2">Cerrar</button>
          </div>
        )}

        {/* Credenciales recién creadas */}
        {(newCredentials || resetTarget) && (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-green-800 mb-3">
              {newCredentials ? '✅ Estudiante dado de alta' : '🔑 Contraseña restablecida'}
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Usuario / Matrícula</p>
                <p className="font-bold text-gray-800 text-lg">{(newCredentials || resetTarget).username}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Contraseña</p>
                <p className="font-bold text-gray-800 text-lg">{(newCredentials || resetTarget).password}</p>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-3 font-medium">
              ⚠ Anota esta contraseña ahora. No se mostrará de nuevo.
            </p>
            <button onClick={() => { setNewCredentials(null); setResetTarget(null); }}
              className="mt-3 text-sm text-green-700 underline">
              Listo, ya la anoté
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'estudiantes'
                ? `Estudiantes (${data?.students?.length ?? 0})`
                : `Actividades (${activities.length})`}
            </button>
          ))}
        </div>

        {/* ── Tab: Estudiantes ─────────────────────────────────────────────────── */}
        {tab === 'estudiantes' && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" placeholder="Buscar estudiante..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field flex-1 min-w-48" />
              <button onClick={() => setShowAdd(true)} className="btn-primary">
                + Dar de alta estudiante
              </button>
            </div>

            {/* Modal alta */}
            {showAdd && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Dar de alta estudiante</h2>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nombre del estudiante" className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula / Usuario *</label>
                      <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="Ej: 20240001" className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semestre / Grupo</label>
                      <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                        placeholder="Ej: 2do Semestre" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña inicial <span className="text-gray-400">(opcional)</span>
                      </label>
                      <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Dejar vacío para generar automáticamente" className="input-field" />
                    </div>
                    <GeoSelector
                      country={geoForm.country}
                      state={geoForm.state}
                      school={geoForm.school}
                      onChange={setGeoForm}
                    />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={saving} className="btn-primary flex-1">
                        {saving ? 'Guardando...' : 'Registrar'}
                      </button>
                      <button type="button" onClick={() => { setShowAdd(false); setError(''); }}
                        className="btn-secondary flex-1">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                      <th className="text-center py-3 text-gray-500 font-medium">Nivel prom.</th>
                      <th className="text-center py-3 text-gray-500 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{s.name}</td>
                        <td className="py-3 text-gray-600 font-mono">{s.username}</td>
                        <td className="py-3 text-gray-500">{s.grade || '—'}</td>
                        <td className="text-center py-3 text-gray-600">{s.total_sessions}</td>
                        <td className="text-center py-3">
                          {s.avg_ability != null ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.avg_ability >= 1.5 ? 'bg-green-100 text-green-700' :
                              s.avg_ability >= 0 ? 'bg-blue-100 text-blue-700' :
                              s.avg_ability >= -1.5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'}`}>
                              {s.avg_ability >= 1.5 ? 'Avanzado' :
                               s.avg_ability >= 0 ? 'Competente' :
                               s.avg_ability >= -1.5 ? 'En proceso' : 'Básico'}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-center py-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleReset(s.id, s.username)}
                              className="text-xs text-amber-600 hover:underline">
                              Resetear pwd
                            </button>
                            <button onClick={() => handleRemove(s.id)}
                              className="text-xs text-red-500 hover:underline">
                              Quitar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          {search ? 'No se encontraron resultados' : 'No hay estudiantes en este grupo aún'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Tab: Actividades ─────────────────────────────────────────────────── */}
        {tab === 'actividades' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowNewActivity(true)} className="btn-primary">
                + Nueva actividad
              </button>
            </div>

            {/* Modal nueva actividad */}
            {showNewActivity && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva actividad</h2>
                  <form onSubmit={handleCreateActivity} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input value={actForm.name}
                        onChange={e => setActForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ej: Evaluación parcial 1 — Funciones trigonométricas"
                        className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea value={actForm.description}
                        onChange={e => setActForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Instrucciones o notas para los estudiantes"
                        rows={3} className="input-field resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                      <input type="date" value={actForm.due_date}
                        onChange={e => setActForm(f => ({ ...f, due_date: e.target.value }))}
                        className="input-field" />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={savingAct} className="btn-primary flex-1">
                        {savingAct ? 'Creando...' : 'Crear actividad'}
                      </button>
                      <button type="button"
                        onClick={() => { setShowNewActivity(false); setError(''); }}
                        className="btn-secondary flex-1">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activities.length === 0 ? (
              <div className="card text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium text-gray-600">No hay actividades en este grupo</p>
                <p className="text-sm mt-1">Crea una actividad para que tus estudiantes puedan iniciar una evaluación.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{act.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          act.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {act.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{act.description}</p>
                      )}
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        {act.due_date && <span>Límite: {fmtDate(act.due_date)}</span>}
                        <span>Creada: {fmtDate(act.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActivity(act.id, act.status)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          act.status === 'active'
                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}>
                        {act.status === 'active' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
