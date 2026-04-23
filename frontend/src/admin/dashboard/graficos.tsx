import { useEffect, useState } from "react";
import KPI from "./components/KPI";
import EstudiantesLineaAcademica from "./components/EstudiantesLineaAcademica";
import RetencionMensual from "./components/RetencionMensual";
import CursosMasVendidos from "./components/CursosMasVendidos";
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
  const [cursosTotales, setCursosTotales] = useState(0);
  const [certificadosTotales, setCertificadosTotales] = useState(0);

  const [lineasAcademicas, setLineasAcademicas] = useState<LineaAcademica[]>(
    []
  );
  const [retencionMensual, setRetencionMensual] =
    useState<RetencionData | null>(null);
  const [cursosMasVendidos, setCursosMasVendidos] = useState<CursoMasVendido[]>(
    []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  if (!token) return <div>Token no encontrado. Por favor inicie sesión.</div>;

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // KPIs
        const usuariosRes = await fetch(
          apiUrl("/admin/usuarios"),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const usuariosData = await usuariosRes.json();
        const estudiantesActivos = usuariosData.data.filter(
          (u: any) => u.id_rol === 2 && u.estado === "Activo"
        );
        setUsuariosTotales(estudiantesActivos.length);

        const cursosRes = await fetch(
          apiUrl("/cursos"),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cursosData = await cursosRes.json();
        setCursosTotales(cursosData.data.length);

        const certificadosRes = await fetch(
          apiUrl("/admin/certificaciones"),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const certificadosData = await certificadosRes.json();
        setCertificadosTotales(certificadosData.data.length);

        // Estudiantes por línea académica
        const lineasRes = await fetch(
          apiUrl("/estadisticas/estudiantes/por-linea"),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const lineasData = await lineasRes.json();
        if (lineasData.status === "success") {
          const lineasAdaptadas = (lineasData.lineas_academicas || []).map(
            (linea: any) => ({
              name: linea.nombre_linea,
              Cantidad: linea.total_estudiantes ?? 0,
            })
          );
          setLineasAcademicas(lineasAdaptadas);
        }

        // Retención mensual
        const retencionRes = await fetch(
          apiUrl("/estadisticas/usuarios/retencion-mensual"),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const retencionData = await retencionRes.json();
        if (retencionData.status === "success") {
          setRetencionMensual({
            mes_actual: retencionData.mes_actual,
            porcentaje_retencion: retencionData.porcentaje_retencion,
          });
        }

        // Cursos más vendidos
        const ventasRes = await fetch(
          apiUrl("/estadisticas/cursos/mas-vendidos-mes"),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const ventasData = await ventasRes.json();
        if (ventasData.status === "success") {
          const cursosAdaptados = (ventasData.cursos_mas_vendidos || []).map(
            (curso: any) => ({
              ...curso,
              nombre: curso.nombre_curso,
              Cantidad: curso.total_ventas,
            })
          );
          setCursosMasVendidos(cursosAdaptados);
        }
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard p-6">
      <KPI
        usuariosTotales={usuariosTotales}
        cursosTotales={cursosTotales}
        certificadosTotales={certificadosTotales}
      />
      <div className="body grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <EstudiantesLineaAcademica lineasAcademicas={lineasAcademicas} />
        <RetencionMensual retencionMensual={retencionMensual} />
        <CursosMasVendidos cursosMasVendidos={cursosMasVendidos} />
      </div>
    </div>
  );
}
