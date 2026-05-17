"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { IoSearchOutline, IoAddOutline, IoCreateOutline, IoInformationCircleOutline, IoFilterOutline, IoRibbonOutline, IoTrashOutline } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
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
import DeleteModal from "../Components/DeleteModal";
import FiltroCurso from "../Components/FiltroCursoCertificado";
import { API_URL } from "../../config/api";

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

function FiltroTipo({
    value,
    onChange,
}: {
    value: TipoCertificado;
    onChange: (v: TipoCertificado) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const tipos = [
        { value: "" as TipoCertificado, label: "Todos los tipos", color: "text-sky-600", bg: "bg-sky-50" },
        { value: "empresa" as TipoCertificado, label: "Académicos (Empresa)", color: "text-sky-600", bg: "bg-sky-50" },
        { value: "adicional" as TipoCertificado, label: "Adicionales / Externos", color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const current = tipos.find(t => t.value === value) || tipos[0];

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
            >
                <div className={`w-1.5 h-1.5 rounded-full ${value === 'empresa' ? 'bg-sky-500 animate-pulse' : value === 'adicional' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{current.label}</span>
                <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
                    {tipos.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => {
                                onChange(t.value);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                                ${value === t.value 
                                    ? `${t.bg} ${t.color} shadow-sm` 
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                            `}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                t.value === 'empresa' ? 'bg-sky-500' : 
                                t.value === 'adicional' ? 'bg-amber-500' : 'bg-slate-400'
                            }`} />
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function Certificados() {
    const [items, setItems] = useState<CertificacionPlus[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cursoFiltro, setCursoFiltro] = useState<number | "">("");
    const [tipoFiltro, setTipoFiltro] = useState<TipoCertificado>("");
    const [loading, setLoading] = useState(false);

    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selected, setSelected] = useState<CertificacionPlus | null>(null);
    const [certToEdit, setCertToEdit] = useState<CertificacionAdicional | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [certToDelete, setCertToDelete] = useState<CertificacionPlus | null>(null);

    const token = ""; // Sesión gestionada vía cookies HttpOnly

    const cursoById = useMemo(() => {
        const m = new Map<number, string>();
        cursos.forEach((c) => m.set(c.id_curso, c.nombre));
        return m;
    }, [cursos]);

    const usuarioById = useMemo(() => {
        const m = new Map<number, string>();
        usuarios.forEach((u) => m.set(u.id_usuario!, `${u.nombre} ${u.apellido}`.trim()));
        return m;
    }, [usuarios]);

    const decorate = (raw: any[]): CertificacionPlus[] =>
        raw.map((c) => {
            const ce = c as any;
            // Intentar obtener nombres de las relaciones directas enviadas por el backend
            const usuarioNombre = ce.usuario ? `${ce.usuario.nombre} ${ce.usuario.apellido || ""}`.trim() : null;
            const cursoNombre = ce.curso ? ce.curso.nombre : null;

            if (c.tipo_certificado === "empresa") {
                return {
                    ...c,
                    curso_nombre: cursoNombre || (ce.id_curso ? cursoById.get(ce.id_curso) : "—"),
                    usuario_nombre: usuarioNombre || (ce.id_usuario ? usuarioById.get(ce.id_usuario) : "—"),
                };
            } else {
                const ca = c as CertificacionAdicional;
                return {
                    ...ca,
                    curso_nombre: ca.nombre_curso || "—",
                    usuario_nombre: ca.nombre_estudiante || "—",
                };
            }
        });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Cursos
            const resC = await fetch(`${API_URL}/mis-cursos`, { headers: { Accept: "application/json" } });
            const dataC = await resC.json();
            setCursos(parseList<Curso>(dataC));

            // Usuarios
            const resU = await fetch(`${API_ADMIN}/usuarios`, { headers: { Accept: "application/json" } });
            const dataU = await resU.json();
            setUsuarios(parseList<Usuario>(dataU));

            // Certificados
            let url = `${API_ADMIN}/certificaciones`;
            if (tipoFiltro) url += `?tipo_certificado=${tipoFiltro}`;
            const r = await fetch(url, { headers: { Accept: "application/json" } });
            const list = parseList<Certificacion>(await r.json());
            setItems(decorate(list));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tipoFiltro, token]);

    const filtrados = useMemo(() => {
        const t = busqueda.toLowerCase().trim();
        let list = [...items];
        if (t) {
            list = list.filter(c => 
                c.codigo_certificado?.toLowerCase().includes(t) ||
                c.curso_nombre?.toLowerCase().includes(t) ||
                c.usuario_nombre?.toLowerCase().includes(t)
            );
        }
        if (cursoFiltro !== "" && cursoFiltro !== 0) {
            list = list.filter(c => c.tipo_certificado === "empresa" && (c as CertificacionEmpresa).id_curso === Number(cursoFiltro));
        }
        return list.sort((a, b) => (a.codigo_certificado || "").localeCompare(b.codigo_certificado || "", "es"));
    }, [busqueda, items, cursoFiltro]);

    const handleVerInfo = (c: CertificacionPlus) => { setSelected(c); setIsInfoOpen(true); };
    const handleEditar = (c: CertificacionPlus) => {
        if (c.tipo_certificado !== "adicional") return;
        setCertToEdit(c as CertificacionAdicional);
        setIsEditModalOpen(true);
    };

    const handleEliminar = async () => {
        if (!certToDelete) return;
        try {
            const res = await fetch(`${API_ADMIN}/certificaciones/${certToDelete.id_certificacion}`, {
                method: "DELETE",
                headers: { Accept: "application/json" }
            });
            if (res.ok) {
                fetchData();
                setIsDeleteOpen(false);
            } else {
                alert("No se pudo eliminar el certificado.");
            }
        } catch (err) {
            console.error(err);
            alert("Error eliminando certificado.");
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md group">
                    <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por código, alumno o curso..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium"
                    />
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center gap-2 group whitespace-nowrap"
                >
                    <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    Emitir Certificado
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-200/50 w-full sm:w-auto justify-center sm:justify-start">
                    <IoFilterOutline size={18} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtrar por</span>
                </div>
                
                <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />

                <div className="grid grid-cols-1 md:flex items-center gap-3 w-full">
                    <FiltroTipo
                        value={tipoFiltro}
                        onChange={setTipoFiltro}
                    />

                    <div className="w-full md:w-auto">
                        <FiltroCurso
                            value={cursoFiltro}
                            onChange={(v) => setCursoFiltro(v === "" ? "" : Number(v))}
                            cursos={cursos}
                        />
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Vista Desktop (Tabla) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Certificado & Tipo</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Titular</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Programa / Curso</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Emisión</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sincronizando certificados...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">No se encontraron certificaciones</td>
                                </tr>
                            ) : (
                                filtrados.map((c) => (
                                    <tr key={c.id_certificacion} className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight uppercase">{c.codigo_certificado || "—"}</span>
                                                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border w-fit transition-all duration-500
                                                    ${c.tipo_certificado === "empresa" 
                                                        ? "bg-sky-500/10 text-sky-600 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"}
                                                `}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${c.tipo_certificado === "empresa" ? "bg-sky-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
                                                    {c.tipo_certificado === "empresa" ? "ACADÉMICO" : "ADICIONAL"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                                    {c.usuario_nombre?.charAt(0) || "U"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700 tracking-tight leading-tight">{c.usuario_nombre || "—"}</span>
                                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Estudiante Certificado</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col max-w-xs">
                                                <p className="text-[13px] font-black text-slate-600 group-hover:text-slate-900 transition-colors truncate leading-tight">{c.curso_nombre || "—"}</p>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Programa MIS Academy</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-black text-slate-900 leading-none">
                                                    {c.fecha_emision ? new Date(c.fecha_emision).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' }) : "—"}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    {c.fecha_emision ? new Date(c.fecha_emision).getFullYear() : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500">
                                                <button
                                                    onClick={() => handleVerInfo(c)}
                                                    className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all duration-300"
                                                    title="Ver Detalles"
                                                >
                                                    <IoInformationCircleOutline size={18} className="hover:scale-110 transition-transform" />
                                                </button>
                                                {c.tipo_certificado === "adicional" && (
                                                    <button
                                                        onClick={() => handleEditar(c)}
                                                        className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all duration-300"
                                                        title="Editar"
                                                    >
                                                        <IoCreateOutline size={18} className="hover:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setCertToDelete(c);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-300"
                                                    title="Eliminar"
                                                >
                                                    <IoTrashOutline size={18} className="hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Vista Móvil (Cards) */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-10 text-center">
                            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Sincronizando...</span>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 font-medium italic">Sin certificaciones registradas</div>
                    ) : (
                        filtrados.map((c) => (
                            <div key={c.id_certificacion} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase">{c.codigo_certificado || "—"}</span>
                                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border
                                            ${c.tipo_certificado === "empresa" ? "bg-sky-500/10 text-sky-600 border-sky-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                                        `}>
                                            {c.tipo_certificado === "empresa" ? "ACADÉMICO" : "ADICIONAL"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-slate-900">
                                            {c.fecha_emision ? new Date(c.fecha_emision).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                                        </span>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Fecha Emisión</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 font-black shadow-sm border border-slate-100 flex-shrink-0">
                                        {c.usuario_nombre?.charAt(0) || "U"}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-xs font-bold text-slate-700 leading-tight truncate">{c.usuario_nombre || "—"}</span>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">{c.curso_nombre || "—"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                                    <button onClick={() => handleVerInfo(c)} className="p-2.5 text-sky-500 flex-1 flex justify-center"><IoInformationCircleOutline size={20} /></button>
                                    {c.tipo_certificado === "adicional" && (
                                        <button onClick={() => handleEditar(c)} className="p-2.5 text-amber-500 flex-1 flex justify-center"><IoCreateOutline size={20} /></button>
                                    )}
                                    <button onClick={() => { setCertToDelete(c); setIsDeleteOpen(true); }} className="p-2.5 text-rose-500 flex-1 flex justify-center"><IoTrashOutline size={20} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <InfoCertificadoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} item={selected} />
            <AddCertificadoModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={async (n) => {
                const res = await fetch(`${API_ADMIN}/certificaciones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(n),
                });
                if (res.ok) { fetchData(); return true; }
                return false;
            }} />
            {isEditModalOpen && certToEdit && (
                <EditCertificadoModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} item={certToEdit} onSave={async (e) => {
                    const res = await fetch(`${API_ADMIN}/certificaciones/${e.id_certificacion}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(e),
                    });
                    if (res.ok) { fetchData(); return true; }
                    return false;
                }} />
            )}

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleEliminar}
                itemName={certToDelete?.codigo_certificado || "este certificado"}
            />
        </div>
    );
}

export default Certificados;
