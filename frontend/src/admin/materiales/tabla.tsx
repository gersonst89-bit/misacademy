"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoSearchOutline,
  IoAddOutline,
  IoFileTrayFullOutline,
  IoCreateOutline,
  IoArchiveOutline,
  IoInformationCircleOutline,
  IoTrashOutline,
  IoDocumentTextOutline,
  IoEllipsisVertical,
} from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import type { Material, Modulo } from "../../types/models";
import { InfoMaterialModal } from "./infoMateriales";
import { EditMaterialModal } from "./editMateriales";
import { AddMaterialModal } from "./agregarMateriales";
import { ArchiveModal } from "../Components/ArchiveModal";
import DeleteModal from "../Components/DeleteModal";
import { apiUrl } from "../../config/api";
import { FiltroModulo } from "../Components/FiltroModuloMateriales";

function FiltroEstado({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "Publicado", label: "Publicado" },
    { value: "Archivado", label: "Archivado" },
  ];

  const labelActual = estados.find(e => e.value === value)?.label || "Estados";

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm min-w-[180px]"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value === 'Publicado' ? 'bg-emerald-500 animate-pulse' : value === 'Archivado' ? 'bg-rose-500' : 'bg-sky-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{labelActual}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          <div className="px-3 py-2 border-b border-slate-50 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</span>
          </div>
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                onChange(e.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === e.value ? "bg-sky-50 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                e.value === 'Publicado' ? 'bg-emerald-500' : 
                e.value === 'Archivado' ? 'bg-rose-500' : 'bg-sky-500'
              }`} />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Materiales() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [filtroModulo, setFiltroModulo] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [materialSeleccionadoEstado, setMaterialSeleccionadoEstado] = useState<Material | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [materialAEditar, setMaterialAEditar] = useState<Material | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  // Actions
  const abrirModal = (material: Material) => {
    setMaterialSeleccionado(material);
    setModalAbierto(true);
  };

  const handleEstadoClick = (material: Material) => {
    setMaterialSeleccionadoEstado(material);
    setIsEstadoModalOpen(true);
  };

  const handleEditar = (material: Material) => {
    setMaterialAEditar(material);
    setIsEditModalOpen(true);
  };

  const handleConfirmCambioEstado = async () => {
    if (!materialSeleccionadoEstado) return;
    const nuevoEstado = materialSeleccionadoEstado.estado === "Publicado" ? "Archivado" : "Publicado";
    try {
      const response = await fetch(
        apiUrl(`/admin/materiales/${materialSeleccionadoEstado.id_material}/estado`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );
      if (!response.ok) throw new Error("Error");
      setMateriales((prev) => prev.map((m) => m.id_material === materialSeleccionadoEstado.id_material ? { ...m, estado: nuevoEstado } : m));
      setIsEstadoModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleGuardarEdicion = async (materialActualizado: Material): Promise<boolean> => {
    try {
      const response = await fetch(apiUrl(`/admin/materiales/${materialActualizado.id_material}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(materialActualizado),
      });
      if (!response.ok) return false;
      setMateriales((prev) => prev.map((m) => m.id_material === materialActualizado.id_material ? materialActualizado : m));
      return true;
    } catch (e) { return false; }
  };

  const handleMaterialCreated = (newMaterial: Material) => {
    // El material ya fue creado por el modal (que maneja FormData/Archivos)
    // Solo actualizamos el estado local para que aparezca en la tabla
    setMateriales((prev) => [newMaterial, ...prev]);
    return true;
  };

  const handleEliminar = async () => {
    if (!materialToDelete) return;
    try {
      const response = await fetch(apiUrl(`/admin/materiales/${materialToDelete.id_material}`), { 
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error();
      setMateriales((prev) => prev.filter((m) => m.id_material !== materialToDelete.id_material));
      setIsDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  // Fetch Logic
  useEffect(() => {
    const fetchMateriales = async () => {
      setIsLoading(true);
      try {
        let todas: Material[] = [];
        let pagina = 1, ultima = 1;
        do {
          const res = await fetch(apiUrl(`/admin/materiales?page=${pagina}&estado=${filtroEstado}&id_modulo=${filtroModulo}`), {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const d = await res.json();
          todas = [...todas, ...(d.data || [])];
          ultima = d.last_page || 1;
          pagina++;
        } while (pagina <= ultima);

        todas.sort((a, b) => (a.estado === b.estado ? (a.titulo || '').localeCompare(b.titulo || '') : a.estado === "Publicado" ? -1 : 1));
        setMateriales(todas.filter(m => (m.titulo || '').toLowerCase().includes(busqueda.toLowerCase())));
      } catch (e) { setErrorMessage("Error de conexión"); } finally { setIsLoading(false); }
    };
    fetchMateriales();
  }, [busqueda, filtroEstado, filtroModulo]);

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        let all: Modulo[] = [];
        let p = 1, u = 1;
        do {
          const res = await fetch(apiUrl(`/admin/modulos?page=${p}`), {
            credentials: "include"
          });
          const d = await res.json();
          all = [...all, ...(d.data || [])];
          u = d.last_page || 1;
          p++;
        } while (p <= u);
        setModulos(all);
      } catch (e) { console.error(e); }
    };
    fetchModulos();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Barra de Control Maestra */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-xl group">
          <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar materiales..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all text-sm font-medium text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <FiltroModulo value={filtroModulo} onChange={setFiltroModulo} modulos={modulos} />
          
          <FiltroEstado
            value={filtroEstado}
            onChange={setFiltroEstado}
          />

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0E1C2B] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2 group shadow-md"
          >
            <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Material
          </button>
        </div>
      </div>

      {/* Contenedor Responsivo: Desktop Table / Mobile Cards */}
      <div className="relative">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <div className="w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-sky-500/20" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Archivos...</p>
          </div>
        ) : materiales.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-slate-100 border-dashed">
            <IoFileTrayFullOutline size={48} className="mx-auto text-slate-200 mb-6" />
            <p className="text-[14px] font-black text-slate-700 uppercase tracking-widest">Sin Materiales</p>
            <p className="text-[12px] text-slate-400 mt-1">{errorMessage || "No se encontraron recursos registrados."}</p>
          </div>
        ) : (
          <>
            {/* VISTA DESKTOP (TABLE) */}
            <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden shadow-2xl shadow-slate-900/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Identidad del Material</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Acceso a Recurso</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-center">Estado</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {materiales.map((m) => (
                      <tr key={m.id_material} className="group hover:bg-slate-50/30 transition-all duration-300">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-white group-hover:text-sky-500 transition-all">
                              <IoDocumentTextOutline size={24} />
                            </div>
                            <div className="flex flex-col max-w-sm">
                              <span className="text-sm font-black text-slate-800 group-hover:text-sky-600 transition-colors leading-tight">{m.titulo}</span>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-medium italic">{m.descripcion || "Sin descripción"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex justify-center">
                            {m.url_archivo ? (
                              <a href={m.url_archivo} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white border border-slate-100 hover:border-sky-300 hover:shadow-lg transition-all group/file">
                                <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center font-black text-[10px]">PDF</div>
                                <div className="flex flex-col items-start">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Recurso</span>
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Descargar</span>
                                </div>
                              </a>
                            ) : (
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sin Archivo</span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex justify-center">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                              ${m.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}
                            `}>
                              <div className={`w-1.5 h-1.5 rounded-full ${m.estado === "Publicado" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                              {m.estado}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditar(m)} className="p-3 text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Editar"><IoCreateOutline size={18} /></button>
                            <button onClick={() => handleEstadoClick(m)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all" title="Archivar"><IoArchiveOutline size={18} /></button>
                            <button onClick={() => abrirModal(m)} className="p-3 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all" title="Info"><IoInformationCircleOutline size={18} /></button>
                            <button onClick={() => { setMaterialToDelete(m); setIsDeleteOpen(true); }} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Eliminar"><IoTrashOutline size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* VISTA MOBILE (CARDS) */}
            <div className="md:hidden space-y-6">
               {materiales.map((m) => (
                 <div key={m.id_material} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between pt-2">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                          <IoDocumentTextOutline size={28} />
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                         ${m.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}
                       `}>
                          {m.estado}
                       </div>
                    </div>

                    <div className="space-y-1">
                       <h4 className="text-[18px] font-black text-slate-800 leading-tight">{m.titulo}</h4>
                       <p className="text-[12px] text-slate-400 line-clamp-2 italic">{m.descripcion || "Sin descripción"}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                       {m.url_archivo ? (
                          <a href={m.url_archivo} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-5 bg-sky-50/50 rounded-[1.5rem] border border-sky-100 text-sky-600 group/file">
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm font-black text-[10px] text-rose-500">PDF</div>
                                <span className="text-[11px] font-black uppercase tracking-widest">Recurso Académico</span>
                             </div>
                             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover/file:scale-110 transition-transform">
                                <IoInformationCircleOutline size={18} />
                             </div>
                          </a>
                       ) : (
                          <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-300 italic text-[11px] text-center">Sin archivo vinculado</div>
                       )}

                       <div className="grid grid-cols-4 gap-3">
                          <button onClick={() => handleEditar(m)} className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-100 rounded-2xl text-amber-500 active:scale-95 transition-all shadow-sm">
                             <IoCreateOutline size={20} />
                             <span className="text-[8px] font-black uppercase tracking-tighter">Editar</span>
                          </button>
                          <button onClick={() => handleEstadoClick(m)} className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-100 rounded-2xl text-slate-400 active:scale-95 transition-all shadow-sm">
                             <IoArchiveOutline size={20} />
                             <span className="text-[8px] font-black uppercase tracking-tighter">Estado</span>
                          </button>
                          <button onClick={() => abrirModal(m)} className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-100 rounded-2xl text-sky-500 active:scale-95 transition-all shadow-sm">
                             <IoInformationCircleOutline size={20} />
                             <span className="text-[8px] font-black uppercase tracking-tighter">Info</span>
                          </button>
                          <button onClick={() => { setMaterialToDelete(m); setIsDeleteOpen(true); }} className="flex flex-col items-center justify-center gap-2 py-4 bg-white border border-slate-100 rounded-2xl text-rose-500 active:scale-95 transition-all shadow-sm">
                             <IoTrashOutline size={20} />
                             <span className="text-[8px] font-black uppercase tracking-tighter">Eliminar</span>
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <InfoMaterialModal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} material={materialSeleccionado} />
      <ArchiveModal isOpen={isEstadoModalOpen} onClose={() => setIsEstadoModalOpen(false)} onConfirm={handleConfirmCambioEstado} itemName={materialSeleccionadoEstado?.titulo || ""} nuevoEstado={materialSeleccionadoEstado?.estado === "Publicado" ? "Archivado" : "Publicado"} />
      {materialAEditar && isEditModalOpen && (
        <EditMaterialModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setMaterialAEditar(null); }} material={materialAEditar} onSave={handleGuardarEdicion} />
      )}
      {isCreateModalOpen && (
        <AddMaterialModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleMaterialCreated as any} />
      )}
      <DeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleEliminar} itemName={materialToDelete?.titulo || "este material"} />
    </div>
  );
}
