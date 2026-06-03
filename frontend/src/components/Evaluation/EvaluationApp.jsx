import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { sessions } from '../../api';
import Navbar from '../Navbar';
import TriangleFigure from '../figures/TriangleFigure';
import { TTSButton, STTButton, preloadTTS } from '../audio/AudioControls';
import FeedbackIllustration from '../feedback/FeedbackIllustration';
import FeedbackSteps from '../feedback/FeedbackSteps';

const OPTIONS = ['A', 'B', 'C', 'D'];

export default function EvaluationApp() {
  const navigate = useNavigate();
  const { sessionId: sessionIdParam } = useParams();

  const [sessionId, setSessionId] = useState(sessionIdParam ? parseInt(sessionIdParam) : null);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState({ answered: 0 });
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiScene, setAiScene] = useState('default');
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startRef = useRef(Date.now());

  useEffect(() => {
    if (sessionId) {
      fetchNext(sessionId);
    } else {
      startSession();
    }
  }, []);

  const startSession = async () => {
    setLoading(true);
    try {
      const { session_id } = await sessions.create();
      setSessionId(session_id);
      await fetchNext(session_id);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchNext = async (sid) => {
    const id = sid || sessionId;
    setLoading(true);
    setError('');
    setFeedback(null);
    setAiFeedback('');
    setAiScene('default');
    setSelected('');
    try {
      const data = await sessions.getNextQuestion(id);
      if (data.finished) {
        await sessions.complete(id);
        navigate(`/results/${id}`);
        return;
      }
      setQuestion(data.question);
      setProgress(data.progress);
      startRef.current = Date.now();
      // Precargar audio de la nueva pregunta en segundo plano
      preloadTTS(data.question);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selected || !question || feedback) return;
    const timeMs = Date.now() - startRef.current;
    setLoading(true);
    try {
      const result = await sessions.submitAnswer(sessionId, question.id, selected, timeMs);
      setFeedback({ correct: result.correct, correctOption: result.correct_option });
      setProgress(p => ({ ...p, answered: p.answered + 1 }));

      requestAIFeedback();

      if (result.finished) {
        setTimeout(async () => {
          await sessions.complete(sessionId);
          navigate(`/results/${sessionId}`);
        }, 4000);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const requestAIFeedback = async () => {
    if (!question) return;
    setLoadingAI(true);
    try {
      const { feedback: raw } = await sessions.getFeedback(sessionId, question.id, selected);
      try {
        const parsed = JSON.parse(raw);
        setAiScene(parsed.scene || 'default');
        setAiFeedback(parsed.feedback || raw);
      } catch {
        setAiScene('default');
        setAiFeedback(raw);
      }
    } catch {
      setAiScene('default');
      setAiFeedback('No se pudo generar la retroalimentación en este momento.');
    } finally { setLoadingAI(false); }
  };

  const getOptionText = (opt) =>
    ({ A: question?.option_a, B: question?.option_b, C: question?.option_c, D: question?.option_d })[opt] || '';

  const getOptionStyle = (opt) => {
    if (!feedback) {
      return selected === opt
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-300'
        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer';
    }
    if (opt === feedback.correctOption) return 'border-green-500 bg-green-50 dark:bg-green-900/30';
    if (opt === selected && !feedback.correct) return 'border-red-400 bg-red-50 dark:bg-red-900/30';
    return 'border-gray-100 dark:border-gray-700 opacity-50';
  };

  const MAX_Q = 20;
  const pct = Math.round((progress.answered / MAX_Q) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      {/* Barra de progreso — pegada al navbar, compacta */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pregunta {progress.answered + 1} / ~{MAX_Q}
              </span>
              {question && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium hidden sm:inline">
                  {question.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TTSButton
                questionText={question?.text || ''}
                options={question ? [question.option_a, question.option_b, question.option_c, question.option_d] : []}
              />
              {!feedback && question && (
                <STTButton onSelect={(opt) => setSelected(opt)} disabled={!!feedback} />
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          {question && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 sm:hidden">{question.category}</p>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-3 text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline ml-2 flex-shrink-0">Cerrar</button>
          </div>
        )}

        {loading && !question ? (
          <div className="card flex items-center justify-center py-20 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : question ? (
          <div className="card dark:bg-gray-800 !p-4">

            {/* Pregunta */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 mb-4">
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">
                <Latex>{question.text}</Latex>
              </div>
              {question.needs_image === 1 && (
                <TriangleFigure imageType={question.image_type || 'triangle-generic'} />
              )}
            </div>

            {/* Opciones */}
            <div className="space-y-2 mb-4">
              {OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => !feedback && setSelected(opt)}
                  disabled={!!feedback}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${getOptionStyle(opt)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold text-sm flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      selected === opt && !feedback ? 'bg-blue-600 text-white' :
                      feedback && opt === feedback.correctOption ? 'bg-green-500 text-white' :
                      feedback && opt === selected && !feedback.correct ? 'bg-red-500 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>{opt}</span>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <Latex>{getOptionText(opt)}</Latex>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Resultado inmediato */}
            {feedback && (
              <div className={`rounded-xl px-4 py-3 mb-3 ${feedback.correct
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <p className={`font-semibold text-sm ${feedback.correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {feedback.correct
                    ? '✓ ¡Correcto!'
                    : `✗ Incorrecto — La respuesta correcta es ${feedback.correctOption}`}
                </p>
              </div>
            )}

            {/* Retroalimentación IA */}
            {feedback && (
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 mb-3">
                <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-2">
                  Retroalimentación TutorMat
                </p>
                {loadingAI ? (
                  <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-500" />
                    Generando retroalimentación con IA...
                  </div>
                ) : aiFeedback ? (
                  <>
                    <FeedbackIllustration scene={aiScene} />
                    <FeedbackSteps text={aiFeedback} isCorrect={feedback?.correct} />
                  </>
                ) : null}
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end pt-1">
              {!feedback ? (
                <button onClick={handleSubmit} disabled={!selected || loading} className="btn-primary px-8">
                  {loading ? 'Enviando...' : 'Responder'}
                </button>
              ) : (
                <button onClick={() => fetchNext()} disabled={loading || loadingAI} className="btn-primary px-8">
                  {loading ? 'Cargando...' : loadingAI ? 'Esperando IA...' : 'Siguiente →'}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
