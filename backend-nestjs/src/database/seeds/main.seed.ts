import { DataSource } from 'typeorm';
import { Curso } from '../../entities/curso.entity';
import { Modulo } from '../../entities/modulo.entity';
import { Leccion } from '../../entities/leccion.entity';

export async function seedMain(dataSource: DataSource): Promise<void> {
    const cursoRepo = dataSource.getRepository(Curso);
    const moduloRepo = dataSource.getRepository(Modulo);
    const leccionRepo = dataSource.getRepository(Leccion);

    console.log('💉 Iniciando inyección MAESTRA de contenidos en MIS DEV...');

    const contenidoAInyectar = [
        {
            nombreCurso: 'Fundamentos de Desarrollo Web',
            modulos: [
                { titulo: 'Módulo 1: Estructura (HTML5)', lecciones: ['Anatomía de una web y SEO', 'Formularios avanzados', 'Multimedia y Accesibilidad'] },
                { titulo: 'Módulo 2: Estilos (CSS3)', lecciones: ['Modelo de Caja y Flexbox', 'CSS Grid Layout', 'Diseño Responsivo Pro'] },
                { titulo: 'Módulo 3: Lógica (JavaScript)', lecciones: ['Variables y Tipos', 'DOM y Eventos', 'Asincronismo y API Fetch'] },
                { titulo: 'Módulo 4: Herramientas', lecciones: ['Git y GitHub Flow', 'Terminal y Comandos', 'NPM y Paquetes'] }
            ]
        },
        {
            nombreCurso: 'Frontend con React y Tailwind',
            modulos: [
                { titulo: 'Módulo 1: React Moderno', lecciones: ['Componentes y Props', 'Hooks: State y Effect', 'Custom Hooks Pro'] },
                { titulo: 'Módulo 2: Estilos con Tailwind', lecciones: ['Filosofía Utility-First', 'Layouts y Animaciones', 'Dark Mode dinámico'] },
                { titulo: 'Módulo 3: Estado y Rutas', lecciones: ['React Router Pro', 'Context API vs Redux', 'Manejo de Formularios'] },
                { titulo: 'Módulo 4: Despliegue', lecciones: ['Consumo de APIs Reales', 'Optimización (Memo)', 'Deploy en Vercel'] }
            ]
        },
        {
            nombreCurso: 'Backend con NestJS y TypeORM',
            modulos: [
                { titulo: 'Módulo 1: Arquitectura Nest', lecciones: ['Módulos y Controladores', 'Servicios e Inyección', 'Middleware y Filters'] },
                { titulo: 'Módulo 2: Base de Datos', lecciones: ['Configurando TypeORM', 'Entidades y Relaciones', 'Query Builder Avanzado'] },
                { titulo: 'Módulo 3: Seguridad', lecciones: ['JWT y Passport', 'Validación con DTOs', 'Guards y Roles'] },
                { titulo: 'Módulo 4: Producción', lecciones: ['Documentación Swagger', 'Dockerización de API', 'CI/CD para Backend'] }
            ]
        },
        {
            nombreCurso: 'Fundamentos de React Native',
            modulos: [
                { titulo: 'Módulo 1: Setup y Core', lecciones: ['Expo vs CLI', 'Componentes Core', 'Listas: FlatList'] },
                { titulo: 'Módulo 2: Estilos Mobile', lecciones: ['StyleSheet y Flexbox', 'Dimensiones y Layout', 'Librerías de UI'] },
                { titulo: 'Módulo 3: Interacción', lecciones: ['Pressables y Gestos', 'TextInputs y Formas', 'Animaciones básicas'] },
                { titulo: 'Módulo 4: Native Features', lecciones: ['Cámara y Galería', 'Geolocalización', 'Async Storage'] }
            ]
        },
        {
            nombreCurso: 'Navegación y Estado en Apps Móviles',
            modulos: [
                { titulo: 'Módulo 1: React Navigation', lecciones: ['Stack y Tabs', 'Drawer y Navegación Anidada', 'Deep Linking'] },
                { titulo: 'Módulo 2: Estado Global', lecciones: ['Context en Mobile', 'Redux Toolkit para Apps', 'Persistencia de Datos'] },
                { titulo: 'Módulo 3: Feedback Visual', lecciones: ['Modals y Overlays', 'Toasts y Alertas', 'Skeleton Screens'] },
                { titulo: 'Módulo 4: Notificaciones', lecciones: ['Push Notifications locales', 'Firebase Cloud Messaging', 'Ciclo de vida en background'] }
            ]
        },
        {
            nombreCurso: 'Publicación en App Store y Play Store',
            modulos: [
                { titulo: 'Módulo 1: Branding y Assets', lecciones: ['Iconos y Splash Screens', 'Capturas para Tiendas', 'Políticas de Privacidad'] },
                { titulo: 'Módulo 2: Google Play Store', lecciones: ['Consola de Desarrollador', 'Generación de AAB', 'Lanzamiento a Producción'] },
                { titulo: 'Módulo 3: Apple App Store', lecciones: ['Certificados y Perfiles', 'TestFlight y Beta Testing', 'Revisión y Aprobación'] },
                { titulo: 'Módulo 4: Mantenimiento', lecciones: ['OTA Updates con Expo', 'Monitoreo con Sentry', 'Estrategias ASO'] }
            ]
        },
        {
            nombreCurso: 'Contenedores: Docker y Kubernetes',
            modulos: [
                { titulo: 'Módulo 1: Docker Core', lecciones: ['Imágenes y Contenedores', 'Docker Compose', 'Redes y Volúmenes'] },
                { titulo: 'Módulo 2: K8s Fundamentals', lecciones: ['Pods y Deployments', 'Services y Load Balancers', 'ConfigMaps y Secrets'] },
                { titulo: 'Módulo 3: K8s Advanced', lecciones: ['Ingress Controllers', 'HPA: Auto-scaling', 'StatefulSets'] },
                { titulo: 'Módulo 4: Cloud K8s', lecciones: ['AWS EKS / Azure AKS', 'Monitoreo con Prometheus', 'CI/CD con Kubernetes'] }
            ]
        },
        {
            nombreCurso: 'Microservicios con Node.js',
            modulos: [
                { titulo: 'Módulo 1: Patrones de Diseño', lecciones: ['Monolito vs Microservicios', 'Comunicación REST', 'API Gateways'] },
                { titulo: 'Módulo 2: Mensajería', lecciones: ['RabbitMQ / Kafka', 'Event-Driven Arch', 'Pub/Sub Patterns'] },
                { titulo: 'Módulo 3: Resiliencia', lecciones: ['Circuit Breakers', 'Retries y Timeouts', 'Health Checks'] },
                { titulo: 'Módulo 4: Observabilidad', lecciones: ['Distributed Tracing', 'Logs Centralizados', 'Métricas de Servicio'] }
            ]
        },
        {
            nombreCurso: 'Serverless y Cloud Architecture (AWS)',
            modulos: [
                { titulo: 'Módulo 1: AWS Lambda', lecciones: ['Funciones como Servicio', 'API Gateway Integración', 'Serverless Framework'] },
                { titulo: 'Módulo 2: Cloud Storage/DB', lecciones: ['S3 y Eventos', 'DynamoDB NoSQL', 'Lambda Triggers'] },
                { titulo: 'Módulo 3: Infra as Code', lecciones: ['AWS CDK / Terraform', 'Gestión de Entornos', 'Seguridad IAM'] },
                { titulo: 'Módulo 4: Monitoring/Costs', lecciones: ['CloudWatch Logs', 'X-Ray Tracing', 'Optimización de Costos'] }
            ]
        },
        {
            nombreCurso: 'Hacking Ético Avanzado',
            modulos: [
                { titulo: 'Módulo 1: Reconocimiento y Enumeración Avanzada', lecciones: ['Técnicas de Reconocimiento Pasivo', 'Escaneo de Puertos y Servicios con Nmap', 'Enumeración de Directorios y Subdominios'] },
                { titulo: 'Módulo 2: Explotación de Vulnerabilidades y Post-Explotación', lecciones: ['Uso avanzado de Metasploit', 'Inyección de Código y Pivoting', 'Escalada de Privilegios en Windows y Linux'] },
                { titulo: 'Módulo 3: Seguridad en Redes Inalámbricas y Móviles', lecciones: ['Cracking de WPA2/WPA3', 'Ataques a Dispositivos Bluetooth', 'Seguridad en Aplicaciones Android e iOS'] },
                { titulo: 'Módulo 4: Auditoría de Aplicaciones Web y APIs', lecciones: ['Explotación de OWASP Top 10', 'Bypass de WAF', 'Pentesting de APIs con Postman y Burp Suite'] }
            ]
        },
        {
            nombreCurso: 'Fundamentos de Ciberseguridad',
            modulos: [
                { titulo: 'Módulo 1: Introducción al Ecosistema de la Ciberseguridad', lecciones: ['Historia y Conceptos Clave', 'Tipos de Amenazas y Atacantes', 'El Triángulo de la CIA'] },
                { titulo: 'Módulo 2: Protección de Identidad y Acceso', lecciones: ['Autenticación Multi-factor (MFA)', 'Gestión de Contraseñas y Biometría', 'Control de Acceso Basado en Roles (RBAC)'] },
                { titulo: 'Módulo 3: Seguridad de Redes y Sistemas Operativos', lecciones: ['Configuración de Firewalls y VPNs', 'Endpoints y Antivirus Modernos', 'Aseguramiento de Sistemas Windows y Linux'] },
                { titulo: 'Módulo 4: Gestión de Incidentes y Cumplimiento', lecciones: ['Ciclo de Vida de un Incidente', 'Introducción a ISO 27001', 'Ética y Legislación'] }
            ]
        },
        // --- MIS TEACHER COURSES ---
        {
            nombreCurso: 'Fundamentos de IA para el Aula',
            modulos: [
                { titulo: 'Módulo 1: Introducción a la IA Educativa', lecciones: ['¿Qué es la IA?', 'Historia de la IA en Educación', 'Ética y Responsabilidad'] },
                { titulo: 'Módulo 2: Herramientas Básicas', lecciones: ['Prompt Engineering para Docentes', 'Uso de Modelos de Lenguaje', 'Asistentes Virtuales'] },
                { titulo: 'Módulo 3: Aplicaciones Prácticas', lecciones: ['Personalización del Aprendizaje', 'Inclusión Educativa con IA', 'Futuro de la IA'] }
            ]
        },
        {
            nombreCurso: 'Generación de Material Didáctico con IA',
            modulos: [
                { titulo: 'Módulo 1: Creación de Contenido Visual', lecciones: ['Imágenes Educativas con IA', 'Diseño de Presentaciones', 'Infografías Automáticas'] },
                { titulo: 'Módulo 2: Contenido Escrito', lecciones: ['Redacción de Guías', 'Creación de Historias Educativas', 'Traducción de Contenidos'] },
                { titulo: 'Módulo 3: Video y Multimedia', lecciones: ['Avatares Parlantes', 'Subtitulado Automático', 'Edición Ágil'] }
            ]
        },
        {
            nombreCurso: 'Evaluación Automatizada y Chatbots Educativos',
            modulos: [
                { titulo: 'Módulo 1: Sistemas de Evaluación', lecciones: ['Cuestionarios Inteligentes', 'Feedback Instantáneo', 'Análisis de Resultados'] },
                { titulo: 'Módulo 2: Chatbots en el Aula', lecciones: ['Configuración de Chatbots', 'Tutoría Automatizada', 'Soporte 24/7'] },
                { titulo: 'Módulo 3: Integración Avanzada', lecciones: ['APIs para Educación', 'Seguridad de Datos', 'Casos de Éxito'] }
            ]
        },
        {
            nombreCurso: 'Liderazgo Docente y Comunicación Efectiva',
            modulos: [
                { titulo: 'Módulo 1: Autoliderazgo', lecciones: ['Inteligencia Emocional', 'Gestión del Estrés', 'Marca Personal Docente'] },
                { titulo: 'Módulo 2: Comunicación Asertiva', lecciones: ['Escucha Activa', 'Comunicación No Verbal', 'Hablar en Público'] },
                { titulo: 'Módulo 3: Liderazgo de Equipos', lecciones: ['Trabajo Colaborativo', 'Motivación Estudiantil', 'Liderazgo Situacional'] }
            ]
        },
        {
            nombreCurso: 'Neuroeducación y Clima Escolar',
            modulos: [
                { titulo: 'Módulo 1: El Cerebro que Aprende', lecciones: ['Plasticidad Cerebral', 'Atención y Memoria', 'El Papel de las Emociones'] },
                { titulo: 'Módulo 2: Clima en el Aula', lecciones: ['Entornos de Confianza', 'Gestión de la Diversidad', 'Prevención del Bullying'] },
                { titulo: 'Módulo 3: Estrategias Neurodidácticas', lecciones: ['Movimiento y Aprendizaje', 'Aprendizaje Basado en el Juego', 'Descansos Cerebrales'] }
            ]
        },
        {
            nombreCurso: 'Disciplina Positiva y Resolución de Conflictos',
            modulos: [
                { titulo: 'Módulo 1: Fundamentos de Disciplina Positiva', lecciones: ['Criterios de Firmeza y Cariño', 'Conexión antes que Corrección', 'Mensajes de Aliento'] },
                { titulo: 'Módulo 2: Resolución de Conflictos', lecciones: ['Mediación Escolar', 'Enfoque en Soluciones', 'Reuniones de Aula'] },
                { titulo: 'Módulo 3: Habilidades para la Vida', lecciones: ['Empatía y Respeto', 'Autocontrol', 'Toma de Decisiones'] }
            ]
        },
        {
            nombreCurso: 'Planificación Curricular por Competencias',
            modulos: [
                { titulo: 'Módulo 1: Diseño Inverso', lecciones: ['Resultados de Aprendizaje', 'Evidencias de Desempeño', 'Secuencias Didácticas'] },
                { titulo: 'Módulo 2: Evaluación por Competencias', lecciones: ['Criterios e Indicadores', 'Niveles de Logro', 'Instrumentos de Evaluación'] },
                { titulo: 'Módulo 3: Flexibilidad Curricular', lecciones: ['Adaptaciones Curriculares', 'Proyectos Transversales', 'Innovación Curricular'] }
            ]
        },
        {
            nombreCurso: 'Metodologías Activas: Gamificación y ABP',
            modulos: [
                { titulo: 'Módulo 1: Gamificación Educativa', lecciones: ['Mecánicas y Dinámicas', 'Elementos de Juego', 'Diseño de Misiones'] },
                { titulo: 'Módulo 2: Aprendizaje Basado en Proyectos (ABP)', lecciones: ['La Pregunta Desafiante', 'Investigación y Producto Final', 'Evaluación en ABP'] },
                { titulo: 'Módulo 3: Aprendizaje-Servicio', lecciones: ['Conexión con la Comunidad', 'Impacto Social', 'Reflexión Crítica'] }
            ]
        },
        {
            nombreCurso: 'Evaluación Formativa y Diseño de Rúbricas',
            modulos: [
                { titulo: 'Módulo 1: Enfoque Formativo', lecciones: ['Evaluación vs Calificación', 'Autoevaluación y Coevaluación', 'Retroalimentación Efectiva'] },
                { titulo: 'Módulo 2: Diseño de Rúbricas', lecciones: ['Rúbricas Analíticas', 'Rúbricas Holísticas', 'Descriptores de Nivel'] },
                { titulo: 'Módulo 3: Instrumentos Alternativos', lecciones: ['Portafolios Digitales', 'Listas de Cotejo', 'Diarios de Aprendizaje'] }
            ]
        },
        {
            nombreCurso: 'Algoritmos de Machine Learning Supervisado',
            modulos: [
                { titulo: 'Módulo 1: Fundamentos de ML', lecciones: ['Introducción al Aprendizaje Supervisado', 'Preprocesamiento de Datos', 'Métricas de Evaluación'] },
                { titulo: 'Módulo 2: Modelos de Regresión', lecciones: ['Regresión Lineal Simple', 'Regresión Múltiple', 'Regularización L1 y L2'] },
                { titulo: 'Módulo 3: Modelos de Clasificación', lecciones: ['Regresión Logística', 'Árboles de Decisión', 'Random Forest y Boosting'] },
                { titulo: 'Módulo 4: Validación y Tuning', lecciones: ['Cross-Validation', 'Hyperparameter Tuning', 'Despliegue de Modelos de ML'] }
            ]
        },
        {
            nombreCurso: 'Despliegue y Arquitectura Cloud',
            modulos: [
                { titulo: 'Módulo 1: Fundamentos de Cloud', lecciones: ['Modelos de Servicio (IaaS, PaaS, SaaS)', 'Principales Proveedores (AWS, Azure, GCP)', 'Seguridad en la Nube'] },
                { titulo: 'Módulo 2: Estrategias de Despliegue', lecciones: ['CI/CD Pipelines', 'Blue-Green Deployment', 'Canary Releases'] },
                { titulo: 'Módulo 3: Infraestructura como Código', lecciones: ['Introducción a Terraform', 'Configuración con Ansible', 'Gestión de Costos Cloud'] },
                { titulo: 'Módulo 4: Alta Disponibilidad', lecciones: ['Escalado Horizontal y Vertical', 'Balanceo de Carga Avanzado', 'Disaster Recovery Plans'] }
            ]
        },
        {
            nombreCurso: 'Python para Ciencia de Datos',
            modulos: [
                { titulo: 'Módulo 1: Python Avanzado', lecciones: ['List Comprehensions', 'Manejo de Errores', 'Programación Orientada a Objetos'] },
                { titulo: 'Módulo 2: Librerías Científicas', lecciones: ['NumPy para Álgebra Lineal', 'Pandas para Manipulación de Datos', 'Visualización con Matplotlib y Seaborn'] },
                { titulo: 'Módulo 3: Análisis Exploratorio (EDA)', lecciones: ['Limpieza de Datos', 'Análisis Estadístico', 'Detección de Outliers'] },
                { titulo: 'Módulo 4: Proyecto Final de Datos', lecciones: ['Web Scraping básico', 'Automatización de Reportes', 'Presentación de Insights'] }
            ]
        },
        {
            nombreCurso: 'Deep Learning y Redes Neuronales',
            modulos: [
                { titulo: 'Módulo 1: Introducción a Redes Neuronales', lecciones: ['Perceptrón y Funciones de Activación', 'Backpropagation', 'Optimización y Gradiente Descendiente'] },
                { titulo: 'Módulo 2: Arquitecturas Modernas', lecciones: ['Redes Neuronales Convolucionales (CNN)', 'Redes Recurrentes (RNN)', 'Introducción a Transformers'] },
                { titulo: 'Módulo 3: Computer Vision', lecciones: ['Clasificación de Imágenes', 'Detección de Objetos', 'Segmentación Semántica'] },
                { titulo: 'Módulo 4: NLP y Generación', lecciones: ['Procesamiento de Lenguaje Natural', 'Modelos Generativos (GANs)', 'Transfer Learning'] }
            ]
        }
    ];

    for (const item of contenidoAInyectar) {
        // Buscamos el curso por nombre (Búsqueda flexible)
        const curso = await cursoRepo.createQueryBuilder('c')
            .where('c.nombre LIKE :nombre', { nombre: `%${item.nombreCurso}%` })
            .getOne();
        
        if (curso) {
            console.log(`🔍 Procesando: ${curso.nombre}`);
            
            // LIMPIEZA: Si ya tenía módulos, los borramos para re-generar limpio
            // (Opcional: puedes comentar esto si prefieres no borrar nada previo)
            const modulosAntiguos = await moduloRepo.find({ where: { id_curso: curso.id_curso } });
            if (modulosAntiguos.length > 0) {
                const idsMod = modulosAntiguos.map(m => m.id_modulo);
                await leccionRepo.createQueryBuilder().delete().where('id_modulo IN (:...idsMod)', { idsMod }).execute();
                await moduloRepo.delete({ id_curso: curso.id_curso });
                console.log(`  🗑️ Módulos antiguos eliminados para re-sincronizar.`);
            }

            for (const [mIdx, mData] of item.modulos.entries()) {
                const modulo = moduloRepo.create({
                    id_curso: curso.id_curso,
                    titulo: mData.titulo,
                    orden: mIdx + 1,
                    estado: 'Publicado'
                });
                await moduloRepo.save(modulo);

                for (const [lIdx, lTitle] of mData.lecciones.entries()) {
                    const leccion = leccionRepo.create({
                        id_modulo: modulo.id_modulo,
                        titulo: lTitle,
                        orden: lIdx + 1,
                        tipo: 'Video',
                        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        estado: 'Publicado',
                        duracion_minutos: 15
                    });
                    await leccionRepo.save(leccion);
                }
            }
            
            // Actualizamos campos de compatibilidad en el curso
            await cursoRepo.update(curso.id_curso, {
                estado: 'Publicado',
                fecha_actualizacion: new Date()
            });

            console.log(`  ✅ Estructura inyectada en "${curso.nombre}"`);
        } else {
            console.warn(`  ⚠️ No se encontró: "${item.nombreCurso}"`);
        }
    }

    console.log('🏁 Sincronización finalizada.');
}
