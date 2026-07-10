import React, { useEffect, useState } from "react";
import type { Material, Modulo, Curso } from "../../types/models";
import { apiClient } from "../../services/apiClient";
import AdminModal from "../Components/AdminModal";
import { IoFileTrayFullOutline, IoDownloadOutline } from "react-icons/io5";

interface InfoMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export const InfoMaterialModal: React.FC<InfoMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nombreModulo, setNombreModulo] = useState<string>("");
  const [nombreCurso, setNombreCurso] = useState<string>("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Cursos
        let pageC = 1, lastC = 1, listC: Curso[] = [];
        do {
          const res = await apiClient.get(`/admin/cursos`, {
            params: { page: pageC }
          });
          const d = res.data;
          listC = [...listC, ...(d.data || d || [])];
          lastC = d.last_page || d.meta?.last_page || 1;
          pageC++;
        } while (pageC <= lastC);
        setCursos(listC);

        // Modulos
        let pageM = 1, lastM = 1, listM: Modulo[] = [];
        do {
          const res = await apiClient.get(`/admin/modulos`, {
            params: { page: pageM }
          });
          const d = res.data;
          listM = [...listM, ...(d.data || d || [])];
          lastM = d.last_page || d.meta?.last_page || 1;
          pageM++;
        } while (pageM <= lastM);
        setModulos(listM);
      } catch (err) { console.error(err); }
    };

    if (isOpen) fetchAllData();
  }, [isOpen]);

  useEffect(() => {
    if (material && material.id_modulo) {
      const moduloEncontrado = modulos.find(m => m.id_modulo === material.id_modulo);
      if (moduloEncontrado) {
        setNombreModulo(moduloEncontrado.titulo);
        const cursoEncontrado = cursos.find(c => c.id_curso === moduloEncontrado.id_curso);
        setNombreCurso(cursoEncontrado ? cursoEncontrado.nombre : "Curso no encontrado");
      }
    }
  }, [material, modulos, cursos]);

  const formatDate = (date: string | null) => {
    if (!date) return "No disponible";
    const dt = new Date(date.replace(" ", "T"));
    if (isNaN(dt.getTime())) return "No disponible";
    return dt.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!material) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Especificaciones del Recurso"
      maxWidth="max-w-3xl"
      footer={
        <button
          onClick={onClose}
          className="px-10 py-3 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/10"
        >
          Cerrar Ficha
        </button>
      }
    >
      <div className="space-y-8 p-1">
        {/* Cabecera de Identidad del Archivo */}
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
           <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-all duration-700" />
           <div className="w-28 h-28 bg-white rounded-[2rem] shadow-2xl shadow-sky-900/10 flex items-center justify-center text-sky-500 mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 border border-slate-50">
              <IoFileTrayFullOutline size={56} className="drop-shadow-sm" />
           </div>
           
           <div className="text-center space-y-2 relative z-10 px-6">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{material.titulo}</h3>
              <div className="flex items-center justify-center gap-3">
                 <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {material.tamanio ? `${material.tamanio} KB` : "Peso Desconocido"}
                 </span>
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                    ${material.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}
                 `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${material.estado === "Publicado" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {material.estado}
                 </div>
              </div>
           </div>
           
           {material.url_archivo && (
              <a 
                href={material.url_archivo} 
                target="_blank" 
                rel="noreferrer"
                className="mt-8 flex items-center gap-3 px-8 py-3 bg-white text-sky-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all relative z-10 border border-sky-100 active:scale-95"
              >
                <IoDownloadOutline size={20} />
                Obtener Recurso
              </a>
           )}
        </div>

        {/* Cuadrícula de Datos Técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación Académica</label>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest opacity-60">Curso Principal</p>
                   <p className="text-sm font-bold text-slate-800">{nombreCurso}</p>
                   <div className="flex items-center gap-2 my-2">
                      <div className="w-4 h-[1px] bg-slate-200" />
                      <span className="text-slate-300">→</span>
                   </div>
                   <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest opacity-60">Módulo Asignado</p>
                   <p className="text-sm font-bold text-slate-800">{nombreModulo}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-1.5 h-4 bg-slate-400 rounded-full" />
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trazabilidad</label>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[12px] font-medium text-slate-500">Fecha de Registro</span>
                   <span className="text-[12px] font-black text-slate-900">{formatDate(material.fecha_creacion)}</span>
                </div>
              </div>
           </div>

           <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 h-full">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contexto del Recurso</label>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-slate-600 text-[13px] leading-relaxed italic shadow-sm h-[calc(100%-40px)]">
                {material.descripcion || "Este material es un recurso de apoyo directo para la lección sin descripción adicional registrada."}
              </div>
           </div>
        </div>
      </div>
    </AdminModal>
  );
};
