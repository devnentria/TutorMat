import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const CATEGORIES = [
  { name: 'Ángulos', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Funciones trigonométricas', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Suma y resta', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Identidades Trigonométricas', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Funciones de números reales', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Gráficas Trigonométricas', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Ecuaciones Trigonométricas', color: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Adaptativo e Inteligente',
    desc: 'El sistema selecciona preguntas según tu nivel de habilidad actual usando el modelo TRI de 3 parámetros.',
  },
  {
    icon: '📊',
    title: 'Análisis Detallado',
    desc: 'Obtén estadísticas por categoría, tu nivel estimado y recomendaciones personalizadas.',
  },
  {
    icon: '🧮',
    title: 'Notación Matemática',
    desc: 'Todas las preguntas con fórmulas trigonométricas renderizadas con KaTeX de alta calidad.',
  },
  {
    icon: '🤖',
    title: 'Asistente IA',
    desc: 'Pide pistas en tiempo real alimentadas por GPT para orientarte sin darte la respuesta directa.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sistema de Evaluación Adaptativa<br />de Trigonometría
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Una experiencia de evaluación personalizada basada en la
            Teoría de Respuesta al Ítem (TRI). Cada pregunta se adapta
            a tu nivel de conocimiento en tiempo real.
          </p>
          {user ? (
            <Link to={user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/admin'}
              className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Iniciar Evaluación
            </Link>
          ) : (
            <Link to="/login"
              className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Comenzar
            </Link>
          )}
        </div>
      </section>

      {/* Características */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Características del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step num="1" title="Registro">
              Ingresa con tu matrícula y nombre. El sistema crea tu perfil automáticamente.
            </Step>
            <Step num="2" title="Evaluación Adaptativa">
              Responde preguntas que se ajustan a tu nivel. El algoritmo TRI estima tu habilidad con cada respuesta.
            </Step>
            <Step num="3" title="Resultados">
              Al finalizar recibe tu nivel, estadísticas por tema y recomendaciones de estudio personalizadas.
            </Step>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Temas Evaluados</h2>
          <p className="text-center text-gray-600 mb-10">
            Más de 268 preguntas distribuidas en 7 categorías y 4 niveles de dificultad.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}
                className={`border rounded-xl p-4 ${cat.color} font-medium text-sm`}>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">TutorMat</h2>
            <p className="text-gray-400 text-sm">Sistema de Evaluación Adaptativa de Trigonometría</p>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TutorMat. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({ num, title, children }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {num}
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{children}</p>
    </div>
  );
}
