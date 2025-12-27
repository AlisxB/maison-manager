import axios from 'axios';

// URL base da API
// Em dev (vite): usa o proxy definido no vite.config.ts
// Em prod (nginx): usa o proxy definido no nginx.conf
// Isso evita problemas de CORS e portas fechadas.
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
    withCredentials: true, // Enable sending cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Remove explicit Authorization header injection (Cookies handle it)
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para lidar com 401 (Sessão Expirada)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirou ou inválido
            // Opcional: Tentar refresh token aqui antes de deslogar
            console.warn('Sessão expirada. Redirecionando para login...');
            // localStorage.removeItem('token');
            // window.location.href = '/login'; // Ou tratar via Contexto
        }
        return Promise.reject(error);
    }
);

export default api;
