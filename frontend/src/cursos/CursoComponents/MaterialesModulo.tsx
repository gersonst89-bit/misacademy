import React, { useEffect, useState } from "react";
import { MdPictureAsPdf, MdInsertDriveFile, MdImage, MdArchive, MdTextSnippet, MdDescription, MdSlideshow, MdArrowBack, MdArrowForward } from "react-icons/md";
import axios from "axios";
import { API_URL } from "../../config/api";

interface Material {
  id_material: number | string;
  id_modulo: number | string;
  nombre: string;
  descripcion?: string;
  url_archivo: string;
  tamanio?: number;
  fecha_creacion?: string;
  estado?: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

interface Props {
  idModulo: number | string;
}

const MaterialesModulo: React.FC<Props> = ({ idModulo }) => {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!idModulo) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    axios.get(`${API_URL}/materiales?estado=Publicado&id_modulo=${idModulo}&page=${page}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    )
      .then(res => {
        // Adaptar los campos del response para el frontend
        const materiales: Material[] = (res.data.data || []).map((mat: any) => ({
          id_material: mat.id_material,
          id_modulo: mat.id_modulo,
          nombre: mat.nombre,
          descripcion: mat.descripcion,
          url_archivo: mat.url_archivo,
          tamanio: mat.tamanio,
          fecha_creacion: mat.fecha_creacion,
          estado: mat.estado,
        }));
        setMateriales(materiales);
        setMeta(res.data.meta || null);
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar los materiales."))
      .finally(() => setLoading(false));
  }, [idModulo, page]);

  if (!idModulo) return null;
  if (loading) return <div className="mb-6 text-gray-500">Cargando materiales...</div>;
  if (error) return <div className="mb-6 text-red-500">{error}</div>;
  if (!materiales.length) return <div className="mb-6 text-gray-400">No hay materiales para este módulo.</div>;

  return (
    <div className="mb-6 p-4 bg-[#101A2B] rounded-lg shadow-lg text-gray-200 border border-gray-800">
      <div className="font-bold text-xl mb-2 text-sky-400">Materiales del módulo</div>
      <ul className="space-y-3">
        {materiales.map(mat => {
          // Detectar tipo de archivo por extensión y asignar ícono Material Design
          const ext = mat.url_archivo.split('.').pop()?.toLowerCase() || "";
          let Icon = MdInsertDriveFile;
          if (["pdf"].includes(ext)) Icon = MdPictureAsPdf;
          else if (["doc", "docx"].includes(ext)) Icon = MdDescription;
          else if (["xls", "xlsx"].includes(ext)) Icon = MdTextSnippet;
          else if (["ppt", "pptx"].includes(ext)) Icon = MdSlideshow;
          else if (["zip", "rar"].includes(ext)) Icon = MdArchive;
          else if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) Icon = MdImage;
          return (
            <li key={mat.id_material} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 last:border-b-0">
              <div>
                <div className="font-semibold text-base text-gray-200 flex items-center gap-2">
                  <Icon className="text-2xl text-sky-400" />
                  {mat.nombre}
                </div>
                {mat.descripcion && <div className="text-sm text-gray-400 mb-1">{mat.descripcion}</div>}
                {mat.tamanio && (
                  <span className="text-xs text-gray-400">
                    {mat.tamanio >= 1024
                      ? `${(mat.tamanio/1024).toFixed(2)} MB`
                      : `${mat.tamanio.toFixed(2)} KB`}
                  </span>
                )}
              </div>
              <a
                href={mat.url_archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 sm:mt-0 px-4 py-2 bg-sky-600 text-white rounded font-bold hover:bg-sky-700 text-sm transition"
                download
              >
                Descargar
              </a>
            </li>
          );
        })}
      </ul>
      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold disabled:opacity-50 flex items-center gap-1"
            disabled={meta.current_page === 1}
            onClick={() => setPage(page - 1)}
          >
            <MdArrowBack className="text-base" /> Anterior
          </button>
          <span className="px-2 text-sm text-gray-600">Página {meta.current_page} de {meta.last_page}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold disabled:opacity-50 flex items-center gap-1"
            disabled={meta.current_page === meta.last_page}
            onClick={() => setPage(page + 1)}
          >
            Siguiente <MdArrowForward className="text-base" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MaterialesModulo;
