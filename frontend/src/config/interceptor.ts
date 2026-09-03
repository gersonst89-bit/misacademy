import axios from 'axios';

import { apiClient } from '../services/apiClient';

const API_URL = import.meta.env.VITE_API_URL;

const REFRESH_TIMEOUT_MS = 12000;
const MAX_NETWORK_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Resuelve/rechaza las peticiones que quedaron esperando
 * mientras se intentaba renovar la sesión.
 */
const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });

  failedQueue = [];
};

/**
 * Redirección centralizada al login cuando realmente
 * se confirma que la sesión ya no es válida.
 */
const redirectToLogin = () => {
  const path = window.location.pathname;

  if (path !== '/login' && path !== '/registro') {
    localStorage.removeItem('user');

    window.location.href = '/login?expired=true';
  }
};

/**
 * Obtiene una cookie concreta.
 */
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
};

/**
 * Espera determinada cantidad de milisegundos.
 */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Es error de red si Axios NO recibió respuesta HTTP.
 *
 * Ejemplos:
 * - timeout
 * - DNS
 * - conexión caída
 * - CORS que impide obtener respuesta
 *
 * Si el servidor respondió con 401/403/500, esto NO es
 * considerado error de red.
 */
const isNetworkError = (error: any) => !error?.response;

/**
 * Intenta renovar la sesión.
 *
 * Reintenta únicamente cuando realmente no hubo respuesta
 * del servidor.
 *
 * Si el backend responde explícitamente 401/403/etc.,
 * ese error se propaga inmediatamente.
 */
const attemptRefreshWithRetry = async (): Promise<void> => {
  let lastError: any = null;

  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    try {
      await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          timeout: REFRESH_TIMEOUT_MS,
        },
      );

      // Refresh exitoso
      return;
    } catch (err: any) {
      lastError = err;

      /**
       * El backend respondió.
       *
       * No reintentamos porque ya tenemos una respuesta
       * explícita del servidor.
       */
      if (err?.response) {
        throw err;
      }

      /**
       * No hubo respuesta: problema de red.
       * Se reintenta con backoff exponencial.
       */
      if (attempt < MAX_NETWORK_RETRIES) {
        await sleep(BASE_BACKOFF_MS * Math.pow(2, attempt));
      }
    }
  }

  /**
   * Se agotaron todos los reintentos y nunca
   * obtuvimos una respuesta HTTP.
   */
  throw lastError;
};

/**
 * Configura interceptores para una instancia de Axios.
 */
const setupInterceptorsForInstance = (instance: any) => {
  /**
   * ============================
   * REQUEST INTERCEPTOR
   * ============================
   */
  instance.interceptors.request.use(
    (config: any) => {
      /**
       * Las peticiones necesitan cookies de sesión.
       */
      config.withCredentials = true;

      const method = String(config.method || 'get').toLowerCase();

      const isUnsafeMethod = ['post', 'put', 'patch', 'delete'].includes(method);

      /**
       * CSRF solo para métodos inseguros.
       *
       * Nunca agregamos el token CSRF al login.
       */
      if (isUnsafeMethod && !config.url?.includes('/auth/login')) {
        const csrfToken = getCookie('XSRF-TOKEN');

        if (csrfToken) {
          config.headers = config.headers || {};

          config.headers['X-CSRF-Token'] = decodeURIComponent(csrfToken);
        }
      }

      return config;
    },
    (error: any) => Promise.reject(error),
  );

  /**
   * ============================
   * RESPONSE INTERCEPTOR
   * ============================
   */
  instance.interceptors.response.use(
    /**
     * Respuesta correcta: no hacemos nada.
     */
    (response: any) => response,

    /**
     * Error de respuesta.
     */
    async (error: any) => {
      const originalRequest = error?.config;

      const requestUrl = String(originalRequest?.url || '');

      /**
       * --------------------------------------------------
       * CASOS ESPECIALES DE AUTENTICACIÓN
       * --------------------------------------------------
       */

      /**
       * /auth/profile NO debe provocar refresh ni redirect.
       *
       * Este endpoint se usa para comprobar si existe sesión.
       * Si no existe, simplemente debe devolver el error a quien
       * hizo la petición para que el frontend lo maneje.
       *
       * Esto evita:
       *
       * /
       *  ↓
       * /auth/profile → 401
       *  ↓
       * refresh
       *  ↓
       * /login?expired=true
       *
       * especialmente después de cerrar sesión.
       */
      if (requestUrl.includes('/auth/profile')) {
        return Promise.reject(error);
      }

      /**
       * /auth/logout tampoco debe activar el flujo de refresh.
       *
       * Si el usuario ya decidió cerrar sesión, no tiene sentido
       * intentar renovar la sesión.
       */
      if (requestUrl.includes('/auth/logout')) {
        return Promise.reject(error);
      }

      /**
       * Error de red:
       *
       * No tocar la sesión.
       * No refrescar.
       * No redirigir.
       */
      if (!error?.response) {
        return Promise.reject(error);
      }

      /**
       * Solo procesamos 401.
       *
       * Un 400, 404, 409, 422, 500, etc. no significa
       * automáticamente que la sesión haya expirado.
       */
      if (error.response.status !== 401) {
        return Promise.reject(error);
      }

      /**
       * Si esta petición ya pasó por el proceso de refresh,
       * no debemos entrar en un bucle infinito.
       */
      if (originalRequest?._retry) {
        return Promise.reject(error);
      }

      /**
       * Marcamos esta petición como reintentada.
       */
      originalRequest._retry = true;

      /**
       * Si el propio endpoint refresh respondió 401,
       * entonces el refresh token ya no es válido.
       *
       * En ese caso sí corresponde cerrar sesión.
       */
      if (requestUrl.includes('/auth/refresh')) {
        localStorage.removeItem('user');
        redirectToLogin();

        return Promise.reject(error);
      }

      /**
       * Login y logout nunca deben entrar en el flujo
       * de renovación de sesión.
       *
       * También evitamos redirecciones estando ya
       * en login o registro.
       */
      if (
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/logout') ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/registro'
      ) {
        return Promise.reject(error);
      }

      /**
       * --------------------------------------------------
       * YA HAY UN REFRESH EN CURSO
       * --------------------------------------------------
       *
       * Las demás peticiones esperan a que termine.
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then(() => instance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      /**
       * --------------------------------------------------
       * INICIAR REFRESH
       * --------------------------------------------------
       */
      isRefreshing = true;

      try {
        await attemptRefreshWithRetry();

        /**
         * El refresh fue exitoso.
         *
         * Liberamos las peticiones pendientes.
         */
        processQueue(null);

        /**
         * Reintentamos la petición original.
         */
        return instance(originalRequest);
      } catch (refreshError: any) {
        /**
         * El refresh falló.
         *
         * Rechazamos todas las peticiones que estaban esperando.
         */
        processQueue(refreshError);

        /**
         * SOLO cerramos sesión cuando el backend
         * confirma explícitamente que la sesión/token
         * ya no es válido.
         *
         * 401 / 403 = sesión inválida.
         *
         * 500 = error de servidor → NO expulsar.
         * timeout = red → NO expulsar.
         * DNS = red → NO expulsar.
         * CORS sin response = red → NO expulsar.
         */
        const refreshStatus = refreshError?.response?.status;

        const isAuthFailure = refreshStatus === 401 || refreshStatus === 403;

        if (isAuthFailure) {
          localStorage.removeItem('user');
          redirectToLogin();
        } else if (isNetworkError(refreshError)) {
          /**
           * Problema de red persistente.
           *
           * Conservamos la sesión.
           */
          console.warn('No se pudo renovar la sesión por un problema de red.', refreshError);
        } else {
          /**
           * El backend respondió con un error distinto de 401/403.
           *
           * Conservamos la sesión.
           */
          console.error('Error del servidor al renovar la sesión:', refreshError);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

/**
 * Configuración global.
 *
 * Se mantiene para axios y apiClient,
 * como ya estaba en tu implementación.
 */
export const setupGlobalInterceptors = () => {
  setupInterceptorsForInstance(axios);
  setupInterceptorsForInstance(apiClient);
};
