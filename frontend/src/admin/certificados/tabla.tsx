'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  IoSearchOutline,
  IoAddOutline,
  IoCreateOutline,
  IoInformationCircleOutline,
  IoFilterOutline,
  IoTrashOutline,
  IoQrCodeOutline,
  IoClose,
  IoDownloadOutline,
} from 'react-icons/io5';
import { FaChevronDown } from 'react-icons/fa';
import type {
  Certificacion,
  CertificacionAdicional,
  CertificacionEmpresa,
  Curso,
  Usuario,
} from '../../types/models';
import { InfoCertificadoModal } from './infoCertificados';
import { AddCertificadoModal } from './agregarCertificados';
import { EditCertificadoModal } from './editCertificados';
import DeleteModal from '../Components/DeleteModal';
import FiltroCurso, { type OpcionFiltroPrograma } from '../Components/FiltroCursoCertificado';
import { apiClient } from '../../services/apiClient';

type TipoCertificado = '' | 'empresa' | 'adicional';

type CertificacionPlus = Certificacion & {
  curso_nombre?: string;
  usuario_nombre?: string;
  usuario_dni?: string;
  total_horas?: number;
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
    {
      value: '' as TipoCertificado,
      label: 'Todos los tipos',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      value: 'empresa' as TipoCertificado,
      label: 'Académicos (Empresa)',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      value: 'adicional' as TipoCertificado,
      label: 'Adicionales / Externos',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const current = tipos.find((t) => t.value === value) || tipos[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${value === 'empresa' ? 'bg-sky-500 animate-pulse' : value === 'adicional' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">
          {current.label}
        </span>
        <FaChevronDown
          className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-sky-500' : ''}`}
          size={10}
        />
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
                                ${
                                  value === t.value
                                    ? `${t.bg} ${t.color} shadow-sm`
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  t.value === 'empresa'
                    ? 'bg-sky-500'
                    : t.value === 'adicional'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                }`}
              />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QRCertificadoModal({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: CertificacionPlus | null;
}) {
  if (!isOpen || !item) return null;

  const verificationUrl = `${window.location.origin}/consulta?codigo=${item.codigo_certificado}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(
    verificationUrl,
  )}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${item.codigo_certificado}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando QR:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <IoClose size={22} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-1 text-sky-600">
            <IoQrCodeOutline size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Código QR de Verificación
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-1">{item.codigo_certificado}</h3>
          <p className="text-xs text-slate-400 font-bold mb-6">
            {item.usuario_nombre || '—'} · {item.curso_nombre || '—'}
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <img
              src={qrImageUrl}
              alt={`QR ${item.codigo_certificado}`}
              width={220}
              height={220}
              className="rounded-lg"
            />
          </div>

          <p className="text-[10px] text-slate-400 font-medium mb-6 break-all px-2">
            {verificationUrl}
          </p>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95"
          >
            <IoDownloadOutline size={16} />
            Descargar QR
          </button>
        </div>
      </div>
    </div>
  );
}

export function Certificados() {
  const [items, setItems] = useState<CertificacionPlus[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [programasGlobales, setProgramasGlobales] = useState<OpcionFiltroPrograma[]>([]);
  const [programaFiltro, setProgramaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoCertificado>('');
  const [loading, setLoading] = useState(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selected, setSelected] = useState<CertificacionPlus | null>(null);
  const [certToEdit, setCertToEdit] = useState<CertificacionAdicional | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<CertificacionPlus | null>(null);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [certForQr, setCertForQr] = useState<CertificacionPlus | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);

  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [busqueda]);

  const cursoById = useMemo(() => {
    const m = new Map<number, string>();
    cursos.forEach((c) => m.set(c.id_curso, c.nombre));
    return m;
  }, [cursos]);

  const normalizarTexto = (valor: unknown) =>
    String(valor ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const opcionesPrograma = useMemo<OpcionFiltroPrograma[]>(() => {
    const opciones = new Map<string, OpcionFiltroPrograma>();

    if (tipoFiltro !== 'empresa') {
      programasGlobales.forEach((programa) => {
        opciones.set(programa.value, programa);
      });
    }

    if (tipoFiltro !== 'adicional') {
      items.forEach((certificado) => {
        if (certificado.tipo_certificado === 'adicional') {
          return;
        }

        const certificadoEmpresa = certificado as CertificacionEmpresa;

        const idCurso = Number(certificadoEmpresa.id_curso);

        if (!idCurso) return;

        const nombreCurso =
          cursoById.get(idCurso) ?? certificado.curso_nombre ?? 'Curso sin nombre';

        const value = `curso:${idCurso}`;

        opciones.set(value, {
          value,
          label: nombreCurso,
        });
      });
    }

    return Array.from(opciones.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [items, tipoFiltro, cursoById, programasGlobales]);

  const decorate = (
    raw: any[],
    cursosActuales: Curso[],
    usuariosActuales: Usuario[],
  ): CertificacionPlus[] =>
    raw.map((c) => {
      const ce = c as any;

      const usuarioNombre = ce.usuario
        ? `${ce.usuario.nombre} ${ce.usuario.apellido || ''}`.trim()
        : null;

      const usuarioDni = ce.usuario?.dni || null;

      const cursoNombre = ce.curso ? ce.curso.nombre : null;

      if (c.tipo_certificado !== 'adicional') {
        const cursoRelacionado = cursosActuales.find(
          (curso) => Number(curso.id_curso) === Number(ce.id_curso),
        );

        const usuarioRelacionado = usuariosActuales.find(
          (usuario) => Number(usuario.id_usuario) === Number(ce.id_usuario),
        );

        return {
          ...c,
          curso_nombre: cursoNombre ?? cursoRelacionado?.nombre ?? '—',
          usuario_nombre:
            (usuarioNombre ??
              `${usuarioRelacionado?.nombre ?? ''} ${usuarioRelacionado?.apellido ?? ''}`.trim()) ||
            '—',
          usuario_dni: usuarioDni ?? usuarioRelacionado?.dni ?? '—',
        };
      }

      return {
        ...c,
        curso_nombre: ce.nombre_curso ?? ce.nombrecurso ?? ce.cursonombre ?? '—',
        usuario_nombre: ce.nombre_estudiante ?? '—',
        total_horas:
          ce.horas !== undefined && ce.horas !== null ? Number(ce.horas) : ce.total_horas,
      };
    });

  const fetchData = async () => {
    setLoading(true);

    try {
      // Cursos
      const resC = await apiClient.get('/mis-cursos');
      const cursosData = parseList<Curso>(resC.data);

      setCursos(cursosData);

      // Usuarios
      const resU = await apiClient.get('/admin/usuarios');
      const usuariosData = parseList<Usuario>(resU.data);

      setUsuarios(usuariosData);

      const resP = await apiClient.get('/admin/certificaciones/programas');

      const programasData: string[] = Array.isArray(resP.data) ? resP.data : [];

      setProgramasGlobales(
        programasData.map((programa) => ({
          value: `programa:${normalizarTexto(programa)}`,
          label: programa,
        })),
      );

      const opcionSeleccionada = opcionesPrograma.find((opcion) => opcion.value === programaFiltro);

      const cursoId = programaFiltro.startsWith('curso:')
        ? Number(programaFiltro.replace('curso:', ''))
        : undefined;

      const programa = programaFiltro.startsWith('programa:')
        ? opcionSeleccionada?.label
        : undefined;

      // Certificados paginados
      const result = await apiClient.get('/admin/certificaciones', {
        params: {
          page,
          perPage: 20,
          ...(busquedaDebounced ? { busqueda: busquedaDebounced } : {}),

          ...(tipoFiltro ? { tipo_certificado: tipoFiltro } : {}),

          ...(programa ? { programa } : {}),

          ...(cursoId ? { cursoId } : {}),
        },
      });

      const response = result.data;
      const certificadosData = response?.data ?? [];

      setItems(decorate(certificadosData, cursosData, usuariosData));

      setTotal(response?.total ?? 0);
      setLastPage(response?.lastPage ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, tipoFiltro, programaFiltro, busquedaDebounced]);

  useEffect(() => {
    setProgramaFiltro('');
  }, [tipoFiltro]);

  useEffect(() => {
    const existeProgramaSeleccionado = opcionesPrograma.some(
      (opcion) => opcion.value === programaFiltro,
    );

    if (programaFiltro && !existeProgramaSeleccionado) {
      setProgramaFiltro('');
    }
  }, [opcionesPrograma, programaFiltro]);

  const filtrados = items;

  const handleVerInfo = (c: CertificacionPlus) => {
    setSelected(c);
    setIsInfoOpen(true);
  };

  const handleVerQr = (c: CertificacionPlus) => {
    setCertForQr(c);
    setIsQrOpen(true);
  };

  const handleEditar = (c: CertificacionPlus) => {
    if (c.tipo_certificado !== 'adicional') return;
    setCertToEdit(c as CertificacionAdicional);
    setIsEditModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!certToDelete) return;
    try {
      await apiClient.delete(`/admin/certificaciones/${certToDelete.id_certificacion}`);
      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchData();
      }
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error eliminando certificado.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md group">
          <IoSearchOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors"
            size={18}
          />
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
          <IoAddOutline
            size={18}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Emitir Certificado
        </button>
      </div>
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-200/50 w-full sm:w-auto justify-center sm:justify-start">
          <IoFilterOutline size={18} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Filtrar por
          </span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />

        <div className="grid grid-cols-1 md:flex items-center gap-3 w-full">
          <FiltroTipo
            value={tipoFiltro}
            onChange={(value) => {
              setTipoFiltro(value);
              setPage(1);
            }}
          />

          <div className="w-full md:w-auto">
            <FiltroCurso
              value={programaFiltro}
              onChange={(value) => {
                setProgramaFiltro(value);
                setPage(1);
              }}
              opciones={opcionesPrograma}
              placeholder={
                tipoFiltro === 'empresa'
                  ? 'Filtrar por curso'
                  : tipoFiltro === 'adicional'
                    ? 'Filtrar por programa'
                    : 'Filtrar por curso o programa'
              }
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
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Certificado & Tipo
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Titular
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Programa / Curso
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">
                  Emisión
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        Sincronizando certificados...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-gray-400 font-medium italic"
                  >
                    No se encontraron certificaciones
                  </td>
                </tr>
              ) : (
                filtrados.map((c) => (
                  <tr
                    key={c.id_certificacion}
                    className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight uppercase">
                          {c.codigo_certificado || '—'}
                        </span>
                        <div
                          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border w-fit transition-all duration-500
                                                    ${
                                                      c.tipo_certificado !== 'adicional'
                                                        ? 'bg-sky-500/10 text-sky-600 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                                                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                    }
                                                `}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${c.tipo_certificado !== 'adicional' ? 'bg-sky-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}
                          />
                          {c.tipo_certificado !== 'adicional' ? 'ACADÉMICO' : 'ADICIONAL'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                          {c.usuario_nombre?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 tracking-tight leading-tight">
                            {c.usuario_nombre || '—'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            Estudiante Certificado
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col max-w-xs">
                        <p className="text-[13px] font-black text-slate-600 group-hover:text-slate-900 transition-colors truncate leading-tight">
                          {c.curso_nombre || '—'}
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Programa MIS Academy
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-slate-900 leading-none">
                          {c.fecha_emision
                            ? new Date(c.fecha_emision).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                              })
                            : '—'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {c.fecha_emision ? new Date(c.fecha_emision).getFullYear() : ''}
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
                          <IoInformationCircleOutline
                            size={18}
                            className="hover:scale-110 transition-transform"
                          />
                        </button>
                        <button
                          onClick={() => handleVerQr(c)}
                          className="p-2.5 rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all duration-300"
                          title="Generar QR"
                        >
                          <IoQrCodeOutline
                            size={18}
                            className="hover:scale-110 transition-transform"
                          />
                        </button>

                        {c.tipo_certificado === 'adicional' && (
                          <button
                            onClick={() => handleEditar(c)}
                            className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all duration-300"
                            title="Editar"
                          >
                            <IoCreateOutline
                              size={18}
                              className="hover:scale-110 transition-transform"
                            />
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
                          <IoTrashOutline
                            size={18}
                            className="hover:scale-110 transition-transform"
                          />
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

              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                Sincronizando...
              </span>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">
              Sin certificaciones registradas
            </div>
          ) : (
            filtrados.map((c) => (
              <div
                key={c.id_certificacion}
                className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase">
                      {c.codigo_certificado || '—'}
                    </span>

                    <div
                      className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        c.tipo_certificado !== 'adicional'
                          ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {c.tipo_certificado !== 'adicional' ? 'ACADÉMICO' : 'ADICIONAL'}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">
                      {c.fecha_emision
                        ? new Date(c.fecha_emision).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>

                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Fecha Emisión
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 font-black shadow-sm border border-slate-100 flex-shrink-0">
                    {c.usuario_nombre?.charAt(0) || 'U'}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-700 leading-tight truncate">
                      {c.usuario_nombre || '—'}
                    </span>

                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">
                      {c.curso_nombre || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleVerInfo(c)}
                    className="p-2.5 text-sky-500 flex-1 flex justify-center"
                    title="Ver detalles"
                  >
                    <IoInformationCircleOutline size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerQr(c)}
                    className="p-2.5 text-indigo-500 flex-1 flex justify-center"
                    title="Generar QR"
                  >
                    <IoQrCodeOutline size={20} />
                  </button>

                  {c.tipo_certificado === 'adicional' && (
                    <button
                      type="button"
                      onClick={() => handleEditar(c)}
                      className="p-2.5 text-amber-500 flex-1 flex justify-center"
                      title="Editar"
                    >
                      <IoCreateOutline size={20} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCertToDelete(c);
                      setIsDeleteOpen(true);
                    }}
                    className="p-2.5 text-rose-500 flex-1 flex justify-center"
                    title="Eliminar"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Paginación dentro de la tarjeta */}
        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-5">
            <p className="text-xs font-bold text-slate-400">
              Página {page} de {lastPage} · {total} certificados
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white">
                {page}
              </span>

              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Cierra Main Table */}
      <InfoCertificadoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        item={selected}
      />
      <QRCertificadoModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} item={certForQr} />

      <AddCertificadoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        usuarios={usuarios}
        onSave={async (n) => {
          try {
            await apiClient.post('/admin/certificaciones', n);
            await fetchData();
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        }}
      />
      {isEditModalOpen && certToEdit && (
        <EditCertificadoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={certToEdit}
          onSave={async (e) => {
            try {
              await apiClient.put(`/admin/certificaciones/${e.id_certificacion}`, e);
              await fetchData();
              return true;
            } catch (error) {
              console.error(error);
              return false;
            }
          }}
        />
      )}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleEliminar}
        itemName={certToDelete?.codigo_certificado || 'este certificado'}
      />
    </div>
  );
}

export default Certificados;
