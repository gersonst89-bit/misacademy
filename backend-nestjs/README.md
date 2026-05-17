# MIS Academy Platform — Backend

Backend robusto construido con **NestJS**, **TypeORM** y **MySQL**. Enfocado en seguridad, escalabilidad y una experiencia de aprendizaje fluida.

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y completa los valores.
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run start:dev
   ```

## 🛠️ Base de Datos y Migraciones

Este proyecto utiliza **TypeORM Migrations** para gestionar los cambios en el esquema de la base de datos. `synchronize: true` solo está habilitado en desarrollo.

- **Generar una migración (después de cambiar una entidad):**
  ```bash
  npm run migration:generate
  ```
- **Ejecutar migraciones pendientes:**
  ```bash
  npm run migration:run
  ```
- **Revertir la última migración:**
  ```bash
  npm run migration:revert
  ```

## 🔐 Variables de Entorno (.env)

| Variable | Descripción | Requerido | Defecto |
|----------|-------------|-----------|---------|
| `APP_ENV` | Entorno de ejecución (`development` o `production`) | No | `development` |
| `APP_PORT` | Puerto donde corre el servidor | No | `8000` |
| `DB_HOST` | Host de la base de datos MySQL | Sí | `127.0.0.1` |
| `DB_DATABASE` | Nombre de la base de datos | Sí | `mis_academy` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | Sí | - |
| `CORS_ORIGIN` | Dominios permitidos (separados por coma) | No | `http://localhost:5173` |
| `MAIL_HOST` | Host del servidor SMTP | Sí | - |
| `MAIL_PORT` | Puerto SMTP (465 para SSL, 587 para TLS) | Sí | `465` |

## 🛡️ Seguridad Implementada

- **JWT via HttpOnly Cookies:** Los tokens de sesión no son accesibles mediante JavaScript, mitigando ataques XSS.
- **CSRF Protection:** Todas las peticiones de estado (POST, PUT, DELETE) requieren un header `X-CSRF-Token` válido.
- **Rate Limiting:** Protección contra ataques de fuerza bruta en login y registro.
- **Audit Logging:** Registro automático de todas las operaciones administrativas críticas.

## 📜 Licencia

MIS Academy — Todos los derechos reservados.
