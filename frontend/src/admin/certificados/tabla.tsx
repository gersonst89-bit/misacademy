"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaInfoCircle, FaPlus, FaEdit } from "react-icons/fa";
import type {
  Certificacion,
  CertificacionAdicional,
  CertificacionEmpresa,
  Curso,
  Usuario,
} from "../../types/models";
import { InfoCertificadoModal } from "./infoCertificados";
import { AddCertificadoModal } from "./agregarCertificados";
import { EditCertificadoModal } from "./editCertificados";
import FiltroCurso from "../components/FiltroCursoCertificado";
import { API_URL } from "../../config/api";

const API_PUBLIC = API_URL;
const API_ADMIN = `${API_URL}/admin`;

type TipoCertificado = "" | "empresa" | "adicional";

type CertificacionPlus = Certificacion & {
  curso_nombre?: string;
  usuario_nombre?: string;
};

function parseList<T>(j: any): T[] {
  if (Array.isArray(j)) return j;
  if (Array.isArray(j?.data)) return j.data;
  if (Array.isArray(j?.data?.data)) return j.data.data;
  if (Array.isArray(j?.items)) return j.items;
  return [];
}

export function Certificados() {
  const [items, setItems] = useState<CertificacionPlus[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursoFiltro, setCursoFiltro] = useState<number | "">("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoCertificado>("");
  const [loading, setLoading] = useState(false);
  const [needsToken, setNeedsToken] = useState(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selected, setSelected] = useState<CertificacionPlus | null>(null);
  const [certToEdit, setCertToEdit] = useState<CertificacionAdicional | null>(
    null
  );

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        ""
      : "";

  const cursoById = useMemo(() => {
    const m = new Map<number, string>();
    cursos.forEach((c) => m.set(c.id_curso, c.nombre));
    return m;
  }, [cursos]);

  const usuarioById = useMemo(() => {
    const m = new Map<number, string>();
    usuarios.forEach((u) =>
      m.set(u.id_usuario!, `${u.nombre} ${u.apellido}`.trim())
    );
    return m;
  }, [usuarios]);

  const decorate = (raw: Certificacion[]): CertificacionPlus[] =>
    raw.map((c) => {
      if (c.tipo_certificado === "empresa") {
        const ce = c as CertificacionEmpresa;
        return {
          ...ce,
          curso_nombre: ce.id_curso ? cursoById.get(ce.id_curso) : "—",
          usuario_nombre: ce.id_usuario ? usuarioById.get(ce.id_usuario) : "—",
        };
      } else {
        const ca = c as CertificacionAdicional;
        return {
          ...ca,
          curso_nombre: ca.nombre_curso,
          usuario_nombre: ca.nombre_estudiante,
        };
      }
    });

  const fetchCursos = async () => {
    let allCursos: Curso[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(`${API_PUBLIC}/mis-cursos?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) break;

      const data = await res.json();
      const items = data.data || [];
      if (items.length === 0) break;

      allCursos = [...allCursos, ...items];
      page++;
    }

    setCursos(allCursos);
  };

  const fetchUsuarios = async () => {
    try {
      if (!token) {
        setNeedsToken(true);
        return;
      }
      const r = await fetch(`${API_ADMIN}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error();
      setUsuarios(parseList<Usuario>(await r.json()));
    } catch {
      setUsuarios([]);
    }
  };

  const fetchCertificados = async () => {
    setLoading(true);
    try {
      if (!token) {
        setNeedsToken(true);
        return;
      }

      let url = `${API_ADMIN}/certificaciones`;
      const qs: string[] = [];

      if (tipoFiltro) qs.push(`tipo_certificado=${tipoFiltro}`);

      if (qs.length) url += `?${qs.join("&")}`;

      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error();

      const list = parseList<Certificacion>(await r.json());
      setItems(decorate(list));
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const crearCertificado = async (
    nuevo: Omit<CertificacionAdicional, "id_certificacion">
  ): Promise<boolean> => {
    if (!token) {
      alert("Necesitas iniciar sesión (token).");
      return false;
    }

    try {
      const res = await fetch(`${API_ADMIN}/certificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevo),
      });

      if (!res.ok) {
        console.error(
          "Error al crear certificado:",
          await res.json().catch(() => null)
        );
        return false;
      }

      await fetchCertificados();
      return true;
    } catch (err) {
      console.error("Error en fetch crear certificado:", err);
      return false;
    }
  };

  const actualizarCertificado = async (
    edit: CertificacionAdicional
  ): Promise<boolean> => {
    if (!token) {
      alert("Necesitas iniciar sesión (token).");
      return false;
    }
    try {
      const res = await fetch(
        `${API_ADMIN}/certificaciones/${edit.id_certificacion}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(edit),
        }
      );
      if (!res.ok) {
        console.error(
          "Error al actualizar certificado:",
          await res.json().catch(() => null)
        );
        return false;
      }
      await fetchCertificados();
      return true;
    } catch (err) {
      console.error("Error al actualizar certificado:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchCursos();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    fetchCertificados();
  }, [tipoFiltro, cursos, usuarios, token]);

  // 🔽🔽🔽 ORDENAR ALFABÉTICAMENTE AQUÍ 🔽🔽🔽
  const filtrados = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    let filteredItems = [...items];

    if (t) {
      filteredItems = filteredItems.filter(
        (c) =>
          c.codigo_certificado?.toLowerCase().includes(t) ||
          c.curso_nombre?.toLowerCase().includes(t) ||
          c.usuario_nombre?.toLowerCase().includes(t)
      );
    }

    if (tipoFiltro) {
      filteredItems = filteredItems.filter(
        (c) => c.tipo_certificado === tipoFiltro
      );
    }

    if (cursoFiltro !== "" && cursoFiltro !== 0) {
      const id = Number(cursoFiltro);
      filteredItems = filteredItems.filter((c) => {
        if (c.tipo_certificado !== "empresa") return false;
        const ce = c as CertificacionEmpresa;
        return ce.id_curso === id;
      });
    }

    filteredItems.sort((a, b) =>
      (a.codigo_certificado || "").localeCompare(
        b.codigo_certificado || "",
        "es"
      )
    );

    return filteredItems;
  }, [busqueda, items, tipoFiltro, cursoFiltro]);

  const showArchivo = filtrados.some(
    (c) =>
      c.tipo_certificado === "empresa" &&
      (c as CertificacionEmpresa).url_certificado
  );

  const handleVerInfo = (c: CertificacionPlus) => {
    setSelected(c);
    setIsInfoOpen(true);
  };

  const handleEditar = (c: CertificacionPlus) => {
    if (c.tipo_certificado !== "adicional") return;
    setCertToEdit(c as CertificacionAdicional);
    setIsEditModalOpen(true);
  };

  const totalCols = showArchivo ? 7 : 6;

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      {needsToken && (
        <div className="px-4 py-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-900">
          Necesitas iniciar sesión como administrador.
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-grow min-w-[260px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, persona o curso…"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Agregar certificado adicional
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as TipoCertificado)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todos los tipos</option>
          <option value="empresa">Empresa</option>
          <option value="adicional">Adicional</option>
        </select>

        <FiltroCurso
          value={cursoFiltro}
          onChange={(v) => {
            if (v === "" || v === null || v === undefined) {
              setCursoFiltro("");
            } else {
              setCursoFiltro(Number(v));
            }
          }}
          cursos={cursos}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Curso</th>
              <th className="px-4 py-3 text-left">Fecha emisión</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="text-center py-6 text-gray-500"
                >
                  Cargando…
                </td>
              </tr>
            ) : filtrados.length ? (
              filtrados.map((c, i) => {
                const fecha =
                  c.tipo_certificado === "empresa"
                    ? (c as CertificacionEmpresa).fecha_emision
                    : (c as CertificacionAdicional).fecha_emision;

                const fechaEmision = fecha
                  ? new Date(fecha).toLocaleDateString("es-ES")
                  : "—";

                return (
                  <tr
                    key={c.id_certificacion}
                    className={`border-b ${
                      i % 2 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-3">{c.codigo_certificado || "—"}</td>
                    <td className="px-4 py-3 capitalize">
                      {c.tipo_certificado}
                    </td>
                    <td className="px-4 py-3">{c.usuario_nombre || "—"}</td>
                    <td className="px-4 py-3">{c.curso_nombre || "—"}</td>
                    <td className="px-4 py-3">{fechaEmision}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-4">
                        {c.tipo_certificado === "adicional" && (
                          <button
                            onClick={() =>
                              handleEditar(
                                c as CertificacionPlus & CertificacionAdicional
                              )
                            }
                            className="text-sky-600 hover:text-sky-800"
                            title="Editar certificado adicional"
                          >
                            <FaEdit size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleVerInfo(c)}
                          className="text-gray-700 hover:text-gray-900"
                          title="Ver información"
                        >
                          <FaInfoCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={totalCols}
                  className="text-center py-6 text-gray-500"
                >
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InfoCertificadoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        item={selected}
      />

      {isCreateModalOpen && (
        <AddCertificadoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={crearCertificado}
        />
      )}

      {isEditModalOpen && certToEdit && (
        <EditCertificadoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={certToEdit}
          onSave={actualizarCertificado}
        />
      )}
    </div>
  );
}

export default Certificados;
