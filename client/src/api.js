import axios from 'axios';

// withCredentials sends the httpOnly JWT cookie with every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export default api;
