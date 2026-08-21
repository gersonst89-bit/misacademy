'use client';

import { useState, useMemo } from 'react';

import type { CertificacionAdicional, Usuario } from '../../types/models';
import AdminModal from '../Components/AdminModal';
import InputComponent from '../Components/InputComponent';
import { IoRibbonOutline } from 'react-icons/io5';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  onSave: (
    data: Omit<CertificacionAdicional, 'id_certificacion'> & {
      id_usuario?: number;
    },
  ) => Promise<boolean>;
};

export function AddCertificadoModal({ isOpen, onClose, onSave, usuarios }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nombreEstudiante, setNombreEstudiante] = useState('');
  const [dniEstudiante, setDniEstudiante] = useState('');
  const [nombreCurso, setNombreCurso] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [totalHoras, setTotalHoras] = useState<number | ''>('');
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [calificacionFinal, setCalificacionFinal] = useState<number | undefined>();
  const [modoRegistro, setModoRegistro] = useState<'registrado' | 'manual'>('registrado');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

  const resetForm = () => {
    setCodigo('');
    setNombreEstudiante('');
    setDniEstudiante('');
    setNombreCurso('');
    setFechaInicio('');
    setFechaFin('');
    setTotalHoras('');
    setEmailDestinatario('');
    setFechaEmision('');
    setError(null);
    setModoRegistro('registrado');
    setUsuarioSearch('');
    setSelectedUserId('');
    setCalificacionFinal(undefined);
  };

  const usuariosFiltrados = useMemo(() => {
    const t = usuarioSearch.toLowerCase().trim();

    if (!t) return usuarios.slice(0, 20);

    return usuarios
      .filter((u) => {
        const fullName = `${u.nombre ?? ''} ${u.apellido ?? ''}`.toLowerCase().trim();

        return (
          fullName.includes(t) ||
          (u.email ?? '').toLowerCase().includes(t) ||
          (u.dni ?? '').toLowerCase().includes(t)
        );
      })
      .slice(0, 20);
  }, [usuarios, usuarioSearch]);

  const handleModoChange = (modo: 'registrado' | 'manual') => {
    setModoRegistro(modo);
    setSelectedUserId('');
    setUsuarioSearch('');
    setNombreEstudiante('');
    setDniEstudiante('');
    setEmailDestinatario('');
  };

  const handleSelectUsuario = (u: Usuario) => {
    setSelectedUserId(u.id_usuario ?? '');
    setUsuarioSearch(`${u.nombre ?? ''} ${u.apellido ?? ''}`.trim());
    setNombreEstudiante(`${u.nombre ?? ''} ${u.apellido ?? ''}`.trim());
    setDniEstudiante(u.dni ?? '');
    setEmailDestinatario(u.email ?? '');
  };

  const handleSubmit = async () => {
    setError(null);

    if (!/^MIS-[A-Z0-9]{12}$/.test(codigo)) {
      return setError(
        "El código debe comenzar con 'MIS-' y tener exactamente 12 caracteres (letras o números).",
      );
    }

    if (modoRegistro === 'registrado' && !selectedUserId) {
      return setError('Selecciona un usuario registrado antes de emitir el certificado.');
    }

    if (
      !nombreEstudiante ||
      !nombreCurso ||
      !fechaInicio ||
      !fechaFin ||
      !totalHoras ||
      !emailDestinatario ||
      calificacionFinal === undefined
    ) {
      return setError('Por favor completa todos los campos requeridos.');
    }

    setIsSaving(true);

    try {
      const payload: Omit<CertificacionAdicional, 'id_certificacion'> & {
        id_usuario?: number;
      } = {
        tipo_certificado: 'adicional',
        codigo_certificado: codigo,
        nombre_estudiante: nombreEstudiante,
        nombre_curso: nombreCurso.trim(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        total_horas: totalHoras || 0,
        calificacion_final: calificacionFinal,
        email_destinatario: emailDestinatario,
        fecha_emision: fechaEmision || null,
        dni_estudiante: dniEstudiante || undefined,
      };

      if (modoRegistro === 'registrado' && selectedUserId) {
        payload.id_usuario = Number(selectedUserId);
      }

      const ok = await onSave(payload);

      if (ok) {
        resetForm();
        onClose();
      } else {
        setError('Error al procesar la solicitud.');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Certificado Adicional"
      maxWidth="max-w-3xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Registro Oficial MIS Academy
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Cargando...' : 'Confirmar Emisión'}
          </button>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-10 bg-slate-100/40 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1.25rem] md:rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-sky-500 shrink-0 relative z-10 transition-transform duration-500 group-hover:scale-110 border border-slate-50">
            <IoRibbonOutline size={34} />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h4 className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] bg-sky-100 px-4 py-1 rounded-full border border-sky-200/50 w-fit mb-3 mx-auto md:mx-0">
              Folio de Registro Nacional
            </h4>
            <p className="text-[12px] md:text-[13px] font-bold text-slate-400 leading-relaxed max-w-lg">
              Configure los parámetros legales y académicos del nuevo certificado para su registro
              oficial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputComponent
            label="Código de Certificado"
            value={codigo}
            onChange={(e) => {
              let v = e.target.value.toUpperCase();
              if (!v.startsWith('MIS-')) {
                v = 'MIS-' + v.replace(/^MIS-?/i, '');
              }
              const prefix = 'MIS-';
              const rest = v.substring(prefix.length).replace(/[^A-Z0-9]/g, '');
              v = prefix + rest;
              setCodigo(v.slice(0, 16));
            }}
            placeholder="Ej: MIS-ABC123XYZ789"
          />
          <InputComponent
            label="Fecha de Emisión"
            type="date"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
          />
        </div>

        <div className="space-y-4 md:space-y-6 bg-slate-50/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100/50">
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Datos del Beneficiario y Programa
            </span>
          </div>
          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/70 p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleModoChange('registrado')}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                  modoRegistro === 'registrado'
                    ? 'bg-sky-50 text-sky-600 border-sky-200'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                Usuario registrado
              </button>

              <button
                type="button"
                onClick={() => handleModoChange('manual')}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                  modoRegistro === 'manual'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                Persona no registrada
              </button>
            </div>

            {modoRegistro === 'registrado' && (
              <div className="space-y-3">
                <InputComponent
                  label="Buscar Usuario Registrado"
                  value={usuarioSearch}
                  onChange={(e) => {
                    setUsuarioSearch(e.target.value);
                    setSelectedUserId('');
                    setNombreEstudiante('');
                    setDniEstudiante('');
                    setEmailDestinatario('');
                  }}
                  placeholder="Buscar por nombre, apellido, email o DNI"
                />

                {usuarioSearch.trim() && (
                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                    {usuariosFiltrados.length > 0 ? (
                      usuariosFiltrados.map((u) => (
                        <button
                          key={u.id_usuario}
                          type="button"
                          onClick={() => handleSelectUsuario(u)}
                          className="w-full text-left px-4 py-3 border-b last:border-b-0 border-slate-100 hover:bg-sky-50 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-700">
                            {`${u.nombre ?? ''} ${u.apellido ?? ''}`.trim()}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            DNI: {u.dni || '—'} · {u.email || 'Sin email'}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-400">
                        No se encontraron usuarios registrados.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Nombre del Estudiante"
              value={nombreEstudiante}
              onChange={(e) => setNombreEstudiante(e.target.value)}
              placeholder="Nombre completo"
            />
            <InputComponent
              label="DNI del Estudiante"
              value={dniEstudiante}
              onChange={(e) => setDniEstudiante(e.target.value)}
              placeholder="Ej: 12345678"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Programa / Especialidad"
              value={nombreCurso}
              onChange={(e) => setNombreCurso(e.target.value)}
              placeholder="Nombre de la formación"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            <InputComponent
              label="Fecha Culminación"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Carga Horaria Total (Hrs)"
              type="number"
              value={String(totalHoras)}
              onChange={(e) => setTotalHoras(e.target.value ? Number(e.target.value) : '')}
            />
            <InputComponent
              label="Nota Final"
              type="number"
              value={calificacionFinal !== undefined ? String(calificacionFinal) : ''}
              onChange={(e) => {
                const value = e.target.value;
                setCalificacionFinal(value === '' ? undefined : Number(value));
              }}
              placeholder="Ej. 18.50"
              min="0"
              max="20"
              step="0.01"
            />
            <InputComponent
              label="Canal de Notificación (Email)"
              type="email"
              value={emailDestinatario}
              onChange={(e) => setEmailDestinatario(e.target.value)}
              placeholder="ejemplo@correo.com"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake mx-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-wider">
              {error}
            </p>
          </div>
        )}
      </div>
    </AdminModal>
  );
}

export default AddCertificadoModal;
