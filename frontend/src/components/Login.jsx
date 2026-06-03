import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register-teacher'
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const dest = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={dest} replace />;
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const u = await login(form.username, form.password);
        const dest = u.role === 'admin' ? '/admin' : u.role === 'teacher' ? '/teacher' : '/student';
        navigate(dest);
      } else {
        if (!form.name.trim()) { setError('El nombre es requerido'); setLoading(false); return; }
        await register(form.username, form.password, form.name, null);
        navigate('/teacher');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/facu.png" alt="BUAP" className="h-20 w-20 object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">TutorMat</h1>
          <p className="text-gray-500 text-sm">Sistema Adaptativo de Trigonometría · BUAP</p>
        </div>

        <div className="card shadow-xl">
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <TabBtn active={mode === 'login'} onClick={() => { setMode('login'); setError(''); }}>
              Iniciar sesión
            </TabBtn>
            <TabBtn active={mode === 'register-teacher'} onClick={() => { setMode('register-teacher'); setError(''); }}>
              Soy docente
            </TabBtn>
          </div>

          {mode === 'login' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-sm text-blue-700">
              <strong>Estudiantes:</strong> tu usuario y contraseña te los proporciona tu docente.
            </div>
          )}

          {mode === 'register-teacher' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
              Crea tu cuenta de docente para gestionar grupos y estudiantes.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'register-teacher' ? 'Nombre de usuario (para login)' : 'Usuario / Matrícula'}
              </label>
              <input type="text" name="username" value={form.username} onChange={handleChange}
                required placeholder={mode === 'login' ? 'Tu usuario o matrícula' : 'Ej: prof_garcia'}
                className="input-field" />
            </div>

            {mode === 'register-teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  required placeholder="Tu nombre completo" className="input-field" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                required minLength={4} placeholder="••••••••" className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-medium text-base">
              {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta de docente'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Administradores: inicia sesión con tus credenciales de admin.
        </p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
        active ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
      }`}>
      {children}
    </button>
  );
}
