import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  
  register: (userData) => api.post('/auth/register', userData),
  
  getMe: () => api.get('/auth/me'),
}

export const patientAPI = {
  create: (data) => api.post('/patients/', data),
  getById: (id) => api.get(`/patients/${id}`),
  getByExternalId: (id) => api.get(`/patients/external/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  list: (params) => api.get('/patients/', { params }),
}

export const documentAPI = {
  upload: (patientId, file, documentType) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/documents/upload', formData, {
      params: { patient_id: patientId, document_type: documentType },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  getById: (id) => api.get(`/documents/${id}`),
  getByPatient: (patientId) => api.get(`/documents/patient/${patientId}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  process: (id) => api.post(`/documents/${id}/process`),
  list: () => api.get('/documents/'),
}

export const claimAPI = {
  create: (data) => api.post('/claims/', data),
  getById: (id) => api.get(`/claims/${id}`),
  getByPatient: (patientId) => api.get(`/claims/patient/${patientId}`),
  update: (id, data) => api.put(`/claims/${id}`, data),
  addItem: (data) => api.post(`/${id}/items`, data),
  validate: (id) => api.post(`/claims/${id}/validate`),
  submit: (id) => api.post(`/claims/${id}/submit`),
  approveCode: (codeId, notes) => api.post(`/claims/codes/${codeId}/approve`, { notes }),
  rejectCode: (codeId, notes) => api.post(`/claims/codes/${codeId}/reject`, { notes }),
}

export default api
