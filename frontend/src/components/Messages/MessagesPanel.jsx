import React, { useState, useEffect } from 'react';
import { messages as msgApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function MessagesPanel({ open, onClose }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [data, setData] = useState({ inbox: [], sent: [], unread: 0 });
  const [selected, setSelected] = useState(null);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ to_user_id: '', subject: '', body: '' });
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);

  const load = () => msgApi.getAll().then(setData).catch(() => {});

  useEffect(() => {
    if (open) {
      load();
      if (user?.role === 'admin') {
        msgApi.getUsers().then(setUsers).catch(() => {});
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) { setSelected(null); setComposing(false); }
  }, [open]);

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.read && tab === 'inbox') {
      await msgApi.markRead(msg.id);
      load();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Para admin: enviar al destinatario seleccionado
      // Para no-admin: el backend resuelve automáticamente al admin
      const payload = {
        subject: form.subject,
        body: form.body,
        ...(user.role === 'admin' ? { to_user_id: parseInt(form.to_user_id) } : {}),
      };
      await msgApi.send(payload);
      setComposing(false);
      setForm({ to_user_id: '', subject: '', body: '' });
      load();
    } catch (err) {
      alert(err.message);
    } finally { setSending(false); }
  };

  const list = tab === 'inbox' ? data.inbox : data.sent;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">Mensajes</span>
            {data.unread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{data.unread}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setComposing(true); setSelected(null); }}
              className="bg-white text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50">
              + Redactar
            </button>
            <button onClick={onClose} className="text-white hover:text-blue-200 text-xl font-bold">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {['inbox', 'sent'].map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(null); }}
              className={`flex-1 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
              {t === 'inbox' ? `Recibidos${data.unread > 0 ? ` (${data.unread})` : ''}` : 'Enviados'}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {composing ? (
            <form onSubmit={handleSend} className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">Nuevo mensaje</h3>
              {user?.role === 'admin' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Para</label>
                  <select
                    value={form.to_user_id}
                    onChange={e => setForm(f => ({ ...f, to_user_id: e.target.value }))}
                    className="input-field"
                    required>
                    <option value="">Selecciona un destinatario</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.username} ({u.role})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  Para: <strong>Administrador TutorMat</strong>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="input-field"
                  placeholder="Asunto del mensaje" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  className="input-field resize-none"
                  rows={5}
                  placeholder="Escribe tu mensaje..."
                  required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={sending} className="btn-primary flex-1">
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
                <button type="button" onClick={() => setComposing(false)} className="btn-secondary px-4">
                  Cancelar
                </button>
              </div>
            </form>
          ) : selected ? (
            <div className="p-5">
              <button onClick={() => setSelected(null)} className="text-blue-600 text-sm mb-4 flex items-center gap-1">
                ← Volver
              </button>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">{selected.subject || 'Sin asunto'}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-medium">De:</span> {selected.from_name || selected.from_username || 'Administrador'}</p>
                  <p><span className="font-medium">Fecha:</span> {new Date(selected.created_at).toLocaleString('es-MX')}</p>
                </div>
                <div className="border-t pt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.body}
                </div>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No hay mensajes</p>
            </div>
          ) : (
            <div className="divide-y">
              {list.map(msg => (
                <button key={msg.id} onClick={() => handleSelect(msg)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${!msg.read && tab === 'inbox' ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!msg.read && tab === 'inbox' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {tab === 'inbox' ? (msg.from_name || msg.from_username) : (msg.to_name || msg.to_username)}
                      </p>
                      <p className={`text-sm truncate ${!msg.read && tab === 'inbox' ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                        {msg.subject || 'Sin asunto'}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{msg.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </span>
                      {!msg.read && tab === 'inbox' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
