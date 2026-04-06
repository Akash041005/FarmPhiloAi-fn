import { api } from './api';

export const scanService = {
  analyzeImage: async (formData) => {
    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  analyzeVoice: async (transcript, cropType, latitude, longitude) => {
    const response = await api.post('/analyze/voice', {
      transcript,
      cropType,
      latitude,
      longitude
    });
    return response.data;
  }
};

export const historyService = {
  getHistory: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters }).toString();
    const response = await api.get(`/history?${params}`);
    return response.data;
  },

  getHistoryById: async (id) => {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },

  deleteHistory: async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },

  toggleBookmark: async (id, isBookmarked) => {
    const response = await api.patch(`/history/${id}/bookmark`, { isBookmarked });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/history/stats/summary');
    return response.data;
  }
};

export const weatherService = {
  getWeather: async (lat, lon) => {
    const response = await api.get(`/weather?lat=${lat}&lon=${lon}`);
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  subscribe: async (pushToken) => {
    const response = await api.post('/notifications/subscribe', { pushToken });
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  }
};

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateLocation: async (latitude, longitude, address) => {
    const response = await api.put('/settings/location', { latitude, longitude, address });
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/settings/profile', data);
    return response.data;
  },

  updatePreferences: async (language, theme) => {
    const response = await api.put('/settings/preferences', { language, theme });
    return response.data;
  }
};