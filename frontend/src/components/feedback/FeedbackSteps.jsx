import React from 'react';

const STEP_CONFIG = [
  { num: 1, title: 'Situación real',          icon: '🌍', color: 'emerald',  bg: 'bg-emerald-50',  border: 'border-emerald-200', head: 'text-emerald-700', badge: 'bg-emerald-500' },
  { num: 2, title: 'Comprensión',              icon: '🔍', color: 'blue',     bg: 'bg-blue-50',     border: 'border-blue-200',    head: 'text-blue-700',    badge: 'bg-blue-500' },
  { num: 3, title: 'Modelo real',              icon: '📐', color: 'violet',   bg: 'bg-violet-50',   border: 'border-violet-200',  head: 'text-violet-700',  badge: 'bg-violet-500' },
  { num: 4, title: 'Modelo matemático',        icon: '📊', color: 'indigo',   bg: 'bg-indigo-50',   border: 'border-indigo-200',  head: 'text-indigo-700',  badge: 'bg-indigo-500' },
  { num: 5, title: 'Trabajo matemático',       icon: '🧮', color: 'cyan',     bg: 'bg-cyan-50',     border: 'border-cyan-200',    head: 'text-cyan-700',    badge: 'bg-cyan-500' },
  { num: 6, title: 'Interpretación',           icon: '💡', color: 'amber',    bg: 'bg-amber-50',    border: 'border-amber-200',   head: 'text-amber-700',   badge: 'bg-amber-500' },
  { num: 7, title: 'Validación',               icon: '✅', color: 'rose',     bg: 'bg-rose-50',     border: 'border-rose-200',    head: 'text-rose-700',    badge: 'bg-rose-500' },
];

/**
 * Parsea el texto de feedback en bloques por paso.
 * Soporta variantes: "Paso 1 —", "Paso 1 -", "**Paso 1"
 */
function parseSteps(text) {
  const blocks = [];
  const regex = /\*{0,2}Paso\s+(\d)\s*[—\-–]\s*[^:\n]*:?\*{0,2}/gi;
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) {
    // No se pudo parsear: devolver texto plano
    return [{ num: 0, body: text }];
  }

  for (let i = 0; i < matches.length; i++) {
    const num = parseInt(matches[i][1]);
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(start, end).trim();
    blocks.push({ num, body });
  }

  return blocks;
}

/**
 * Renderiza el cuerpo de un paso con tipografía uniforme.
 * Soporta **bold**, *italic*, bullets y fórmulas inline entre `backticks`.
 */
function StepBody({ text }) {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  return (
    <div className="space-y-1.5">
      {lines.map((line, li) => {
        const isBullet = /^[•\-\*]\s/.test(line.trim());
        const content = line.replace(/^[•\-\*]\s/, '').trim();
        return (
          <p key={li} className={`text-sm leading-relaxed text-gray-700 ${isBullet ? 'flex gap-2' : ''}`}>
            {isBullet && <span className="text-indigo-400 mt-0.5 flex-shrink-0">▸</span>}
            <InlineFormat text={content} />
          </p>
        );
      })}
    </div>
  );
}

/** Aplica **negrita**, *cursiva* y `código` en línea con fuente uniforme */
function InlineFormat({ text }) {
  const parts = [];
  // Orden importa: primero **bold**, luego *italic*, luego `code`
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', val: text.slice(last, m.index) });
    if (m[2])      parts.push({ type: 'bold',   val: m[2] });
    else if (m[3]) parts.push({ type: 'italic',  val: m[3] });
    else if (m[4]) parts.push({ type: 'code',    val: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', val: text.slice(last) });
  if (parts.length === 0) return <span>{text}</span>;

  return (
    <>
      {parts.map((p, i) =>
        p.type === 'bold'   ? <strong key={i} className="font-semibold text-gray-900">{p.val}</strong> :
        p.type === 'italic' ? <em key={i} className="italic text-gray-500">{p.val}</em> :
        p.type === 'code'   ? <code key={i} className="font-mono text-indigo-700 bg-indigo-50 rounded px-1 text-xs">{p.val}</code> :
                              <span key={i}>{p.val}</span>
      )}
    </>
  );
}

export default function FeedbackSteps({ text, isCorrect }) {
  if (!text) return null;

  const blocks = parseSteps(text);

  // Si no se pudo parsear, mostrar texto plano mejorado
  if (blocks.length === 1 && blocks[0].num === 0) {
    return (
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
        {text}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {blocks.map(({ num, body }) => {
        const cfg = STEP_CONFIG[num - 1];
        if (!cfg) return null;
        return (
          <div key={num} className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
            {/* Header del paso */}
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${cfg.border}`}>
              <span className={`${cfg.badge} text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0`}>
                {num}
              </span>
              <span className="text-sm mr-1">{cfg.icon}</span>
              <span className={`text-xs font-bold uppercase tracking-wide ${cfg.head}`}>
                {cfg.title}
              </span>
            </div>
            {/* Cuerpo */}
            <div className="px-3 py-2">
              <StepBody text={body} />
            </div>
          </div>
        );
      })}

      {/* Firma */}
      <p className="text-right text-xs text-indigo-400 italic pt-1">
        — TutorMat · Ciclo de Borromeo-Ferri (2010)
      </p>
    </div>
  );
}
