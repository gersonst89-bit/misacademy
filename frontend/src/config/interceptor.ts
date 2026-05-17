import axios from 'axios';

/**
 * Interceptor Global para Axios y Fetch.
 * Captura errores 401 (No autorizado) en cualquier petición de la app
 * y redirige al usuario al login, limpiando la sesión corrupta.
 */
let csrfToken: string | null = null;

/** Resetea el token CSRF en memoria. Llamar al hacer logout. */
export function resetCsrfToken() {
  csrfToken = null;
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL no está definido en las variables de entorno');
    }
    const response = await axios.get(`${apiUrl}/auth/csrf-token`, { withCredentials: true });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error al obtener token CSRF:', error);
    return null;
  }
}

export const setupGlobalInterceptors = () => {
  // 1. Interceptor para Axios
  axios.interceptors.request.use(async (config) => {
    config.withCredentials = true;
    
    // Agregar token CSRF en métodos no seguros
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      const token = await getCsrfToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // No redirigir si la petición es para verificar el perfil (ya que se usa en páginas públicas)
        const isProfileCheck = error.config.url?.includes('/auth/profile');
        
        // Solo redirigir si estamos en una ruta que REQUIERE estar logueado
        const protectedRoutes = ['/perfil', '/admin', '/compras', '/evaluation', '/certificados'];
        const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));

        if (!isProfileCheck && isProtectedRoute) {
          console.warn('Sesión expirada o no válida (Axios 401). Redirigiendo...');
          window.location.href = '/login?expired=true';
        }
      }
      // Si el error es por CSRF, limpiar el token para forzar regeneración
      if (error.response && error.response.status === 403 && error.response.data?.message?.includes('CSRF')) {
        csrfToken = null;
      }
      return Promise.reject(error);
    }
  );

  // 2. Interceptor para Fetch nativo
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    // Asegurar que init sea un objeto y tenga credentials: 'include'
    const finalInit = { ...(init || {}), credentials: 'include' as RequestCredentials };
    
    // Si init ya tiene headers, preservarlos correctamente
    if (init && init.headers) {
      finalInit.headers = init.headers;
    }

    // Agregar CSRF token para fetch
    const method = finalInit.method?.toLowerCase() || 'get';
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const token = await getCsrfToken();
      if (token) {
        if (finalInit.headers instanceof Headers) {
          finalInit.headers.set('X-CSRF-Token', token);
        } else {
          finalInit.headers = {
            ...finalInit.headers,
            'X-CSRF-Token': token,
          };
        }
      }
    }

    try {
      const response = await originalFetch(input, finalInit);
      
      if (response.status === 401) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const isProfileCheck = url.includes('/auth/profile');

        // Solo redirigir si estamos en una ruta que REQUIERE estar logueado
        const protectedRoutes = ['/perfil', '/admin', '/compras', '/evaluation', '/certificados'];
        const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));

        if (!isProfileCheck && isProtectedRoute && !window.location.pathname.includes('/login')) {
            console.warn('Sesión expirada o no válida en ruta protegida. Redirigiendo...');
            window.location.href = '/login?expired=true';
        }
      }

      // IMPORTANTE: Si es 403 por CSRF, limpiar el token local para forzar regeneración
      if (response.status === 403) {
        const clonedRes = response.clone();
        try {
          const data = await clonedRes.json();
          if (data?.message?.includes('CSRF') || data?.message?.includes('token')) {
            console.warn('Error de CSRF detectado en Fetch. Limpiando token...');
            csrfToken = null; 
          }
        } catch (e) {
          // Si no es JSON, ignorar
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  };
};


