import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { student } from '../../api';
import Navbar from '../Navbar';

export default function StudentProfile() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState('password');

  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadErr, setUploadErr] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileRef = useRef();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdErr('');
    setPwdMsg('');
    if (newPwd !== confirm) { setPwdErr('Las contraseñas no coinciden.'); return; }
    if (newPwd.length < 6) { setPwdErr('La contraseña debe tener al menos 6 caracteres.'); return; }
    setSavingPwd(true);
    try {
      await student.changePassword(current, newPwd);
      setPwdMsg('Contraseña actualizada correctamente.');
      setCurrent(''); setNewPwd(''); setConfirm('');
    } catch (e) {
      setPwdErr(e.message);
    } finally { setSavingPwd(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;
    setUploadErr('');
    setUploadMsg('');
    setSavingAvatar(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const token = localStorage.getItem('evalutrig_token');
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
      setUploadMsg('Foto de perfil actualizada.');
    } catch (e) {
      setUploadErr(e.message);
    } finally { setSavingAvatar(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Mi Perfil</h1>

        {/* Info básica */}
        <div className="card mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
          <p className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Usuario / Matrícula</p>
          <p className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{user?.username}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('password')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'password'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}>
            Cambiar contraseña
          </button>
          <button
            onClick={() => setTab('avatar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'avatar'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}>
            Foto de perfil
          </button>
        </div>

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} className="card space-y-4">
            {pwdErr && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{pwdErr}</p>}
            {pwdMsg && <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">{pwdMsg}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña actual</label>
              <input
                type="password" value={current} onChange={e => setCurrent(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva contraseña</label>
              <input
                type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                required minLength={6}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar contraseña</label>
              <input
                type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" disabled={savingPwd} className="btn-primary w-full">
              {savingPwd ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        {tab === 'avatar' && (
          <div className="card space-y-4">
            {uploadErr && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{uploadErr}</p>}
            {uploadMsg && <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">{uploadMsg}</p>}

            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-gray-400">👤</span>
                )}
              </div>
              <input
                ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="text-sm text-gray-600 dark:text-gray-300"
              />
            </div>
            <button
              onClick={handleAvatarUpload}
              disabled={savingAvatar || !avatarPreview}
              className="btn-primary w-full">
              {savingAvatar ? 'Subiendo...' : 'Guardar foto'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
