import React from 'react';

/* ─── Escenas del mundo real — ilustraciones contextuales ───────────────── */

function TreeShadow() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      {/* Cielo con gradiente */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect width="220" height="115" fill="url(#sky)" />
      <rect y="115" width="220" height="35" fill="url(#grass)" />

      {/* Sol con halo */}
      <circle cx="185" cy="28" r="18" fill="#fde68a" opacity="0.4" />
      <circle cx="185" cy="28" r="12" fill="#fbbf24" />
      {[0,40,80,120,160,200,240,280,320].map((a, i) => (
        <line key={i}
          x1={185 + 16 * Math.cos(a * Math.PI / 180)}
          y1={28 + 16 * Math.sin(a * Math.PI / 180)}
          x2={185 + 23 * Math.cos(a * Math.PI / 180)}
          y2={28 + 23 * Math.sin(a * Math.PI / 180)}
          stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* Suelo con pasto */}
      {[10,40,70,100,130,160,190].map((x, i) => (
        <line key={i} x1={x} y1="115" x2={x - 3} y2="108" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      ))}

      {/* Tronco del árbol */}
      <rect x="58" y="72" width="12" height="43" rx="2" fill="#92400e" />
      <rect x="60" y="85" width="4" height="30" fill="#78350f" opacity="0.5" />

      {/* Copa del árbol — capas */}
      <ellipse cx="64" cy="72" rx="28" ry="22" fill="#15803d" />
      <ellipse cx="64" cy="60" rx="22" ry="18" fill="#16a34a" />
      <ellipse cx="64" cy="52" rx="15" ry="14" fill="#22c55e" />
      <ellipse cx="58" cy="56" rx="9" ry="8" fill="#4ade80" opacity="0.5" />
      <ellipse cx="70" cy="58" rx="8" ry="7" fill="#4ade80" opacity="0.4" />

      {/* Sombra en el suelo */}
      <ellipse cx="100" cy="117" rx="35" ry="5" fill="#166534" opacity="0.3" />
      <line x1="64" y1="115" x2="148" y2="115" stroke="#166534" strokeWidth="4" strokeLinecap="round" opacity="0.6" />

      {/* Línea punteada: rayos solares */}
      <line x1="64" y1="38" x2="148" y2="115" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.8" />

      {/* Línea vertical del árbol */}
      <line x1="64" y1="38" x2="64" y2="115" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />

      {/* Ángulo θ en la base */}
      <path d="M 148,115 A 28,28 0 0,0 120,99" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="122" y="113" fontSize="13" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Cotas */}
      <text x="95" y="130" fontSize="9" fill="#166534" fontWeight="bold">← sombra →</text>
      <text x="15" y="75" fontSize="9" fill="#92400e" fontWeight="bold">h árbol</text>
      <line x1="48" y1="38" x2="48" y2="115" stroke="#92400e" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="45" y1="38" x2="51" y2="38" stroke="#92400e" strokeWidth="1.5" />
      <line x1="45" y1="115" x2="51" y2="115" stroke="#92400e" strokeWidth="1.5" />
    </svg>
  );
}

function BuildingScene() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>
      <rect width="220" height="125" fill="url(#skyB)" />
      {/* Suelo / calle */}
      <rect y="125" width="220" height="25" fill="#d1d5db" />
      <line x1="0" y1="128" x2="220" y2="128" stroke="#9ca3af" strokeWidth="1" />
      {/* Líneas de la acera */}
      {[20,60,100,140,180].map((x, i) => (
        <line key={i} x1={x} y1="128" x2={x + 15} y2="128" stroke="#e5e7eb" strokeWidth="2" />
      ))}

      {/* Edificio */}
      <rect x="130" y="25" width="72" height="100" fill="#94a3b8" />
      <rect x="130" y="25" width="72" height="6" fill="#64748b" />
      {/* Fachada */}
      <rect x="132" y="31" width="68" height="94" fill="#cbd5e1" opacity="0.4" />
      {/* Ventanas */}
      {[0, 1, 2, 3].map(row => [0, 1, 2].map(col => (
        <rect key={`${row}-${col}`}
          x={136 + col * 21} y={36 + row * 22}
          width="14" height="16" rx="1"
          fill={row === 3 && col === 1 ? '#93c5fd' : '#bfdbfe'}
          stroke="#94a3b8" strokeWidth="0.5" />
      )))}
      {/* Puerta */}
      <rect x="153" y="108" width="16" height="17" rx="1" fill="#93c5fd" stroke="#64748b" strokeWidth="0.5" />
      <circle cx="168" cy="117" r="1.5" fill="#64748b" />
      {/* Antena */}
      <line x1="166" y1="25" x2="166" y2="12" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="166" cy="11" r="2" fill="#ef4444" />

      {/* Persona con instrumento topográfico */}
      <circle cx="30" cy="115" r="7" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <line x1="30" y1="122" x2="30" y2="135" stroke="#374151" strokeWidth="2.5" />
      <line x1="30" y1="126" x2="20" y2="131" stroke="#374151" strokeWidth="2" />
      <line x1="30" y1="126" x2="40" y2="131" stroke="#374151" strokeWidth="2" />
      <line x1="30" y1="135" x2="22" y2="145" stroke="#374151" strokeWidth="2" />
      <line x1="30" y1="135" x2="38" y2="145" stroke="#374151" strokeWidth="2" />
      {/* Teodolito */}
      <circle cx="30" cy="113" r="4" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      <line x1="26" y1="113" x2="34" y2="113" stroke="#3b82f6" strokeWidth="1" />

      {/* Línea de visión al tope */}
      <line x1="30" y1="113" x2="130" y2="25" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Ángulo de elevación */}
      <path d="M 56,115 A 27,27 0 0,1 47,90" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="58" y="111" fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Altura del edificio */}
      <line x1="126" y1="25" x2="126" y2="125" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
      <text x="109" y="78" fontSize="10" fill="#475569" fontWeight="bold">h</text>
      <line x1="123" y1="25" x2="129" y2="25" stroke="#64748b" strokeWidth="1.5" />
      <line x1="123" y1="125" x2="129" y2="125" stroke="#64748b" strokeWidth="1.5" />

      {/* Distancia horizontal */}
      <line x1="30" y1="142" x2="130" y2="142" stroke="#9ca3af" strokeWidth="1" />
      <text x="65" y="150" fontSize="9" fill="#6b7280">distancia (d)</text>
    </svg>
  );
}

function LadderScene() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      {/* Exterior / cielo */}
      <rect width="220" height="150" fill="#fef9c3" />
      {/* Pared */}
      <rect x="148" y="0" width="72" height="130" fill="url(#wallGrad)" />
      {/* Ladrillos */}
      {[0,1,2,3,4,5,6,7].map(row =>
        [0,1,2].map(col => (
          <rect key={`${row}-${col}`}
            x={148 + col * 24 + (row % 2) * 12}
            y={row * 16}
            width="22" height="14"
            fill="none" stroke="#cbd5e1" strokeWidth="0.8" rx="1" />
        ))
      )}
      {/* Suelo */}
      <rect y="130" width="220" height="20" fill="#9ca3af" />
      <rect y="132" width="220" height="5" fill="#78716c" opacity="0.3" />

      {/* Sombra de la escalera */}
      <ellipse cx="100" cy="133" rx="20" ry="4" fill="#6b7280" opacity="0.2" />

      {/* Escalera — rieles */}
      <line x1="52" y1="130" x2="148" y2="22" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      <line x1="63" y1="130" x2="159" y2="22" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      {/* Peldaños */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const t = i / 6;
        return (
          <line key={i}
            x1={52 + t * (148 - 52)}
            y1={130 + t * (22 - 130)}
            x2={63 + t * (159 - 63)}
            y2={130 + t * (22 - 130)}
            stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        );
      })}
      {/* Zapatas antideslizantes */}
      <ellipse cx="55" cy="131" rx="5" ry="3" fill="#374151" />
      <ellipse cx="65" cy="131" rx="5" ry="3" fill="#374151" />

      {/* Persona en la escalera */}
      <circle cx="124" cy="53" r="7" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <line x1="124" y1="60" x2="118" y2="78" stroke="#374151" strokeWidth="2.5" />
      <line x1="121" y1="66" x2="112" y2="68" stroke="#374151" strokeWidth="2" />
      <line x1="121" y1="66" x2="128" y2="62" stroke="#374151" strokeWidth="2" />

      {/* Ángulo en la base */}
      <path d="M 78,130 A 26,26 0 0,1 66,107" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="80" y="125" fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Cotas */}
      <line x1="52" y1="130" x2="148" y2="130" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x="88" y="143" fontSize="9" fill="#374151" fontWeight="bold">base (b)</text>
      <line x1="162" y1="22" x2="162" y2="130" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x="165" y="82" fontSize="9" fill="#374151" fontWeight="bold">h</text>
      <line x1="158" y1="22" x2="166" y2="22" stroke="#6b7280" strokeWidth="1.5" />
      <line x1="158" y1="130" x2="166" y2="130" stroke="#6b7280" strokeWidth="1.5" />
    </svg>
  );
}

function RampScene() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
      </defs>
      <rect width="220" height="150" fill="url(#skyR)" />
      {/* Montañas de fondo */}
      <polygon points="0,90 60,45 120,90" fill="#d1fae5" opacity="0.7" />
      <polygon points="80,90 155,35 220,90" fill="#a7f3d0" opacity="0.5" />

      {/* Suelo */}
      <rect y="115" width="220" height="35" fill="url(#road)" />
      <line x1="0" y1="118" x2="220" y2="118" stroke="#9ca3af" strokeWidth="1" />

      {/* Rampa sólida */}
      <polygon points="15,115 175,115 175,50" fill="#94a3b8" />
      <polygon points="15,115 175,115 175,50" fill="none" stroke="#475569" strokeWidth="2" />
      {/* Superficie de la rampa — asfalto */}
      <line x1="15" y1="115" x2="175" y2="50" stroke="#374151" strokeWidth="4" />
      {/* Marcas viales en la rampa */}
      {[0.3, 0.55, 0.75].map((t, i) => (
        <line key={i}
          x1={15 + t * 160 - 5} y1={115 + t * (50 - 115) - 3}
          x2={15 + t * 160 + 5} y2={115 + t * (50 - 115) + 3}
          stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* Barrera lateral de la rampa */}
      <line x1="175" y1="50" x2="175" y2="115" stroke="#6b7280" strokeWidth="2.5" />

      {/* Auto — carrocería */}
      <g transform="rotate(-20, 105, 83)">
        <rect x="85" y="82" width="46" height="20" rx="4" fill="#3b82f6" />
        <rect x="90" y="74" width="32" height="14" rx="3" fill="#60a5fa" />
        {/* Ventanas */}
        <rect x="92" y="76" width="12" height="10" rx="1" fill="#bfdbfe" opacity="0.8" />
        <rect x="106" y="76" width="12" height="10" rx="1" fill="#bfdbfe" opacity="0.8" />
        {/* Faros */}
        <circle cx="131" cy="91" r="3" fill="#fde68a" />
        <circle cx="87" cy="91" r="2.5" fill="#f87171" />
        {/* Ruedas */}
        <circle cx="95" cy="103" r="7" fill="#1f2937" />
        <circle cx="95" cy="103" r="4" fill="#374151" />
        <circle cx="120" cy="103" r="7" fill="#1f2937" />
        <circle cx="120" cy="103" r="4" fill="#374151" />
      </g>

      {/* Ángulo de inclinación */}
      <path d="M 44,115 A 30,30 0 0,1 34,90" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="46" y="111" fontSize="13" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Cota altura */}
      <line x1="179" y1="50" x2="179" y2="115" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="3,2" />
      <text x="183" y="88" fontSize="10" fill="#374151" fontWeight="bold">h</text>
      <line x1="176" y1="50" x2="182" y2="50" stroke="#6b7280" strokeWidth="1.5" />
      <line x1="176" y1="115" x2="182" y2="115" stroke="#6b7280" strokeWidth="1.5" />

      {/* Cota base */}
      <text x="80" y="130" fontSize="9" fill="#374151" fontWeight="bold">longitud de la rampa</text>
    </svg>
  );
}

function MountainScene() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="skyM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>
      <rect width="220" height="150" fill="url(#skyM)" />

      {/* Nubes */}
      <ellipse cx="40" cy="22" rx="20" ry="10" fill="white" opacity="0.9" />
      <ellipse cx="54" cy="18" rx="15" ry="9" fill="white" opacity="0.9" />
      <ellipse cx="28" cy="20" rx="12" ry="7" fill="white" opacity="0.9" />
      <ellipse cx="155" cy="30" rx="18" ry="8" fill="white" opacity="0.7" />
      <ellipse cx="170" cy="27" rx="12" ry="7" fill="white" opacity="0.7" />

      {/* Montaña de fondo */}
      <polygon points="60,115 140,18 220,115" fill="#9ca3af" />
      <polygon points="80,115 140,18 200,115" fill="#6b7280" />
      {/* Nieve */}
      <polygon points="128,28 140,18 152,28 140,40" fill="white" />
      <polygon points="133,32 140,24 147,32" fill="white" opacity="0.7" />
      {/* Árboles en la ladera */}
      {[95,108,118].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="115" x2={x} y2={108 - i * 2} stroke="#166534" strokeWidth="2" />
          <polygon points={`${x},${100 - i * 2} ${x - 5},${110 - i * 2} ${x + 5},${110 - i * 2}`} fill="#16a34a" />
        </g>
      ))}

      {/* Suelo / pradera */}
      <rect y="115" width="220" height="35" fill="#86efac" />
      <ellipse cx="110" cy="115" rx="110" ry="8" fill="#4ade80" opacity="0.4" />

      {/* Persona con binoculares / teodolito */}
      <circle cx="20" cy="108" r="6" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <line x1="20" y1="114" x2="20" y2="125" stroke="#374151" strokeWidth="2" />
      <line x1="20" y1="118" x2="13" y2="123" stroke="#374151" strokeWidth="1.8" />
      <line x1="20" y1="118" x2="27" y2="123" stroke="#374151" strokeWidth="1.8" />
      <line x1="20" y1="125" x2="14" y2="133" stroke="#374151" strokeWidth="1.8" />
      <line x1="20" y1="125" x2="26" y2="133" stroke="#374151" strokeWidth="1.8" />
      {/* Instrumento */}
      <rect x="16" y="104" width="8" height="5" rx="1" fill="#3b82f6" />

      {/* Línea de visión al pico */}
      <line x1="20" y1="106" x2="140" y2="18" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Línea horizontal de referencia */}
      <line x1="20" y1="115" x2="140" y2="115" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />

      {/* Ángulo de elevación */}
      <path d="M 46,115 A 28,28 0 0,1 38,92" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="48" y="111" fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Cota altura */}
      <text x="142" y="70" fontSize="10" fill="#475569" fontWeight="bold">h</text>
    </svg>
  );
}

function NavigationScene() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      <rect width="220" height="95" fill="url(#skyN)" />
      <rect y="95" width="220" height="55" fill="url(#sea)" />

      {/* Horizonte */}
      <line x1="0" y1="95" x2="220" y2="95" stroke="#0ea5e9" strokeWidth="1" />

      {/* Nubes */}
      <ellipse cx="60" cy="20" rx="22" ry="9" fill="white" opacity="0.85" />
      <ellipse cx="76" cy="16" rx="16" ry="8" fill="white" opacity="0.85" />

      {/* Olas */}
      {[10, 50, 95, 140, 175].map((x, i) => (
        <path key={i} d={`M ${x},${100 + i % 2 * 5} Q ${x + 10},${94 + i % 2 * 5} ${x + 20},${100 + i % 2 * 5}`}
          fill="none" stroke="#7dd3fc" strokeWidth="2.5" opacity="0.7" />
      ))}

      {/* Barco — casco */}
      <polygon points="15,95 65,95 60,83 20,83" fill="#92400e" />
      <rect x="18" y="75" width="40" height="10" rx="2" fill="#78350f" />
      {/* Ventanillas del barco */}
      {[22, 32, 42, 52].map((x, i) => (
        <circle key={i} cx={x} cy="80" r="3" fill="#bfdbfe" />
      ))}
      {/* Mástil */}
      <line x1="37" y1="75" x2="37" y2="52" stroke="#451a03" strokeWidth="3" />
      <polygon points="37,52 55,62 37,68" fill="#fbbf24" />
      {/* Bandera */}
      <rect x="37" y="50" width="16" height="10" rx="1" fill="#ef4444" />

      {/* Faro — isla rocosa */}
      <ellipse cx="178" cy="96" rx="25" ry="8" fill="#6b7280" />
      <polygon points="158,96 198,96 188,75 168,75" fill="#78716c" />
      {/* Torre del faro */}
      <rect x="170" y="38" width="16" height="37" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
      {/* Rayas del faro */}
      <rect x="170" y="48" width="16" height="5" fill="#ef4444" opacity="0.7" />
      <rect x="170" y="62" width="16" height="5" fill="#ef4444" opacity="0.7" />
      {/* Cabina del faro */}
      <rect x="167" y="30" width="22" height="10" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
      <polygon points="163,30 205,30 184,18" fill="#94a3b8" />
      {/* Luz del faro */}
      <circle cx="178" cy="35" r="5" fill="#fde68a" />
      <circle cx="178" cy="35" r="9" fill="#fde68a" opacity="0.3" />

      {/* Línea de visión barco→faro */}
      <line x1="37" y1="83" x2="170" y2="35" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Ángulo de elevación */}
      <path d="M 65,83 A 28,28 0 0,1 55,62" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="67" y="80" fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Línea horizontal */}
      <line x1="37" y1="83" x2="170" y2="83" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />
      <text x="90" y="80" fontSize="9" fill="#6b7280">distancia</text>
    </svg>
  );
}

function WaveScene() {
  const pts = Array.from({ length: 80 }, (_, i) => {
    const x = 15 + i * 2.4;
    const y = 72 - 28 * Math.sin((i / 80) * 2 * Math.PI * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <rect width="220" height="150" fill="#f0fdf4" />
      {/* Zona de la onda */}
      <rect x="10" y="10" width="200" height="130" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Ejes */}
      <line x1="15" y1="72" x2="205" y2="72" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="15" y1="15" x2="15" y2="130" stroke="#9ca3af" strokeWidth="1.5" />
      <polygon points="205,72 198,69 198,75" fill="#9ca3af" />
      <polygon points="15,15 12,22 18,22" fill="#9ca3af" />
      <text x="200" y="86" fontSize="9" fill="#6b7280">t</text>
      <text x="19" y="19" fontSize="9" fill="#6b7280">y</text>

      {/* Cuadrícula ligera */}
      {[40, 65, 90, 115, 140, 165, 190].map((x, i) => (
        <line key={i} x1={x} y1="15" x2={x} y2="130" stroke="#f1f5f9" strokeWidth="1" />
      ))}

      {/* Onda senoidal */}
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      {/* Sombra debajo */}
      <polyline points={`15,72 ${pts} 207,72`} fill="#dbeafe" opacity="0.3" />

      {/* Amplitud */}
      <line x1="58" y1="44" x2="58" y2="72" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
      <line x1="54" y1="44" x2="62" y2="44" stroke="#ef4444" strokeWidth="1.5" />
      <text x="62" y="62" fontSize="10" fill="#ef4444" fontWeight="bold">A</text>

      {/* Período */}
      <line x1="15" y1="128" x2="111" y2="128" stroke="#a855f7" strokeWidth="2" />
      <line x1="15" y1="124" x2="15" y2="132" stroke="#a855f7" strokeWidth="1.5" />
      <line x1="111" y1="124" x2="111" y2="132" stroke="#a855f7" strokeWidth="1.5" />
      <text x="45" y="142" fontSize="9" fill="#a855f7" fontWeight="bold">T (período)</text>

      {/* Ángulo en el origen */}
      <path d="M 30,72 A 14,14 0 0,1 24,59" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
      <text x="32" y="69" fontSize="11" fill="#f59e0b" fontWeight="bold">θ</text>

      {/* Etiqueta función */}
      <text x="125" y="30" fontSize="10" fill="#3b82f6" fontWeight="bold">y = A·sen(θ)</text>
    </svg>
  );
}

function BridgeScene() {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="skyBr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect width="220" height="150" fill="url(#skyBr)" />
      {/* Río */}
      <rect y="105" width="220" height="45" fill="url(#water)" />
      {/* Olas */}
      {[15, 55, 95, 135, 175].map((x, i) => (
        <path key={i} d={`M ${x},112 Q ${x + 8},107 ${x + 16},112`}
          fill="none" stroke="#7dd3fc" strokeWidth="2" opacity="0.7" />
      ))}

      {/* Tablero del puente */}
      <rect x="5" y="98" width="210" height="9" fill="#78716c" />
      <rect x="5" y="98" width="210" height="2" fill="#a8a29e" />
      {/* Líneas de carretera */}
      {[30, 70, 110, 150, 190].map((x, i) => (
        <line key={i} x1={x} y1="102" x2={x + 15} y2="102" stroke="#fbbf24" strokeWidth="1.5" />
      ))}

      {/* Torres del puente */}
      <rect x="62" y="28" width="14" height="78" fill="#64748b" />
      <rect x="64" y="28" width="10" height="78" fill="#6b7280" />
      {/* Cima de la torre */}
      <rect x="58" y="22" width="22" height="8" rx="2" fill="#475569" />
      <line x1="69" y1="14" x2="69" y2="22" stroke="#374151" strokeWidth="2.5" />
      <circle cx="69" cy="13" r="3" fill="#ef4444" />

      <rect x="144" y="28" width="14" height="78" fill="#64748b" />
      <rect x="146" y="28" width="10" height="78" fill="#6b7280" />
      <rect x="140" y="22" width="22" height="8" rx="2" fill="#475569" />
      <line x1="151" y1="14" x2="151" y2="22" stroke="#374151" strokeWidth="2.5" />
      <circle cx="151" cy="13" r="3" fill="#ef4444" />

      {/* Cable principal */}
      <path d="M 5,98 Q 110,40 215,98" fill="none" stroke="#374151" strokeWidth="3" />

      {/* Cables verticales */}
      {[25, 50, 75, 110, 145, 170, 195].map((x, i) => {
        const t = (x - 5) / 210;
        const y = 98 - 58 * Math.sin(t * Math.PI);
        return <line key={i} x1={x} y1={98} x2={x} y2={y} stroke="#6b7280" strokeWidth="1.2" />;
      })}

      {/* Ángulo en la torre */}
      <path d="M 76,98 A 22,22 0 0,1 63,78" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="78" y="94" fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>
    </svg>
  );
}

function UnitCircleScene() {
  const theta = Math.PI / 4;
  const cx = 110, cy = 75, r = 52;
  const px = cx + r * Math.cos(-theta);
  const py = cy + r * Math.sin(-theta);

  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <rect width="220" height="150" fill="#faf5ff" />
      <rect x="5" y="5" width="210" height="140" rx="6" fill="white" stroke="#f3e8ff" strokeWidth="1" />

      {/* Cuadrícula */}
      {[-r, -r/2, 0, r/2, r].map((d, i) => (
        <g key={i}>
          <line x1={cx + d} y1={cy - r - 5} x2={cx + d} y2={cy + r + 5} stroke="#f3e8ff" strokeWidth="1" />
          <line x1={cx - r - 5} y1={cy + d} x2={cx + r + 5} y2={cy + d} stroke="#f3e8ff" strokeWidth="1" />
        </g>
      ))}

      {/* Ejes */}
      <line x1={cx - r - 10} y1={cy} x2={cx + r + 15} y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="#9ca3af" strokeWidth="1.5" />
      <polygon points={`${cx+r+15},${cy} ${cx+r+8},${cy-3} ${cx+r+8},${cy+3}`} fill="#9ca3af" />
      <polygon points={`${cx},${cy-r-10} ${cx-3},${cy-r-3} ${cx+3},${cy-r-3}`} fill="#9ca3af" />
      <text x={cx + r + 8} y={cy + 12} fontSize="9" fill="#6b7280">x</text>
      <text x={cx + 4} y={cy - r - 4} fontSize="9" fill="#6b7280">y</text>

      {/* Marcas en los ejes */}
      {[-1, 1].map((v, i) => (
        <g key={i}>
          <line x1={cx + v * r} y1={cy - 3} x2={cx + v * r} y2={cy + 3} stroke="#9ca3af" strokeWidth="1.5" />
          <text x={cx + v * r - 3} y={cy + 12} fontSize="8" fill="#9ca3af">{v}</text>
          <line x1={cx - 3} y1={cy - v * r} x2={cx + 3} y2={cy - v * r} stroke="#9ca3af" strokeWidth="1.5" />
          <text x={cx + 5} y={cy - v * r + 3} fontSize="8" fill="#9ca3af">{v}</text>
        </g>
      ))}

      {/* Círculo unitario */}
      <circle cx={cx} cy={cy} r={r} fill="#faf5ff" stroke="#a855f7" strokeWidth="2" />

      {/* Arco del ángulo */}
      <path d={`M ${cx + 20},${cy} A 20,20 0 0,0 ${cx + 20 * Math.cos(-theta)},${cy + 20 * Math.sin(-theta)}`}
        fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x={cx + 22} y={cy - 6} fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Radio */}
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="#3b82f6" strokeWidth="2.5" />
      <text x={cx - 18} y={cy - 22} fontSize="9" fill="#3b82f6" fontWeight="bold">r = 1</text>

      {/* Proyecciones */}
      <line x1={px} y1={py} x2={px} y2={cy} stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />
      <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" />

      {/* Punto */}
      <circle cx={px} cy={py} r="5" fill="#ef4444" stroke="white" strokeWidth="1.5" />
      <text x={px + 6} y={py - 3} fontSize="9" fill="#ef4444" fontWeight="bold">P(cos θ, sen θ)</text>

      {/* Etiquetas */}
      <text x={px + 4} y={(cy + py) / 2} fontSize="9" fill="#10b981" fontWeight="bold">sen θ</text>
      <text x={(cx + px) / 2 - 8} y={cy + 14} fontSize="9" fill="#f59e0b" fontWeight="bold">cos θ</text>
    </svg>
  );
}

function DefaultTriangle() {
  // Escena genérica: topógrafo midiendo terreno
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <defs>
        <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>
      <rect width="220" height="150" fill="url(#skyD)" />
      {/* Suelo */}
      <rect y="118" width="220" height="32" fill="#86efac" />
      <ellipse cx="110" cy="118" rx="110" ry="5" fill="#4ade80" opacity="0.3" />
      {/* Pasto */}
      {[15,35,55,75,100,125,150,175,200].map((x, i) => (
        <line key={i} x1={x} y1="118" x2={x - 2} y2="113" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      ))}

      {/* Poste / señal vertical */}
      <rect x="170" y="52" width="6" height="66" fill="#6b7280" />
      <polygon points="167,52 179,52 173,38" fill="#ef4444" />
      {/* Anillas del poste */}
      <line x1="168" y1="65" x2="178" y2="65" stroke="#9ca3af" strokeWidth="2" />
      <line x1="168" y1="80" x2="178" y2="80" stroke="#9ca3af" strokeWidth="2" />

      {/* Topógrafo con teodolito */}
      <circle cx="25" cy="110" r="6.5" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <line x1="25" y1="116" x2="25" y2="128" stroke="#374151" strokeWidth="2.5" />
      <line x1="25" y1="120" x2="16" y2="125" stroke="#374151" strokeWidth="2" />
      <line x1="25" y1="120" x2="34" y2="125" stroke="#374151" strokeWidth="2" />
      <line x1="25" y1="128" x2="18" y2="138" stroke="#374151" strokeWidth="2" />
      <line x1="25" y1="128" x2="32" y2="138" stroke="#374151" strokeWidth="2" />
      {/* Teodolito */}
      <rect x="20" y="105" width="10" height="6" rx="1" fill="#3b82f6" />
      <circle cx="25" cy="107" r="3.5" fill="none" stroke="#93c5fd" strokeWidth="1.5" />

      {/* Línea punteada al poste */}
      <line x1="25" y1="107" x2="170" y2="52" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Línea horizontal base */}
      <line x1="25" y1="118" x2="173" y2="118" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2" />

      {/* Línea vertical del poste */}
      <line x1="173" y1="52" x2="173" y2="118" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />

      {/* Ángulo de elevación */}
      <path d="M 52,118 A 28,28 0 0,1 43,94" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="54" y="114" fontSize="13" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Ángulo recto */}
      <rect x="166" y="111" width="7" height="7" fill="none" stroke="#6b7280" strokeWidth="1.5" />

      {/* Cotas */}
      <text x="85" y="132" fontSize="9" fill="#374151" fontWeight="bold">distancia (adj)</text>
      <text x="176" y="88" fontSize="9" fill="#374151" fontWeight="bold">altura (op)</text>
    </svg>
  );
}

/* ─── Diagrama matemático ────────────────────────────────────────────────── */

function MathDiagram({ scene }) {
  if (scene === 'wave') {
    return (
      <svg viewBox="0 0 220 150" className="w-full h-full">
        <rect width="220" height="150" fill="white" />
        <text x="110" y="22" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="bold">Función trigonométrica</text>
        <line x1="15" y1="28" x2="205" y2="28" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="30" y="38" width="160" height="25" rx="4" fill="#dbeafe" />
        <text x="110" y="56" textAnchor="middle" fontSize="13" fill="#1d4ed8" fontWeight="bold">f(x) = A·sen(ωx + φ)</text>
        <text x="110" y="88" textAnchor="middle" fontSize="10" fill="#374151">A = amplitud (máx. desplazamiento)</text>
        <text x="110" y="104" textAnchor="middle" fontSize="10" fill="#374151">ω = frecuencia angular</text>
        <text x="110" y="118" textAnchor="middle" fontSize="10" fill="#374151">T = 2π / ω  (período)</text>
        <text x="110" y="134" textAnchor="middle" fontSize="10" fill="#374151">φ = desfase inicial</text>
      </svg>
    );
  }

  if (scene === 'unit_circle') {
    return (
      <svg viewBox="0 0 220 150" className="w-full h-full">
        <rect width="220" height="150" fill="white" />
        <text x="110" y="22" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="bold">Identidades del círculo unitario</text>
        <line x1="15" y1="28" x2="205" y2="28" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="30" y="35" width="160" height="22" rx="4" fill="#f3e8ff" />
        <text x="110" y="51" textAnchor="middle" fontSize="13" fill="#7c3aed" fontWeight="bold">sen²θ + cos²θ = 1</text>
        <text x="110" y="76" textAnchor="middle" fontSize="11" fill="#374151">sen θ = y / r</text>
        <text x="110" y="93" textAnchor="middle" fontSize="11" fill="#374151">cos θ = x / r</text>
        <text x="110" y="110" textAnchor="middle" fontSize="11" fill="#374151">tan θ = sen θ / cos θ</text>
        <text x="110" y="130" textAnchor="middle" fontSize="9" fill="#9ca3af">r = 1  →  sen θ = y ,  cos θ = x</text>
      </svg>
    );
  }

  // Triángulo rectángulo genérico con razones trigonométricas
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      <rect width="220" height="150" fill="white" />
      <text x="110" y="16" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="bold">Modelo matemático</text>

      {/* Triángulo */}
      <polygon points="22,120 158,120 158,30" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
      {/* Ángulo recto */}
      <polyline points="147,120 147,109 158,109" fill="none" stroke="#6b7280" strokeWidth="1.5" />
      {/* Ángulo θ */}
      <path d="M 46,120 A 23,23 0 0,1 40,99" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="48" y="115" fontSize="12" fill="#ef4444" fontWeight="bold">θ</text>

      {/* Lados */}
      <text x="82" y="134" fontSize="10" fill="#374151" fontWeight="bold">adyacente</text>
      <text x="161" y="82" fontSize="10" fill="#374151" fontWeight="bold">opuesto</text>
      <text x="56" y="63" fontSize="10" fill="#3b82f6" fontWeight="bold" transform="rotate(-36,95,80)">hipotenusa</text>

      {/* Recuadro de fórmulas */}
      <rect x="5" y="24" width="62" height="42" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
      <text x="36" y="36" textAnchor="middle" fontSize="8.5" fill="#16a34a" fontWeight="bold">sen θ = op/hip</text>
      <text x="36" y="49" textAnchor="middle" fontSize="8.5" fill="#16a34a" fontWeight="bold">cos θ = ad/hip</text>
      <text x="36" y="62" textAnchor="middle" fontSize="8.5" fill="#16a34a" fontWeight="bold">tan θ = op/ad</text>
    </svg>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */

const SCENES = {
  tree_shadow: TreeShadow,
  building: BuildingScene,
  ladder: LadderScene,
  ramp: RampScene,
  mountain: MountainScene,
  navigation: NavigationScene,
  wave: WaveScene,
  bridge: BridgeScene,
  unit_circle: UnitCircleScene,
  default: DefaultTriangle,
};

export default function FeedbackIllustration({ scene = 'default' }) {
  const Component = SCENES[scene] || SCENES.default;

  return (
    <div className="grid grid-cols-2 gap-2 my-3">
      <div className="rounded-xl overflow-hidden border border-indigo-100 bg-white shadow-sm">
        <p className="text-center text-xs font-semibold text-indigo-500 py-1 bg-indigo-50 border-b border-indigo-100">
          Situación real
        </p>
        <div className="p-1 h-40">
          <Component />
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-blue-100 bg-white shadow-sm">
        <p className="text-center text-xs font-semibold text-blue-500 py-1 bg-blue-50 border-b border-blue-100">
          Modelo matemático
        </p>
        <div className="p-1 h-40">
          <MathDiagram scene={scene in SCENES ? scene : 'default'} />
        </div>
      </div>
    </div>
  );
}
