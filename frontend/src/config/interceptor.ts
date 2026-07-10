import axios from 'axios';
import { apiClient } from '../services/apiClient';

/**
 * Interceptor Global para Axios y Fetch.
 * Maneja sesión automática con refresh token.
 */

const API_URL = import.meta.env.VITE_API_URL;

// 🔥 CONTROL DE REFRESH
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(null);
    });
    failedQueue = [];
};

const redirectToLogin = () => {
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/registro') {
        // Limpiar estado local antes de redirigir
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
    }
};

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

const setupInterceptorsForInstance = (instance: any) => {
    // 🔹 AXIOS REQUEST
    instance.interceptors.request.use((config: any) => {
        config.withCredentials = true;
        const csrfToken = getCookie('XSRF-TOKEN');
        if (csrfToken) {
            config.headers = config.headers || {};
            config.headers['X-CSRF-Token'] = csrfToken;
        }
        return config;
    });

    // 🔹 AXIOS RESPONSE
    instance.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
            const originalRequest = error.config;

            if (!error.response) {
                return Promise.reject(error);
            }

            // ❌ No es 401
            if (error.response.status !== 401) {
                return Promise.reject(error);
            }

            // 🔁 Evitar loop
            if (originalRequest._retry) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // 🔴 Si falla refresh → logout directo
            if (originalRequest.url?.includes('/auth/refresh')) {
                redirectToLogin();
                return Promise.reject(error);
            }

            // ❌ No refrescar en login, registro ni logout
            // El usuario puede tener un refresh_token viejo pegado; no debe
            // interferir cuando quiere autenticarse o cerrar sesión de forma explícita.
            if (
                originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/logout') ||
                window.location.pathname === '/login' ||
                window.location.pathname === '/registro'
            ) {
                return Promise.reject(error);
            }

            // 🔒 Cola de requests
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => instance(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

                processQueue(null);

                return instance(originalRequest);

            } catch (err) {
                processQueue(err);

                // Limpiar estado de sesión antes de redirigir
                localStorage.removeItem('user');
                redirectToLogin();
                return Promise.reject(err);

            } finally {
                isRefreshing = false;
            }
        }
    );
};

export const setupGlobalInterceptors = () => {
    setupInterceptorsForInstance(axios);
    setupInterceptorsForInstance(apiClient);
};