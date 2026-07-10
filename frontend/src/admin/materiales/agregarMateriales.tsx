import React, { useState, useEffect, useMemo } from "react";
import InputComponent from "../Components/InputComponent";
import type { Modulo, Curso, Material } from "../../types/models";
import SearchableSelect from "../Components/SearchableSelect";
import { apiClient } from "../../services/apiClient";
import AdminModal from "../Components/AdminModal";
import { IoCloudUploadOutline } from "react-icons/io5";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newMaterial: Omit<Material, "id_material">) => Promise<boolean>;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [urlArchivo, setUrlArchivo] = useState<string>("");
  const [idModulo, setIdModulo] = useState<number | "">("");
  const [idCurso, setIdCurso] = useState<number | "">("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNombre("");
    setDescripcion("");
    setArchivo(null);
    setUrlArchivo("");
    setIdModulo("");
    setIdCurso("");
    setError(null);

    const fetchData = async () => {
      try {
        // Cursos - usar ruta admin
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
    fetchData();
  }, [isOpen]);

  const modulosFiltrados = useMemo(() => {
    if (idCurso === "") return [];
    return modulos.filter((m) => m.id_curso === Number(idCurso));
  }, [idCurso, modulos]);

  const handleSave = async () => {
    setError(null);
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (!archivo) return setError("Debes subir un archivo.");
    if (!idCurso) return setError("Selecciona un curso.");

    const formData = new FormData();
    formData.append("titulo", nombre.trim()); // El backend espera 'titulo' según el DTO
    formData.append("descripcion", descripcion.trim() || "");
    // El campo se llama 'id_modulo' y 'id_curso' en el backend
    if (idModulo) formData.append("id_modulo", String(idModulo));
    formData.append("id_curso", String(idCurso));
    formData.append("estado", "Publicado");
    formData.append("archivo", archivo, archivo.name);

    setSaving(true);
    try {
      const res = await apiClient.post("/admin/materiales", formData);
      onSave(res.data);
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "No se pudo subir el material.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Recurso Académico"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="px-8 py-3 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className={`px-10 py-3 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/10 shadow-lg shadow-slate-900/10 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Procesando..." : "Cargar Material"}
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-1">
        {/* Sección: Ubicación Académica */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Destino del Recurso</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Curso Principal</label>
              <SearchableSelect
                value={idCurso}
                onChange={(v) => { setIdCurso(v); setIdModulo(""); }}
                options={cursos.map(c => ({ value: c.id_curso, label: c.nombre }))}
                placeholder="Selecciona curso..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Módulo Específico</label>
              {!idCurso ? (
                <div className="px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-300 italic">Selecciona un curso primero</div>
              ) : (
                <SearchableSelect
                  value={idModulo}
                  onChange={setIdModulo}
                  options={modulosFiltrados.map(m => ({ value: m.id_modulo, label: m.titulo }))}
                  placeholder="Selecciona módulo..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Sección: Identidad del Recurso */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-slate-400 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identidad y Contexto</label>
          </div>

          <InputComponent
            label="Título Descriptivo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Guía de Cálculo Diferencial v1.2"
          />

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Breve Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-[13px] font-medium h-32 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm"
              placeholder="Indica a los estudiantes para qué sirve este archivo..."
            />
          </div>
        </div>

        {/* Sección: Carga de Archivo */}
        <div className="relative group">
          <div className={`relative border-2 border-dashed rounded-[3rem] p-12 transition-all duration-500 flex flex-col items-center justify-center gap-6 overflow-hidden
            ${archivo 
              ? "bg-emerald-50/50 border-emerald-300 shadow-2xl shadow-emerald-500/5" 
              : "bg-slate-50/50 border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 hover:shadow-2xl hover:shadow-sky-500/5"}
          `}>
             <input
              type="file"
              onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            {/* Fondo decorativo al cargar */}
            {archivo && (
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
            )}

            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 relative z-10
              ${archivo 
                ? "bg-white text-emerald-500 shadow-xl shadow-emerald-500/10 rotate-12 scale-110" 
                : "bg-white text-slate-400 shadow-lg shadow-slate-900/5 group-hover:scale-110 group-hover:text-sky-500 group-hover:-rotate-6"}
            `}>
              <IoCloudUploadOutline size={40} className="drop-shadow-sm" />
            </div>

            <div className="text-center relative z-10 space-y-2">
              <p className={`text-sm font-black transition-colors ${archivo ? "text-emerald-700" : "text-slate-800"}`}>
                {archivo ? archivo.name : "Seleccionar Archivo Local"}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {archivo ? `${(archivo.size / 1024).toFixed(1)} KB • Listo para subir` : "Soporta PDF, PNG, JPG hasta 20MB"}
              </p>
            </div>
            
            {!archivo && (
              <div className="px-6 py-2 bg-white rounded-full text-[9px] font-black text-sky-600 uppercase tracking-widest border border-sky-100 shadow-sm relative z-10">
                Arrastra tu archivo aquí
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.15em]">{error}</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
};
