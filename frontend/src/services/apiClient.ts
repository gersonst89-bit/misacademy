import axios from 'axios';
import { API_URL } from '../config/api';

/**
 * Cliente Axios centralizado y preconfigurado para la API de MIS Academy.
 * Hereda automáticamente los interceptores globales configurados en setupGlobalInterceptors.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
