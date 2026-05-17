import { useEffect, useState } from "react";
import KPI from "./Components/KPI";
import EstudiantesLineaAcademica from "./Components/EstudiantesLineaAcademica";
import RetencionMensual from "./Components/RetencionMensual";
import CursosMasVendidos from "./Components/CursosMasVendidos";
import ModernD3Chart from "./Components/ModernD3Chart";
import InscripcionesRecientes from "./Components/InscripcionesRecientes";
import AccionesRapidas from "./Components/AccionesRapidas";
import EstadoSistema from "./Components/EstadoSistema";
import { apiUrl } from "../../config/api";

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
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-900 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

export function Dashboard() {
  const [usuariosTotales, setUsuariosTotales] = useState(0);
  const [estudiantesTotales, setEstudiantesTotales] = useState(0);
  const [cursosTotales, setCursosTotales] = useState(0);
  const [certificadosTotales, setCertificadosTotales] = useState(0);
  const [ingresosTotales, setIngresosTotales] = useState(0);

  const [lineasAcademicas, setLineasAcademicas] = useState<LineaAcademica[]>([]);
  const [retencionMensual, setRetencionMensual] = useState<RetencionData | null>(null);
  const [cursosMasVendidos, setCursosMasVendidos] = useState<CursoMasVendido[]>([]);
  const [inscripcionesRecientes, setInscripcionesRecientes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Parallel fetching for performance
        // Fetch consolidated dashboard data
        const dashboardRes = await fetch(apiUrl("/estadisticas/dashboard"), {
        });
        
        const [lineasRes, retencionRes, ventasRes] = await Promise.all([
          fetch(apiUrl("/estadisticas/estudiantes/por-linea"), {}),
          fetch(apiUrl("/estadisticas/usuarios/retencion-mensual"), {}),
          fetch(apiUrl("/estadisticas/cursos/mas-vendidos-mes"), {})
        ]);
        
        const safeJson = async (res: Response) => {
          try {
            if (!res.ok) return {};
            return await res.json();
          } catch {
            return {};
          }
        };

        const [dashboardData, lineasData, retencionData, ventasData] = await Promise.all([
          safeJson(dashboardRes),
          safeJson(lineasRes),
          safeJson(retencionRes),
          safeJson(ventasRes)
        ]);

        // Process KPIs
        setUsuariosTotales(dashboardData.totalUsuarios || 0);
        setEstudiantesTotales(dashboardData.totalEstudiantes || 0);
        setCursosTotales(dashboardData.totalCursos || 0);
        setCertificadosTotales(dashboardData.totalCertificados || 0);
        setIngresosTotales(Number(dashboardData.ingresoTotal) || 0);
        setInscripcionesRecientes(dashboardData.inscripcionesRecientes || []);

        const hasRealLineas = lineasData.status === "success" && (lineasData.lineas_academicas || []).length > 0;
        
        if (hasRealLineas) {
          setLineasAcademicas((lineasData.lineas_academicas || []).map((linea: any) => ({
            name: linea.nombre_linea,
            Cantidad: linea.total_estudiantes ?? 0,
            value: linea.total_estudiantes ?? 0
          })));
        } else {
          setLineasAcademicas([]);
        }

        if (retencionData.status === "success" && retencionData.porcentaje_retencion) {
          setRetencionMensual({
            mes_actual: retencionData.mes_actual,
            porcentaje_retencion: retencionData.porcentaje_retencion,
          });
        } else {
          setRetencionMensual(null);
        }

        if (ventasData.status === "success" && (ventasData.cursos_mas_vendidos || []).length > 0) {
          setCursosMasVendidos((ventasData.cursos_mas_vendidos || []).map((curso: any) => ({
            ...curso,
            nombre: curso.nombre_curso,
            Cantidad: curso.total_ventas,
          })));
        } else {
          setCursosMasVendidos([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("No se pudieron cargar todos los datos del dashboard. Verifique su conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0E1C2B]">Vista General</h2>
          <p className="text-gray-500 text-sm">Monitorea el rendimiento de tu academia en tiempo real.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
          >
            Actualizar Datos
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Main Layout - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* KPI Section - Spans full width */}
        <div className="lg:col-span-3">
          <KPI
            usuariosTotales={usuariosTotales}
            cursosTotales={cursosTotales}
            certificadosTotales={certificadosTotales}
            ingresosTotales={ingresosTotales}
          />
        </div>

        {/* Charts Section */}
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <ModernD3Chart
            title="Estudiantes Activos"
            data={[
              { label: "Total", value: estudiantesTotales },
            ]}
          />
        </div>

        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <RetencionMensual retencionMensual={retencionMensual} />
        </div>

        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <EstudiantesLineaAcademica lineasAcademicas={lineasAcademicas} />
        </div>

        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <CursosMasVendidos cursosMasVendidos={cursosMasVendidos} />
        </div>

        {/* Bottom Operational Section */}
        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <InscripcionesRecientes inscripciones={inscripcionesRecientes} />
        </div>

        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <AccionesRapidas />
        </div>

        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
          <EstadoSistema />
        </div>
      </div>
    </div>
  );
};
