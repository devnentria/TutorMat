import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-700 dark:bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.role === 'student' ? '/student' : '/'} className="flex items-center gap-3">
              <img
                src="/facu.png"
                alt="FCFM BUAP"
                className="h-11 w-11 object-contain rounded-md bg-white p-0.5"
                style={{ imageRendering: 'auto' }}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg leading-none">TutorMat</span>
                <span className="text-blue-200 dark:text-gray-400 text-xs leading-none mt-0.5 hidden sm:block">
                  FCFM · BUAP
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'student' && (
              <NavLink to="/student" active={isActive('/student')}>Inicio</NavLink>
            )}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <NavLink to="/teacher" active={location.pathname.startsWith('/teacher')}>Mis Grupos</NavLink>
            )}
            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin" active={isActive('/admin')}>Dashboard</NavLink>
                <NavLink to="/admin/students" active={isActive('/admin/students')}>Estudiantes</NavLink>
              </>
            )}

            {/* Modo oscuro (solo estudiante) */}
            {user?.role === 'student' && (
              <button
                onClick={toggle}
                title={dark ? 'Modo claro' : 'Modo oscuro'}
                className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors">
                {dark ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3 ml-4 border-l border-blue-500 dark:border-gray-700 pl-4">
                {user.role === 'student' ? (
                  <Link to="/student/profile"
                    className="text-blue-200 hover:text-white text-sm transition-colors flex items-center gap-1">
                    <span className="w-6 h-6 bg-blue-500 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {(user.name || user.username)[0].toUpperCase()}
                    </span>
                    <span className="hidden lg:inline">{user.name || user.username}</span>
                  </Link>
                ) : (
                  <span className="text-blue-200 text-sm">
                    {user.name || user.username}
                    {user.role === 'admin' && (
                      <span className="ml-1 text-xs bg-yellow-500 text-yellow-900 px-1.5 py-0.5 rounded">Admin</span>
                    )}
                  </span>
                )}
                <button onClick={handleLogout}
                  className="text-sm text-blue-200 hover:text-white transition-colors">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Ingresar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user?.role === 'student' && (
              <button onClick={toggle}
                className="p-2 rounded-lg text-blue-200 hover:text-white transition-colors">
                {dark ? '☀️' : '🌙'}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 dark:bg-gray-800 px-4 pb-4 space-y-2">
          {user?.role === 'student' && (
            <>
              <MobileNavLink to="/student" onClick={() => setMenuOpen(false)}>Inicio</MobileNavLink>
              <MobileNavLink to="/student/profile" onClick={() => setMenuOpen(false)}>Mi perfil</MobileNavLink>
            </>
          )}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <MobileNavLink to="/teacher" onClick={() => setMenuOpen(false)}>Mis Grupos</MobileNavLink>
          )}
          {user?.role === 'admin' && (
            <>
              <MobileNavLink to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink to="/admin/students" onClick={() => setMenuOpen(false)}>Estudiantes</MobileNavLink>
            </>
          )}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="block w-full text-left text-blue-200 py-2 text-sm">
              Cerrar sesión ({user.name || user.username})
            </button>
          ) : (
            <MobileNavLink to="/login" onClick={() => setMenuOpen(false)}>Ingresar</MobileNavLink>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}
      className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="block text-blue-200 hover:text-white py-2 text-sm">
      {children}
    </Link>
  );
}
