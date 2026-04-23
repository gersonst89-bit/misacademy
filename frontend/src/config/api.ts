/**
 * Configuración centralizada de la API
 */
export const API_URL = import.meta.env.VITE_API_URL;

/**
 * URL base del servidor (sin /api)
 * Para imágenes, archivos estáticos, etc.
 */
export const BASE_URL = API_URL?.replace(/\/api\/?$/, '') || '';

/**
 * Helper para construir URLs de la API
 * @example apiUrl('/auth/profile') // => 'https://misacademy.siteedufuture.xyz/api/auth/profile'
 */
export const apiUrl = (path: string) => {
  // Eliminar slash inicial si existe para evitar duplicados
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
};
