import axios from 'axios';
import { apiClient } from '../services/apiClient';

const API_URL = import.meta.env.VITE_API_URL;

const REFRESH_TIMEOUT_MS = 12000;
const MAX_NETWORK_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(null);
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  const path = window.location.pathname;
  if (path !== '/login' && path !== '/registro') {
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Es error de red si Axios no recibió respuesta del servidor
 * (timeout, conexión caída, DNS, CORS de red, etc).
 * NO es error de red si el servidor respondió (aunque sea con 401/500).
 */
const isNetworkError = (error: any) => !error?.response;

/**
 * Intenta refrescar la sesión. Reintenta automáticamente ante fallos de red
 * (con backoff exponencial). Solo lanza una excepción "definitiva" cuando
 * el backend responde explícitamente que el refresh token es inválido.
 */
const attemptRefreshWithRetry = async (): Promise<void> => {
  let lastError: any = null;

  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    try {
      await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: REFRESH_TIMEOUT_MS },
      );
      return; // éxito
    } catch (err: any) {
      lastError = err;

      // Rechazo EXPLÍCITO del backend (token inválido/expirado/reutilizado)
      // -> no tiene sentido reintentar, hay que cerrar sesión ya.
      if (err?.response) {
        throw err;
      }

      // Error de red -> reintentar con backoff, salvo que sea el último intento
      if (attempt < MAX_NETWORK_RETRIES) {
        await sleep(BASE_BACKOFF_MS * Math.pow(2, attempt));
        continue;
      }
    }
  }

  // Se agotaron los reintentos por problemas de red (nunca hubo respuesta del server)
  throw lastError;
};

const setupInterceptorsForInstance = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    config.withCredentials = true;

    const method = String(config.method || 'get').toLowerCase();
    const isUnsafeMethod = ['post', 'put', 'patch', 'delete'].includes(method);

    if (isUnsafeMethod && !config.url?.includes('/auth/login')) {
      const csrfToken = getCookie('XSRF-TOKEN');

      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = decodeURIComponent(csrfToken);
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      // Error de red en la petición original: no tocar la sesión.
      if (!error.response) {
        return Promise.reject(error);
      }

      if (error.response.status !== 401) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (originalRequest.url?.includes('/auth/refresh')) {
        // Esto solo debería ocurrir si el propio /auth/refresh devolvió 401
        // (rechazo explícito), gracias a que attemptRefreshWithRetry ya
        // filtró los errores de red antes de llegar aquí.
        redirectToLogin();
        return Promise.reject(error);
      }

      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/logout') ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/registro'
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => instance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await attemptRefreshWithRetry();

        processQueue(null);
        return instance(originalRequest);
      } catch (err: any) {
        processQueue(err);

        // Solo cerramos sesión si el fallo fue un rechazo EXPLÍCITO
        // del backend. Si fue error de red persistente, dejamos la
        // sesión intacta: el usuario reintentará su siguiente acción
        // cuando la conexión vuelva.
        if (!isNetworkError(err)) {
          localStorage.removeItem('user');
          redirectToLogin();
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

export const setupGlobalInterceptors = () => {
  setupInterceptorsForInstance(axios);
  setupInterceptorsForInstance(apiClient);
};
