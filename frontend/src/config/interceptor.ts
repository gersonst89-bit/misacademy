import axios from 'axios';

/**
 * Interceptor Global para Axios y Fetch.
 * Maneja sesión automática con refresh token.
 */

// 🔥 CONTROL DE REFRESH
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(null);
        }
    });
    failedQueue = [];
};

export const setupGlobalInterceptors = () => {
    // 🔹 AXIOS REQUEST
    axios.interceptors.request.use((config) => {
        config.withCredentials = true;
        return config;
    });

    // 🔹 AXIOS RESPONSE (🔥 AQUÍ ESTÁ LA MAGIA)
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (!error.response) {
                return Promise.reject(error);
            }

            // ❌ Si no es 401 → error normal
            if (error.response.status !== 401) {
                return Promise.reject(error);
            }

            // ⚠️ evitar loop infinito
            if (originalRequest._retry) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // ❌ NO intentar refresh en login o refresh
            if (
                originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/refresh')
            ) {
                return Promise.reject(error);
            }

            // 🔒 Si ya se está refrescando → esperar
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axios(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                // 🔥 LLAMADA CLAVE
                await axios.post('/auth/refresh', {}, { withCredentials: true });

                processQueue(null);

                return axios(originalRequest);

            } catch (err) {
                processQueue(err);

                // 🔴 refresh falló → sesión expirada
                window.location.href = '/login?expired=true';

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
    );

    // 🔹 FETCH (opcional pero alineado)
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
        const finalInit: RequestInit = {
            ...(init || {}),
            credentials: 'include' as RequestCredentials,
        };

        try {
            let response = await originalFetch(input, finalInit);

            // 🔥 Manejo de 401 con refresh
            if (response.status === 401) {
                try {
                    await axios.post('/auth/refresh', {}, { withCredentials: true });

                    // 🔁 Reintentar request
                    response = await originalFetch(input, finalInit);
                } catch {
                    window.location.href = '/login?expired=true';
                }
            }

            return response;

        } catch (error) {
            throw error;
        }
    };
};