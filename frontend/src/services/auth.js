import api from './api';

export const login = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  window.location.href = `${apiUrl}/auth/linkedin`;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

export const isAuthenticated = () => {
  return !!getToken();
};

