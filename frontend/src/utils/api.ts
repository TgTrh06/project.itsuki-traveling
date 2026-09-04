import axios from 'axios';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default api;
