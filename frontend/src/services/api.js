// Customer service for secure Aadhaar PDF upload
export const customerService = {
  createCustomer: (data, token) => {
    // data: { name, phone, aadharPdf (File), email? }
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.aadharPdf) formData.append('aadharPdf', data.aadharPdf);
    return api.post('/customers/add', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
import axios from 'axios'
import store from '../store'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
const api = axios.create({
  baseURL: API_BASE,
})

// Utility function to decode JWT and check expiration
const isTokenExpired = (token) => {
  try {
    if (!token) return true
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const decoded = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp && decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

// Check and clear expired token on app load
const token = localStorage.getItem('token')
if (token && isTokenExpired(token)) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.error || ''

      if (message === 'Session expired. Please log in again.' || message === 'Token is not valid') {
        store.dispatch({ type: 'LOGOUT' })
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: (token) =>
    api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

export const equipmentService = {
  getAllEquipment: (filters) => api.get('/equipment', { params: filters }),
  getEquipmentById: (id) => api.get(`/equipment/${id}`),
  createEquipment: (data, token) =>
    api.post('/equipment', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateEquipment: (id, data, token) =>
    api.put(`/equipment/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  deleteEquipment: (id, token) =>
    api.delete(`/equipment/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

export const bookingService = {
  createBooking: (data, token) =>
    api.post('/bookings', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getBookings: (token) =>
    api.get('/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateBookingStatus: (id, status, token) =>
    api.put(
      `/bookings/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),
  cancelBooking: (id, reason, token) =>
    api.put(
      `/bookings/${id}/cancel`,
      { cancellationReason: reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),
}

export const reviewService = {
  createReview: (data, token) =>
    api.post('/reviews', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getEquipmentReviews: (equipmentId) =>
    api.get(`/reviews/equipment/${equipmentId}`),
  getUserReviews: (userId) =>
    api.get(`/reviews/user/${userId}`),
}

export const userService = {
  getUserProfile: (id) => api.get(`/users/${id}`),
  searchByPhone: (phone) => api.get('/customers/search-by-phone', { params: { phone } }),
  updateProfile: (data, token) =>
    api.put('/users/profile/update', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  saveEquipment: (equipmentId, token) =>
    api.post(
      '/users/save-equipment',
      { equipmentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),
  getSavedEquipment: (token) =>
    api.get('/users/saved-equipment/list', {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

export default api
