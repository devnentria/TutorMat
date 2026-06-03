/**
 * Cliente API para comunicarse con el backend EvaluTrig
 */
const BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('evalutrig_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (username, password) =>
    request('POST', '/auth/login', { username, password }),

  register: (username, password, name, grade, country, state, school) =>
    request('POST', '/auth/register', { username, password, name, grade, country, state, school }),

  me: () => request('GET', '/auth/me'),
};

// ── Sessions ─────────────────────────────────────────────────────────────────

export const sessions = {
  create: (activity_id) => request('POST', '/sessions', { activity_id }),

  getNextQuestion: (sessionId) =>
    request('GET', `/sessions/${sessionId}/next`),

  submitAnswer: (sessionId, question_id, selected_option, response_time_ms) =>
    request('POST', `/sessions/${sessionId}/answer`, {
      question_id, selected_option, response_time_ms,
    }),

  complete: (sessionId) =>
    request('POST', `/sessions/${sessionId}/complete`),

  getResults: (sessionId) =>
    request('GET', `/sessions/${sessionId}/results`),

  getHistory: () =>
    request('GET', '/sessions'),

  // Pista eliminada por diseño — solo retroalimentación tras respuesta incorrecta

  getFeedback: (sessionId, question_id, selected_option) =>
    request('POST', `/sessions/${sessionId}/feedback`, { question_id, selected_option }),
};

// ── Student ───────────────────────────────────────────────────────────────────

export const student = {
  getHome: () => request('GET', '/student/home'),
  updateProfile: (data) => request('PUT', '/auth/profile', data),
  changePassword: (current, newPassword) =>
    request('PUT', '/auth/change-password', { current, newPassword }),
};

// ── Teacher ───────────────────────────────────────────────────────────────────

export const teacher = {
  getDashboard: () => request('GET', '/teacher/dashboard'),
  getGroups: () => request('GET', '/teacher/groups'),
  createGroup: (name, description) => request('POST', '/teacher/groups', { name, description }),
  updateGroup: (id, name, description) => request('PUT', `/teacher/groups/${id}`, { name, description }),
  deleteGroup: (id) => request('DELETE', `/teacher/groups/${id}`),

  getGroupStudents: (groupId) => request('GET', `/teacher/groups/${groupId}/students`),
  addStudent: (groupId, data) => request('POST', `/teacher/groups/${groupId}/students`, data),
  removeStudent: (studentId) => request('DELETE', `/teacher/students/${studentId}`),
  resetPassword: (studentId, password) => request('PUT', `/teacher/students/${studentId}/reset-password`, { password }),
  getGroupStats: (groupId) => request('GET', `/teacher/groups/${groupId}/stats`),
  getActivities: (groupId) => request('GET', `/teacher/groups/${groupId}/activities`),
  createActivity: (groupId, data) => request('POST', `/teacher/groups/${groupId}/activities`, data),
  toggleActivity: (activityId, status) => request('PATCH', `/teacher/activities/${activityId}/status`, { status }),
  deleteActivity: (activityId) => request('DELETE', `/teacher/activities/${activityId}`),
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const messages = {
  getAll: () => request('GET', '/messages'),
  send: (data) => request('POST', '/messages', data),
  markRead: (id) => request('PUT', `/messages/${id}/read`),
  markAllRead: () => request('PUT', '/messages/read-all'),
  getUsers: () => request('GET', '/messages/users'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const admin = {
  getDashboard: () => request('GET', '/admin/dashboard'),
  getStudents: () => request('GET', '/admin/students'),
  getStudent: (id) => request('GET', `/admin/students/${id}`),
  getSessions: () => request('GET', '/admin/sessions'),
  getQuestions: () => request('GET', '/admin/questions'),
  getTeachers: () => request('GET', '/admin/teachers'),
  deleteTeacher: (id) => request('DELETE', `/admin/teachers/${id}`),
};
