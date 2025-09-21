import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Children API
export const childrenAPI = {
  getAll: () => api.get('/children'),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
  getInsights: (id) => api.get(`/children/${id}/insights`),
  generateInsight: (id, context) => api.post(`/children/${id}/insights`, { context }),
}

// Health Records API
export const healthAPI = {
  getAll: () => api.get('/health'),
  getByChildId: (childId) => api.get(`/health/child/${childId}`),
  getById: (id) => api.get(`/health/${id}`),
  create: (data) => api.post('/health', data),
  update: (id, data) => api.put(`/health/${id}`, data),
  delete: (id) => api.delete(`/health/${id}`),
  getUpcoming: (childId) => api.get(`/health/upcoming/${childId}`),
  complete: (id) => api.patch(`/health/${id}/complete`),
}

// Reminders API
export const remindersAPI = {
  getAll: () => api.get('/reminders'),
  getByChildId: (childId) => api.get(`/reminders/child/${childId}`),
  getActive: () => api.get('/reminders/active'),
  getUpcoming: () => api.get('/reminders/upcoming'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
  toggle: (id) => api.patch(`/reminders/${id}/toggle`),
  trigger: (id) => api.patch(`/reminders/${id}/trigger`),
}

// Care Plans API
export const carePlansAPI = {
  getAll: () => api.get('/care-plans'),
  getByChildId: (childId) => api.get(`/care-plans/child/${childId}`),
  getById: (id) => api.get(`/care-plans/${id}`),
  create: (data) => api.post('/care-plans', data),
  update: (id, data) => api.put(`/care-plans/${id}`, data),
  delete: (id) => api.delete(`/care-plans/${id}`),
  updateTask: (id, taskId, data) => api.patch(`/care-plans/${id}/tasks/${taskId}`, data),
  addTask: (id, data) => api.post(`/care-plans/${id}/tasks`, data),
  deleteTask: (id, taskId) => api.delete(`/care-plans/${id}/tasks/${taskId}`),
  regenerate: (id, specificNeeds) => api.post(`/care-plans/${id}/regenerate`, { specificNeeds }),
}

// AI API
export const aiAPI = {
  generateTip: (childId, context) => api.post('/ai/tips', { childId, context }),
  generateInsights: (childId) => api.post('/ai/insights', { childId }),
  generateCarePlan: (childId, specificNeeds) => api.post('/ai/care-plan', { childId, specificNeeds }),
  chat: (childId, message, context) => api.post('/ai/chat', { childId, message, context }),
  getInsights: (childId) => api.get(`/ai/insights/${childId}`),
  deleteInsight: (id) => api.delete(`/ai/insights/${id}`),
  generateDailySummary: (childId) => api.post('/ai/daily-summary', { childId }),
}

export default api
