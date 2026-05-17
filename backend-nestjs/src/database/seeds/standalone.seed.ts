import { DataSource } from 'typeorm';
import { Curso } from '../../entities/curso.entity';
import { Modulo } from '../../entities/modulo.entity';
import { Leccion } from '../../entities/leccion.entity';

export async function seedStandalone(dataSource: DataSource): Promise<void> {
    const cursoRepo = dataSource.getRepository(Curso);
    const moduloRepo = dataSource.getRepository(Modulo);
    const leccionRepo = dataSource.getRepository(Leccion);

    const createSlug = (title: string): string => {
        return title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    console.log('🌟 Iniciando creación de CURSOS LIBRES (Standalone)...');

    const cursosLibres = [
        {
            nombre: 'Inglés Técnico para Profesionales IT',
            descripcion_corta: 'Rompe la barrera del idioma y accede a las mejores oportunidades globales.',
            descripcion_larga: 'Este curso no es para aprender a pedir café; es para aprender a liderar reuniones, leer documentación compleja y negociar tu salario en inglés. Diseñado específicamente para programadores y técnicos.',
            precio: 149.00,
            imagen: 'https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Comprensión de documentación, Comunicación en equipos remotos, Entrevistas técnicas en inglés',
            modulos: [
                { titulo: 'Módulo 1: Comunicación Diaria', lecciones: ['Slack y Correo Profesional', 'Daily Stand-ups en Inglés', 'Reporting de Bugs'] },
                { titulo: 'Módulo 2: Lectura Técnica', lecciones: ['Documentación de APIs', 'StackOverflow y Foros', 'Whitepapers y Blogs'] },
                { titulo: 'Módulo 3: El Proceso de Selección', lecciones: ['CV y LinkedIn en Inglés', 'La Entrevista de Comportamiento', 'Simulacro de Entrevista Técnica'] },
                { titulo: 'Módulo 4: Negociación', lecciones: ['Discutiendo el Salario', 'Explicando Decisiones de Código', 'Feedback y Reviews'] }
            ]
        },
        {
            nombre: 'Taller de Git y GitHub: El Corazón del Desarrollo',
            descripcion_corta: 'Domina el control de versiones y colabora como un profesional.',
            descripcion_larga: 'Deja de tener miedo a los "Merge Conflicts". Aprende desde los fundamentos de Git hasta flujos de trabajo avanzados en GitHub que usan las empresas del Fortune 500.',
            precio: 99.00,
            imagen: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Gestión de ramas, Resolución de conflictos, Git Flow avanzado',
            modulos: [
                { titulo: 'Módulo 1: Fundamentos de Git', lecciones: ['Instalación y Configuración', 'El Ciclo de Vida del Archivo', 'Commits y Mensajes Efectivos'] },
                { titulo: 'Módulo 2: Ramas y Colaboración', lecciones: ['Creación y Cambio de Ramas', 'Merging vs Rebasing', 'Resolución de Conflictos'] },
                { titulo: 'Módulo 3: El Universo GitHub', lecciones: ['Pull Requests Pro', 'Code Reviews Efectivas', 'GitHub Actions Básico'] },
                { titulo: 'Módulo 4: Flujos de Trabajo', lecciones: ['Git Flow', 'Trunk Based Development', 'Stashing y Cherry-picking'] }
            ]
        },
        {
            nombre: 'SCRUM y Metodologías Ágiles para Equipos',
            descripcion_corta: 'Organiza el caos y multiplica la productividad de tu equipo.',
            descripcion_larga: 'Aprende a gestionar proyectos tecnológicos con flexibilidad. Desde la planificación del Sprint hasta la entrega de valor constante al cliente.',
            precio: 129.00,
            imagen: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Roles de Scrum, Ceremonias Ágiles, Estimación de Tareas',
            modulos: [
                { titulo: 'Módulo 1: Mentalidad Ágil', lecciones: ['Manifiesto Ágil', 'Scrum vs Kanban vs Waterfall', 'El Valor de la Iteración'] },
                { titulo: 'Módulo 2: Roles en Scrum', lecciones: ['El Scrum Master', 'El Product Owner', 'El Equipo de Desarrollo'] },
                { titulo: 'Módulo 3: Ceremonias', lecciones: ['Sprint Planning', 'Daily Scrum y Retrospectivas', 'Sprint Review'] },
                { titulo: 'Módulo 4: Artefactos y Herramientas', lecciones: ['Product Backlog', 'User Stories y Estimación', 'Jira y Trello para Scrum'] }
            ]
        },
        {
            nombre: 'SEO y Posicionamiento para Desarrolladores',
            descripcion_corta: 'Haz que tus aplicaciones web sean las reinas de Google.',
            descripcion_larga: 'No es solo marketing. Aprende SEO técnico: Web Vitals, SSR, Metadatos dinámicos y todo lo que un desarrollador debe saber para que su web llegue al top 1.',
            precio: 119.00,
            imagen: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'SEO Técnico, Web Vitals, Estrategia de Contenidos',
            modulos: [
                { titulo: 'Módulo 1: SEO Técnico Básico', lecciones: ['Sitemaps y Robots.txt', 'Arquitectura de URLs', 'Semántica HTML5'] },
                { titulo: 'Módulo 2: Core Web Vitals', lecciones: ['Optimización de Carga (LCP)', 'Interactividad (FID)', 'Estabilidad Visual (CLS)'] },
                { titulo: 'Módulo 3: SEO para Frameworks', lecciones: ['SSR vs Client Side Rendering', 'Next.js SEO Pro', 'Meta Tags Dinámicos'] },
                { titulo: 'Módulo 4: Análisis y Mejora', lecciones: ['Google Search Console', 'Google Analytics 4', 'Auditorías con Lighthouse'] }
            ]
        },
        {
            nombre: 'Finanzas para Freelancers Tecnológicos',
            descripcion_corta: 'Gestiona tus ingresos, ahorra impuestos y construye riqueza.',
            descripcion_larga: 'Ganar dinero es solo la mitad. La otra mitad es saber qué hacer con él. Aprende a presupuestar, facturar internacionalmente e invertir tu capital como profesional tech.',
            precio: 159.00,
            imagen: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Facturación internacional, Inversiones básicas, Gestión de presupuestos',
            modulos: [
                { titulo: 'Módulo 1: Organización Financiera', lecciones: ['Separando Finanzas Personales', 'Presupuesto de Freelancer', 'Fondo de Emergencia'] },
                { titulo: 'Módulo 2: Cobros Internacionales', lecciones: ['Plataformas (Payoneer, Wise)', 'Cripto como método de pago', 'Comisiones y Tasas de Cambio'] },
                { titulo: 'Módulo 3: Impuestos y Legalidad', lecciones: ['Estructuras Legales', 'Declaración de Ingresos', 'Facturación Profesional'] },
                { titulo: 'Módulo 4: Inversión para el Futuro', lecciones: ['Introducción a la Bolsa', 'ETFs para Principiantes', 'Planificación del Retiro'] }
            ]
        },
        {
            nombre: 'Angular: Arquitectura y Desarrollo para Empresas',
            descripcion_corta: 'Domina el framework de Google para aplicaciones empresariales robustas.',
            descripcion_larga: 'Aprende Angular desde los fundamentos hasta patrones avanzados. Descubre cómo usar TypeScript, RxJS y Signals para crear aplicaciones escalables y de alto rendimiento.',
            precio: 169.00,
            imagen: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'RxJS y Programación Reactiva, Gestión de Estado, Inyección de Dependencias Avanzada',
            modulos: [
                { titulo: 'Módulo 1: Core de Angular', lecciones: ['Componentes y Ciclo de Vida', 'Directivas y Pipes', 'Data Binding Avanzado'] },
                { titulo: 'Módulo 2: Reactive Programming', lecciones: ['Observables con RxJS', 'Operadores Imprescindibles', 'Signals: El futuro de Angular'] },
                { titulo: 'Módulo 3: Servicios y APIs', lecciones: ['Inyección de Dependencias', 'HTTP Client y Guards', 'Interceptors de Red'] },
                { titulo: 'Módulo 4: Arquitectura', lecciones: ['Módulos vs Standalone', 'Lazy Loading y Rutas', 'Optimización y Performance'] }
            ]
        },
        {
            nombre: 'Desarrollo de Videojuegos con Unity 3D',
            descripcion_corta: 'Crea tus propios mundos virtuales y lógicas de juego profesionales.',
            descripcion_larga: 'Desde el primer script en C# hasta la publicación de tu juego. Aprende a usar el motor de juegos más popular del mundo para crear experiencias 3D impactantes.',
            precio: 149.00,
            imagen: 'https://images.pexels.com/photos/1251861/pexels-photo-1251861.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Programación en C#, Física en 3D, Animación y Audio',
            modulos: [
                { titulo: 'Módulo 1: El Editor de Unity', lecciones: ['GameObjects y Components', 'Escenas y Assets', 'Transform y Jerarquía'] },
                { titulo: 'Módulo 2: C# Scripting', lecciones: ['Variables y Funciones', 'Inputs y Movimiento', 'Colisiones y Triggers'] },
                { titulo: 'Módulo 3: Gameplay Avanzado', lecciones: ['IA Enemiga Básica', 'Sistemas de Partículas', 'UI y Menús de Juego'] },
                { titulo: 'Módulo 4: Pulido y Exportación', lecciones: ['Iluminación y Skyboxes', 'Optimización de Escenas', 'Compilación para PC y Web'] }
            ]
        },
        {
            nombre: 'Marketing Digital y Marca Personal para Tech',
            descripcion_corta: 'Aprende a vender tus habilidades y atraer mejores oportunidades.',
            descripcion_larga: 'Ser el mejor programador no sirve de nada si nadie te conoce. Aprende estrategias de marketing aplicadas a la tecnología para destacar en el mercado global.',
            precio: 129.00,
            imagen: 'https://images.pexels.com/photos/66100/pexels-photo-66100.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Optimización de LinkedIn, Content Marketing para Devs, Networking Estratégico',
            modulos: [
                { titulo: 'Módulo 1: Marca Personal', lecciones: ['Definiendo tu Nicho Tech', 'LinkedIn para Profesionales', 'Tu Portfolio como Imán de Leads'] },
                { titulo: 'Módulo 2: Marketing de Contenidos', lecciones: ['Escribir Blogs que Atraen', 'Twitter/X para Networking', 'Creación de Videos Técnicos'] },
                { titulo: 'Módulo 3: Growth Hacking IT', lecciones: ['Automatización de Redes', 'Participación en Comunidades', 'Estrategias de Visibilidad'] },
                { titulo: 'Módulo 4: Negociación y Ventas', lecciones: ['Pitch para Reclutadores', 'Vendiendo Proyectos Freelance', 'Gestión de Clientes'] }
            ]
        },
        {
            nombre: 'Diseño de Interfaces (UI/UX) con Figma',
            descripcion_corta: 'Crea prototipos visuales impresionantes antes de escribir una línea de código.',
            descripcion_larga: 'Aprende a pensar como un diseñador. Domina Figma para crear interfaces modernas, intuitivas y que sigan las mejores prácticas de experiencia de usuario.',
            precio: 139.00,
            imagen: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Diseño Responsivo en Figma, Prototipado Animado, Design Systems',
            modulos: [
                { titulo: 'Módulo 1: Fundamentos de UX', lecciones: ['User Persona y Wireframes', 'Arquitectura de Información', 'Accesibilidad Visual'] },
                { titulo: 'Módulo 2: Figma Essentials', lecciones: ['Auto Layout y Grillas', 'Componentes y Variantes', 'Uso de Plugins Pro'] },
                { titulo: 'Módulo 3: Visual Design', lecciones: ['Psicología del Color', 'Tipografía y Jerarquía', 'Iconografía y Assets'] },
                { titulo: 'Módulo 4: Prototipado', lecciones: ['Micro-animaciones', 'Testing con Usuarios', 'Hand-off para Desarrolladores'] }
            ]
        },
        {
            nombre: 'Excel Avanzado para Análisis de Datos',
            descripcion_corta: 'Domina tablas dinámicas, Power Query y macros para tomar decisiones basadas en datos.',
            descripcion_larga: 'Deja de usar Excel como una simple calculadora. Aprende a manipular grandes volúmenes de datos, automatizar reportes complejos y crear dashboards interactivos que impacten en cualquier organización.',
            precio: 119.00,
            imagen: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Fórmulas anidadas, Automatización con Macros, Dashboards Profesionales',
            modulos: [
                { titulo: 'Módulo 1: Fórmulas y Funciones Pro', lecciones: ['Búsquedas avanzadas (BUSCARX)', 'Funciones Lógicas y de Texto', 'Validación de Datos Dinámica'] },
                { titulo: 'Módulo 2: Power Query y ETL', lecciones: ['Conexión a fuentes externas', 'Limpieza y Transformación de Datos', 'Modelado de Datos Básico'] },
                { titulo: 'Módulo 3: Tablas Dinámicas y Visualización', lecciones: ['Segmentación de Datos', 'Gráficos de Dispersión y Mapas', 'Diseño de Dashboards de Alto Impacto'] },
                { titulo: 'Módulo 4: Automatización con VBA', lecciones: ['Introducción a Macros', 'Grabadora de Macros vs Editor', 'Scripts Básicos para Tareas Repetitivas'] }
            ]
        },
        {
            nombre: 'Ciberseguridad Esencial',
            descripcion_corta: 'Protege tus activos digitales y entiende las amenazas del mundo moderno.',
            descripcion_larga: 'En un mundo hiperconectado, la seguridad no es opcional. Aprende a identificar vulnerabilidades, prevenir ataques de ingeniería social y configurar entornos seguros tanto personales como empresariales.',
            precio: 139.00,
            imagen: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Identificación de amenazas, Criptografía básica, Seguridad en redes',
            modulos: [
                { titulo: 'Módulo 1: Fundamentos y Amenazas', lecciones: ['Tipos de Malware', 'Ingeniería Social y Phishing', 'Anatomía de un Ataque'] },
                { titulo: 'Módulo 2: Seguridad en Redes', lecciones: ['Firewalls y VPNs', 'Protocolos Seguros (HTTPS/SSH)', 'Seguridad en Wi-Fi'] },
                { titulo: 'Módulo 3: Gestión de Identidades', lecciones: ['Autenticación de Dos Factores (2FA)', 'Gestores de Contraseñas', 'OAuth y Permisos'] },
                { titulo: 'Módulo 4: Defensa y Respuesta', lecciones: ['Estrategias de Backup', 'Planes de Recuperación ante Desastres', 'Legislación y Ética Digital'] }
            ]
        },
        {
            nombre: 'Hacking Ético desde Cero',
            descripcion_corta: 'Aprende a pensar como un atacante para defenderte mejor.',
            descripcion_larga: 'Descubre el fascinante mundo del Pentesting. Aprende metodologías legales para auditar sistemas, encontrar brechas de seguridad y proponer soluciones técnicas para cerrarlas.',
            precio: 159.00,
            imagen: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
            objetivos: 'Fases del Pentesting, Escaneo de redes, Auditoría web',
            modulos: [
                { titulo: 'Módulo 1: Reconocimiento y OSINT', lecciones: ['Recolección Pasiva de Info', 'Escaneo de Puertos con Nmap', 'Enumeración de Servicios'] },
                { titulo: 'Módulo 2: Vulnerabilidades Web', lecciones: ['Inyección SQL (SQLi)', 'Cross-Site Scripting (XSS)', 'Auditoría con Burp Suite'] },
                { titulo: 'Módulo 3: Explotación de Sistemas', lecciones: ['Metasploit Framework', 'Payloads y Reverse Shells', 'Escalada de Privilegios'] },
                { titulo: 'Módulo 4: Post-Explotación y Reporte', lecciones: ['Persistencia en el Objetivo', 'Borrado de Huellas Digitales', 'Redacción de Informes Técnicos'] }
            ]
        }
    ];

    for (const data of cursosLibres) {
        let curso = await cursoRepo.findOne({ where: { nombre: data.nombre } });
        
        const cursoData = {
            nombre: data.nombre,
            slug: createSlug(data.nombre),
            id_docente: 3, 
            descripcion_corta: data.descripcion_corta,
            descripcion_larga: data.descripcion_larga,
            objetivos: data.objetivos,
            precio: data.precio,
            imagen: data.imagen,
            nivel: 'Todos los niveles',
            duracion_horas: 15,
            estado: 'Publicado',
            destacado: true,
            fecha_actualizacion: new Date()
        };

        if (!curso) {
            curso = cursoRepo.create({
                ...cursoData,
                fecha_creacion: new Date()
            });
            await cursoRepo.save(curso);
            console.log(`  ➕ Creado: ${curso.nombre}`);

            // Solo creamos módulos y lecciones si el curso es NUEVO
            for (const [mIdx, mData] of data.modulos.entries()) {
                const modulo = moduloRepo.create({
                    id_curso: curso.id_curso,
                    titulo: mData.titulo,
                    orden: mIdx + 1,
                    estado: 'Publicado'
                });
                await moduloRepo.save(modulo);

                for (const [lIdx, lTitle] of mData.lecciones.entries()) {
                    await leccionRepo.save(leccionRepo.create({
                        id_modulo: modulo.id_modulo,
                        titulo: lTitle,
                        orden: lIdx + 1,
                        tipo: 'Video',
                        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        estado: 'Publicado',
                        duracion_minutos: 15
                    }));
                }
            }
        } else {
            // Si el curso ya existe, NO HACEMOS NADA. Respetamos lo que el usuario editó en la web.
            console.log(`  ⏩ Omitido (Ya existe y está protegido): ${curso.nombre}`);
        }
    }
    console.log('🏁 Inyección de cursos libres finalizada.');
}
