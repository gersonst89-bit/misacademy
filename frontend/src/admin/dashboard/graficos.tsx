import { useEffect, useState } from 'react';

import KPI from './Components/KPI';
import EstudiantesLineaAcademica from './Components/EstudiantesLineaAcademica';
import RetencionMensual from './Components/RetencionMensual';
import CursosMasVendidos from './Components/CursosMasVendidos';
import ModernD3Chart from './Components/ModernD3Chart';
import InscripcionesRecientes from './Components/InscripcionesRecientes';
import AccionesRapidas from './Components/AccionesRapidas';
import EstadoSistema from './Components/EstadoSistema';

import { apiClient } from '../../services/apiClient';

interface CursoMasVendido {
  id_curso: number;
  nombre_curso: string;
  imagen: string;
  precio: string;
  total_ventas: number;
  nombre?: string;
  Cantidad?: number;
}

interface LineaAcademica {
  name: string;
  Cantidad: number;
  value?: number;
}

interface RetencionData {
  mes_actual: string;
  porcentaje_retencion: string;
  hay_datos: boolean;
  estudiantes_mes_anterior: number;
  estudiantes_retenidos: number;
}

interface EstudiantePorMes {
  mes: string;
  total_estudiantes: number;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-12 h-12 animate-spin" />

      <div className="absolute border-4 border-sky-900 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150" />
    </div>
  </div>
);

export function Dashboard() {
  // =====================================================
  // ESTADOS KPI
  // =====================================================

  const [usuariosTotales, setUsuariosTotales] = useState(0);
  const [estudiantesTotales, setEstudiantesTotales] = useState(0);
  const [cursosTotales, setCursosTotales] = useState(0);
  const [certificadosTotales, setCertificadosTotales] = useState(0);
  const [ingresosTotales, setIngresosTotales] = useState(0);

  // =====================================================
  // ESTUDIANTES POR MES
  // =====================================================

  const [estudiantesPorMes, setEstudiantesPorMes] = useState<EstudiantePorMes[]>([]);

  // =====================================================
  // ESTUDIANTES POR LÍNEA
  // =====================================================

  const [lineasAcademicas, setLineasAcademicas] = useState<LineaAcademica[]>([]);

  // =====================================================
  // RETENCIÓN
  // =====================================================

  const [retencionMensual, setRetencionMensual] = useState<RetencionData | null>(null);

  // =====================================================
  // CURSOS MÁS VENDIDOS
  // =====================================================

  const [cursosMasVendidos, setCursosMasVendidos] = useState<CursoMasVendido[]>([]);

  // =====================================================
  // ACTIVIDAD RECIENTE
  // =====================================================

  const [inscripcionesRecientes, setInscripcionesRecientes] = useState<any[]>([]);

  // =====================================================
  // ESTADOS DE CARGA
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // CARGAR / ACTUALIZAR DASHBOARD
  // =====================================================

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [dashboardRes, lineasRes, retencionRes, ventasRes, estudiantesPorMesRes] =
        await Promise.all([
          apiClient.get('/estadisticas/dashboard'),
          apiClient.get('/estadisticas/estudiantes/por-linea'),
          apiClient.get('/estadisticas/usuarios/retencion-mensual'),
          apiClient.get('/estadisticas/cursos/mas-vendidos-mes'),
          apiClient.get('/estadisticas/estudiantes/por-mes'),
        ]);

      const dashboardData = dashboardRes.data || {};
      const lineasData = lineasRes.data || {};
      const retencionData = retencionRes.data || {};
      const ventasData = ventasRes.data || {};
      const estudiantesPorMesData = estudiantesPorMesRes.data || {};

      // =====================================================
      // KPIs
      // =====================================================

      setUsuariosTotales(Number(dashboardData.totalUsuarios) || 0);

      setEstudiantesTotales(Number(dashboardData.totalEstudiantes) || 0);

      setCursosTotales(Number(dashboardData.totalCursos) || 0);

      setCertificadosTotales(Number(dashboardData.totalCertificados) || 0);

      setIngresosTotales(Number(dashboardData.ingresoTotal) || 0);

      // =====================================================
      // ACTIVIDAD RECIENTE
      // =====================================================

      setInscripcionesRecientes(dashboardData.inscripcionesRecientes || []);

      // =====================================================
      // ESTUDIANTES INSCRITOS POR MES
      // =====================================================

      if (
        estudiantesPorMesData.status === 'success' &&
        Array.isArray(estudiantesPorMesData.estudiantes_por_mes)
      ) {
        setEstudiantesPorMes(
          estudiantesPorMesData.estudiantes_por_mes.map((item: EstudiantePorMes) => ({
            mes: item.mes,
            total_estudiantes: Number(item.total_estudiantes) || 0,
          })),
        );
      } else {
        setEstudiantesPorMes([]);
      }

      // =====================================================
      // ESTUDIANTES POR LÍNEA ACADÉMICA
      // =====================================================

      const hasRealLineas =
        lineasData.status === 'success' &&
        Array.isArray(lineasData.lineas_academicas) &&
        lineasData.lineas_academicas.length > 0;

      if (hasRealLineas) {
        setLineasAcademicas(
          lineasData.lineas_academicas.map((linea: any) => ({
            name: linea.nombre_linea,
            Cantidad: Number(linea.total_estudiantes) || 0,
            value: Number(linea.total_estudiantes) || 0,
          })),
        );
      } else {
        setLineasAcademicas([]);
      }

      // =====================================================
      // RETENCIÓN MENSUAL
      // =====================================================

      if (retencionData.status === 'success') {
        setRetencionMensual({
          mes_actual: retencionData.mes_actual || '',
          porcentaje_retencion: retencionData.porcentaje_retencion || '0%',
          hay_datos: retencionData.hay_datos ?? false,
          estudiantes_mes_anterior: Number(retencionData.estudiantes_mes_anterior) || 0,
          estudiantes_retenidos: Number(retencionData.estudiantes_retenidos) || 0,
        });
      } else {
        setRetencionMensual(null);
      }

      // =====================================================
      // CURSOS MÁS VENDIDOS
      // =====================================================

      const hasVentas =
        ventasData.status === 'success' &&
        Array.isArray(ventasData.cursos_mas_vendidos) &&
        ventasData.cursos_mas_vendidos.length > 0;

      if (hasVentas) {
        setCursosMasVendidos(
          ventasData.cursos_mas_vendidos.map((curso: any) => ({
            ...curso,
            nombre: curso.nombre_curso,
            Cantidad: Number(curso.total_ventas) || 0,
          })),
        );
      } else {
        setCursosMasVendidos([]);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);

      setError('No se pudieron cargar todos los datos del dashboard. Verifique su conexión.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING INICIAL
  // =====================================================

  if (loading) {
    return <LoadingSpinner />;
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="space-y-6 lg:space-y-7 animate-fadeIn">
      {/* ===================================================
          ENCABEZADO
      ==================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="
              text-2xl
              font-black
              text-[#0E1C2B]
              tracking-tight
            "
          >
            Vista General
          </h2>

          <p className="text-gray-500 text-sm">Consulta el rendimiento actual de tu academia.</p>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="
              flex
              items-center
              gap-2
              bg-white
              px-4
              py-2
              rounded-xl
              text-sm
              font-bold
              text-gray-600
              border
              border-gray-200
              hover:bg-gray-50
              hover:border-gray-300
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition-all
              shadow-sm
            "
          >
            {refreshing && (
              <span
                className="
                  w-3.5
                  h-3.5
                  rounded-full
                  border-2
                  border-slate-300
                  border-t-sky-500
                  animate-spin
                "
              />
            )}

            {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
        </div>
      </div>

      {/* ===================================================
          ERROR
      ==================================================== */}
      {error && (
        <div
          className="
            bg-amber-50
            border
            border-amber-200
            text-amber-700
            px-5
            py-3.5
            rounded-2xl
            flex
            items-center
            gap-3
            text-sm
          "
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ===================================================
          KPI
      ==================================================== */}
      <div className="-mt-1">
        <KPI
          usuariosTotales={usuariosTotales}
          cursosTotales={cursosTotales}
          certificadosTotales={certificadosTotales}
          ingresosTotales={ingresosTotales}
        />
      </div>

      {/* ===================================================
          PRIMERA FILA
          50% / 50%
      ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {/* Estudiantes inscritos */}
        <div
          className="
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <ModernD3Chart
            title="Estudiantes Inscritos"
            data={estudiantesPorMes.map((item) => ({
              label: item.mes,
              value: item.total_estudiantes,
            }))}
          />
        </div>

        {/* Retención */}
        <div
          className="
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <RetencionMensual retencionMensual={retencionMensual} />
        </div>
      </div>

      {/* ===================================================
          SEGUNDA FILA
          1/3 + 2/3
      ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Estudiantes por línea */}
        <div
          className="
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <EstudiantesLineaAcademica lineasAcademicas={lineasAcademicas} />
        </div>

        {/* Cursos más vendidos */}
        <div
          className="
            lg:col-span-2
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <CursosMasVendidos cursosMasVendidos={cursosMasVendidos} />
        </div>
      </div>

      {/* ===================================================
          TERCERA FILA
          1/3 + 1/3 + 1/3
      ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Actividad reciente */}
        <div
          className="
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <InscripcionesRecientes inscripciones={inscripcionesRecientes} />
        </div>

        {/* Acciones rápidas */}
        <div
          className="
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <AccionesRapidas />
        </div>

        {/* Estado del sistema */}
        <div
          className="
            bg-white
            p-5
            md:p-7
            rounded-[1.5rem]
            md:rounded-[2rem]
            shadow-sm
            border
            border-slate-200/70
          "
        >
          <EstadoSistema />
        </div>
      </div>
    </div>
  );
}
