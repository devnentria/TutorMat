import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Home from './components/Home';
import Login from './components/Login';
import EvaluationApp from './components/Evaluation/EvaluationApp';
import Results from './components/Evaluation/Results';
import Dashboard from './components/Admin/Dashboard';
import StudentList from './components/Admin/StudentList';
import StudentDetail from './components/Admin/StudentDetail';
import TeachersList from './components/Admin/TeachersList';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import GroupDetail from './components/Teacher/GroupDetail';
import GroupStats from './components/Teacher/GroupStats';
import StudentHome from './components/Student/StudentHome';
import StudentProfile from './components/Student/StudentProfile';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Spinner() {
  return <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (user.role === 'admin') return <Navigate to="/teacher" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  // Asegurar que dark mode solo aplica a estudiantes
  useEffect(() => {
    if (user && user.role !== 'student') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tutormat_theme', 'light');
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Estudiante */}
      <Route path="/student" element={
        <ProtectedRoute roles={['student']}><StudentHome /></ProtectedRoute>
      } />
      <Route path="/student/profile" element={
        <ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>
      } />
      <Route path="/evaluation/:sessionId" element={
        <ProtectedRoute roles={['student']}><EvaluationApp /></ProtectedRoute>
      } />
      {/* Ruta sin sessionId (evaluación libre, sin actividad) */}
      <Route path="/evaluation" element={
        <ProtectedRoute roles={['student']}><EvaluationApp /></ProtectedRoute>
      } />
      <Route path="/results/:sessionId" element={
        <ProtectedRoute roles={['student']}><Results /></ProtectedRoute>
      } />

      {/* Docente */}
      <Route path="/teacher" element={
        <ProtectedRoute roles={['teacher', 'admin']}><TeacherDashboard /></ProtectedRoute>
      } />
      <Route path="/teacher/groups/:groupId" element={
        <ProtectedRoute roles={['teacher', 'admin']}><GroupDetail /></ProtectedRoute>
      } />
      <Route path="/teacher/groups/:groupId/stats" element={
        <ProtectedRoute roles={['teacher', 'admin']}><GroupStats /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>
      } />
      <Route path="/admin/teachers" element={
        <ProtectedRoute roles={['admin']}><TeachersList /></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute roles={['admin']}><StudentList /></ProtectedRoute>
      } />
      <Route path="/admin/students/:id" element={
        <ProtectedRoute roles={['admin']}><StudentDetail /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
