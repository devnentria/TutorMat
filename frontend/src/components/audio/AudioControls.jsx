import React, { useState, useRef, useEffect } from 'react';

/**
 * Limpia texto LaTeX para leerlo en voz alta en español
 */
function latexToSpoken(text) {
  return text
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
    .replace(/\\sqrt\{([^}]+)\}/g, 'raíz de $1')
    .replace(/\\sin/g, 'seno')
    .replace(/\\cos/g, 'coseno')
    .replace(/\\tan/g, 'tangente')
    .replace(/\\csc/g, 'cosecante')
    .replace(/\\sec/g, 'secante')
    .replace(/\\cot/g, 'cotangente')
    .replace(/\\theta/g, 'theta')
    .replace(/\\alpha/g, 'alfa')
    .replace(/\\beta/g, 'beta')
    .replace(/\\pi/g, 'pi')
    .replace(/\\circ/g, 'grados')
    .replace(/\^\{?([^}]+)\}?/g, ' elevado a $1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const TOKEN = () => localStorage.getItem('evalutrig_token');

// Caché global de URLs de audio (compartida entre preload y TTSButton)
const audioCache = {};

function buildSpokenText(questionText, options) {
  const optLabels = ['A', 'B', 'C', 'D'];
  return [
    'Pregunta: ' + latexToSpoken(questionText),
    ...options.map((o, i) => `Opción ${optLabels[i]}: ${latexToSpoken(o)}`),
  ].join('. ');
}

async function fetchTTSAudio(text) {
  if (audioCache[text]) return audioCache[text];
  const res = await fetch('/api/sessions/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN()}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('TTS error');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  audioCache[text] = url;
  return url;
}

/** Precarga el audio de una pregunta en segundo plano */
export function preloadTTS(question) {
  if (!question) return;
  const text = buildSpokenText(question.text, [
    question.option_a, question.option_b, question.option_c, question.option_d,
  ]);
  if (!audioCache[text]) {
    fetchTTSAudio(text).catch(() => {}); // silencioso, es solo precarga
  }
}

/**
 * Text-to-Speech: usa la API de OpenAI (voz "nova") con fallback al navegador
 */
export function TTSButton({ questionText, options }) {
  const [state, setState] = useState('idle'); // idle | loading | playing
  const audioRef = useRef(null);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  const speak = async () => {
    if (state === 'playing') {
      audioRef.current?.pause();
      setState('idle');
      return;
    }

    const text = buildSpokenText(questionText, options);
    setState('loading');

    try {
      const url = await fetchTTSAudio(text);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setState('idle');
      audio.onerror = () => setState('idle');
      audio.play();
      setState('playing');
    } catch {
      setState('idle');
      // Fallback navegador
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.88;
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find(v => v.lang.startsWith('es'));
        if (esVoice) utterance.voice = esVoice;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <button
      onClick={speak}
      disabled={state === 'loading'}
      title={state === 'playing' ? 'Detener lectura' : 'Leer pregunta en voz alta'}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
        state === 'playing'
          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
          : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 disabled:opacity-50'
      }`}
    >
      {state === 'loading' && <span className="animate-spin h-3 w-3 border-t-2 border-blue-500 rounded-full inline-block" />}
      {state === 'playing' && <span className="animate-pulse">■</span>}
      {state === 'idle' && '🔊'}
      {state === 'loading' ? ' Cargando...' : state === 'playing' ? ' Detener' : ' Leer pregunta'}
    </button>
  );
}

/**
 * Speech-to-Text: escucha la opción (A, B, C o D) del estudiante
 */
export function STTButton({ onSelect, disabled }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const startListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => { setListening(true); setTranscript(''); };

    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          const t = event.results[i][j].transcript.trim().toUpperCase();
          setTranscript(t);
          // Buscar A, B, C o D en el texto hablado
          const match = t.match(/\b(A|B|C|D)\b/);
          if (match) {
            onSelect(match[1]);
            recognition.stop();
            return;
          }
        }
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={startListening}
        disabled={disabled}
        title="Di en voz alta la opción: A, B, C o D"
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
          listening
            ? 'bg-red-50 border-red-400 text-red-600 animate-pulse'
            : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {listening ? '🎙️ Escuchando...' : '🎤 Responder por voz'}
      </button>
      {transcript && (
        <span className="text-xs text-gray-400">Escuché: "{transcript}"</span>
      )}
    </div>
  );
}
