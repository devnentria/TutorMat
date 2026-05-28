import React from 'react';

/**
 * Figuras SVG para preguntas de trigonometría que requieren imágenes
 */

// Triángulo rectángulo genérico con lados a, b, c y ángulo θ
function TriangleGeneric() {
  return (
    <svg viewBox="0 0 200 180" className="w-48 h-44 mx-auto" aria-label="Triángulo rectángulo con ángulo θ">
      {/* Triángulo */}
      <polygon points="20,150 160,150 160,30" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
      {/* Ángulo recto */}
      <rect x="145" y="135" width="15" height="15" fill="none" stroke="#2563EB" strokeWidth="1.5" />
      {/* Etiquetas de lados */}
      <text x="90" y="168" textAnchor="middle" fontSize="14" fill="#1E40AF" fontStyle="italic">a</text>
      <text x="168" y="95" textAnchor="middle" fontSize="14" fill="#1E40AF" fontStyle="italic">b</text>
      <text x="80" y="95" textAnchor="middle" fontSize="14" fill="#1E40AF" fontStyle="italic">c</text>
      {/* Ángulo θ */}
      <path d="M 45,150 A 25,25 0 0,0 39,130" fill="none" stroke="#DC2626" strokeWidth="1.5" />
      <text x="52" y="143" fontSize="13" fill="#DC2626" fontStyle="italic">θ</text>
    </svg>
  );
}

// Triángulo 3-4-5
function Triangle345() {
  return (
    <svg viewBox="0 0 200 180" className="w-48 h-44 mx-auto" aria-label="Triángulo rectángulo 3-4-5">
      <polygon points="20,150 140,150 140,30" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2" />
      <rect x="125" y="135" width="15" height="15" fill="none" stroke="#16A34A" strokeWidth="1.5" />
      <text x="80" y="168" textAnchor="middle" fontSize="14" fill="#15803D" fontWeight="bold">4</text>
      <text x="148" y="97" textAnchor="middle" fontSize="14" fill="#15803D" fontWeight="bold">3</text>
      <text x="70" y="90" textAnchor="middle" fontSize="14" fill="#15803D" fontWeight="bold">5</text>
      <path d="M 42,150 A 22,22 0 0,0 36,131" fill="none" stroke="#DC2626" strokeWidth="1.5" />
      <text x="50" y="142" fontSize="13" fill="#DC2626" fontStyle="italic">θ</text>
    </svg>
  );
}

// Triángulo 8-15-17
function Triangle81517() {
  return (
    <svg viewBox="0 0 220 200" className="w-52 h-48 mx-auto" aria-label="Triángulo rectángulo 8-15-17">
      <polygon points="20,170 180,170 180,50" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" />
      <rect x="165" y="155" width="15" height="15" fill="none" stroke="#EA580C" strokeWidth="1.5" />
      <text x="100" y="188" textAnchor="middle" fontSize="14" fill="#C2410C" fontWeight="bold">15</text>
      <text x="190" y="115" textAnchor="middle" fontSize="14" fill="#C2410C" fontWeight="bold">8</text>
      <text x="90" y="105" textAnchor="middle" fontSize="14" fill="#C2410C" fontWeight="bold">17</text>
      <path d="M 45,170 A 25,25 0 0,0 39,148" fill="none" stroke="#DC2626" strokeWidth="1.5" />
      <text x="55" y="162" fontSize="13" fill="#DC2626" fontStyle="italic">θ</text>
    </svg>
  );
}

// Triángulo 5-12-13
function Triangle51213() {
  return (
    <svg viewBox="0 0 220 200" className="w-52 h-48 mx-auto" aria-label="Triángulo rectángulo 5-12-13">
      <polygon points="20,170 170,170 170,50" fill="#FAF5FF" stroke="#9333EA" strokeWidth="2" />
      <rect x="155" y="155" width="15" height="15" fill="none" stroke="#9333EA" strokeWidth="1.5" />
      <text x="95" y="188" textAnchor="middle" fontSize="14" fill="#7E22CE" fontWeight="bold">12</text>
      <text x="178" y="115" textAnchor="middle" fontSize="14" fill="#7E22CE" fontWeight="bold">5</text>
      <text x="85" y="105" textAnchor="middle" fontSize="14" fill="#7E22CE" fontWeight="bold">13</text>
      <path d="M 43,170 A 23,23 0 0,0 37,149" fill="none" stroke="#DC2626" strokeWidth="1.5" />
      <text x="51" y="162" fontSize="13" fill="#DC2626" fontStyle="italic">θ</text>
    </svg>
  );
}

/**
 * Componente principal que elige la figura correcta según el tipo
 */
export default function TriangleFigure({ imageType }) {
  const figures = {
    'triangle-generic': <TriangleGeneric />,
    'triangle-3-4-5': <Triangle345 />,
    'triangle-8-15-17': <Triangle81517 />,
    'triangle-5-12-13': <Triangle51213 />,
  };

  const Figure = figures[imageType] || figures['triangle-generic'];

  return (
    <div className="my-4 flex flex-col items-center">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm inline-block">
        {Figure}
      </div>
      <p className="text-xs text-gray-400 mt-2">Figura de referencia</p>
    </div>
  );
}
