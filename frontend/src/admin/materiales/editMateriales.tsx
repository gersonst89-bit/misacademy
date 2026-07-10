import React, { useState, useEffect } from "react";
import type { Material, Modulo, Curso } from "../../types/models";
import SearchableSelect from "../Components/SearchableSelect";
import InputComponent from "../Components/InputComponent";
import { apiClient } from "../../services/apiClient";
import AdminModal from "../Components/AdminModal";
import { IoCloudUploadOutline } from "react-icons/io5";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
  onSave: (updatedMaterial: Material) => Promise<boolean>;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
  onSave,
}) => {
  const [nombre, setNombre] = useState(material.titulo);
  const [descripcion, setDescripcion] = useState(material.descripcion ?? "");
  const [urlArchivo, setUrlArchivo] = useState(material.url_archivo ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tamanio, setTamanio] = useState(material.tamanio?.toString() ?? "");
  const [estado, setEstado] = useState<Material["estado"]>(material.estado ?? "Publicado");

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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

  useEffect(() => {
    if (!isOpen || !material) return;
    setNombre(material.titulo);
    setDescripcion(material.descripcion ?? "");
    setUrlArchivo(material.url_archivo ?? "");
    setTamanio(material.tamanio?.toString() ?? "");
    setEstado(material.estado ?? "Publicado");

    const modulo = modulos.find((m) => m.id_modulo === material.id_modulo) || null;
    setModuloSeleccionado(modulo);
    const curso = modulo ? cursos.find((c) => c.id_curso === modulo.id_curso) || null : null;
    setCursoSeleccionado(curso);
    setError("");
  }, [isOpen, material, modulos, cursos]);

  const handleSave = async () => {
    setError("");
    if (!cursoSeleccionado) return setError("Selecciona un curso.");
    if (!moduloSeleccionado) return setError("Selecciona un módulo.");
    if (!(nombre || '').trim()) return setError("El nombre es obligatorio.");

    const updatedMaterial: Material = {
      ...material,
      titulo: (nombre || '').trim(),
      descripcion: descripcion.trim() || null,
      tamanio: archivo ? Math.round(archivo.size / 1024) : (tamanio ? parseInt(tamanio, 10) : null),
      estado,
      id_modulo: moduloSeleccionado.id_modulo,
    };

    setSaving(true);
    const exito = await onSave(updatedMaterial);
    setSaving(false);
    if (exito) onClose();
    else setError("Error al actualizar material.");
  };

  const handleCursoChange = (id: number | "") => {
    const curso = cursos.find((c) => c.id_curso === id) || null;
    setCursoSeleccionado(curso);
    if (!curso || (moduloSeleccionado && moduloSeleccionado.id_curso !== curso.id_curso)) {
      setModuloSeleccionado(null);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar Especificaciones del Recurso"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="px-8 py-3 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className={`px-10 py-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-amber-500/20 transition-all active:scale-95 border border-white/10 shadow-lg shadow-amber-900/10 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Guardando..." : "Actualizar Recurso"}
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-1">
        {/* Sección: Ubicación Académica (Modo Edición) */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Reubicación de Material</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Curso Asignado</label>
              <SearchableSelect
                value={cursoSeleccionado?.id_curso || ""}
                onChange={handleCursoChange}
                options={cursos.map(c => ({ value: c.id_curso, label: c.nombre }))}
                placeholder="Selecciona curso..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Módulo Interno</label>
              <SearchableSelect
                value={moduloSeleccionado?.id_modulo || ""}
                onChange={(id) => setModuloSeleccionado(modulos.find(m => m.id_modulo === id) || null)}
                options={modulos.filter(m => !cursoSeleccionado || m.id_curso === cursoSeleccionado.id_curso).map(m => ({ value: m.id_modulo, label: m.titulo }))}
                placeholder="Selecciona módulo..."
              />
            </div>
          </div>
        </div>

        {/* Sección: Identidad del Recurso */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-slate-400 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Metadatos de Identidad</label>
          </div>

          <InputComponent
            label="Título del Material"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción Detallada</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all text-[13px] font-medium h-32 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm"
            />
          </div>
        </div>

        {/* Sección: Reemplazo de Archivo */}
        <div className="relative group">
          <div className={`relative border-2 border-dashed rounded-[3rem] p-10 transition-all duration-500 flex flex-col items-center justify-center gap-4 overflow-hidden
            ${archivo 
              ? "bg-emerald-50/50 border-emerald-300 shadow-xl shadow-emerald-500/5" 
              : "bg-slate-50/50 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30"}
          `}>
             <input
              type="file"
              onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 relative z-10
              ${archivo 
                ? "bg-white text-emerald-500 shadow-lg scale-110 rotate-6" 
                : "bg-white text-slate-400 shadow-sm group-hover:text-amber-500 group-hover:-rotate-6"}
            `}>
              <IoCloudUploadOutline size={32} />
            </div>

            <div className="text-center relative z-10 space-y-1">
              <p className={`text-sm font-black transition-colors ${archivo ? "text-emerald-700" : "text-slate-800"}`}>
                {archivo ? archivo.name : (urlArchivo ? "Mantener archivo original" : "Actualizar Recurso Local")}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {archivo ? "Listo para sobreescribir" : "Haz clic o arrastra para reemplazar"}
              </p>
            </div>
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
