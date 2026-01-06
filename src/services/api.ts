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

// Interceptor para lidar com 401 (Sessão Expirada) e Refresh Token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Se erro for 401 e não for uma tentativa de login ou refresh
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            
            // Se falhou o próprio refresh, rejeita e redireciona
            if (originalRequest.url.includes('/auth/refresh')) {
                // window.location.href = '/login'; // Deixa o AuthContext lidar ou faz reload
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Tenta renovar o token (cookie HttpOnly)
                await api.post('/auth/refresh');
                
                isRefreshing = false;
                processQueue(null, 'success');
                
                // Refaz a requisição original
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                // Logout forçado
                // window.location.href = '/'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
