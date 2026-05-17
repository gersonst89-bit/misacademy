# MIS Academy Platform — Frontend

Frontend moderno construido con **React**, **Vite** y **TailwindCSS**. Diseñado para ofrecer una experiencia premium "Urban SaaS".

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y configura la URL de la API.
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 🔐 Seguridad y Sesión

Este frontend utiliza un enfoque de seguridad avanzado:

- **HttpOnly Cookies:** El token JWT ya no se almacena en `localStorage`. El servidor lo gestiona mediante cookies seguras, lo que elimina el riesgo de robo de tokens vía scripts maliciosos (XSS).
- **CSRF Protection:** Todas las peticiones mutables (POST, PUT, DELETE) incluyen automáticamente un header `X-CSRF-Token` gestionado por nuestros interceptores globales.
- **Persistent Progress:** El progreso de las evaluaciones se sincroniza automáticamente con el servidor y se respalda en `localStorage` (sin datos sensibles).

## 📁 Estructura del Proyecto

- `src/admin`: Módulos de gestión administrativa.
- `src/Components`: Componentes UI reutilizables y secciones del sitio.
- `src/config`: Interceptores de red y configuración global.
- `src/store`: Gestión de estado global con Redux.

## 🎨 Diseño

El diseño sigue una estética "Urban SaaS" con:
- Glassmorphism y fondos dinámicos.
- Tipografía moderna (Outfit/Inter).
- Micro-animaciones fluidas con Framer Motion.

## 📜 Licencia

MIS Academy — Todos los derechos reservados.
