import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

type Message = {
  role: 'bot' | 'user';
  text: string;
};

const QUICK_OPTIONS = [
  {
    number: '1',
    title: 'Menú Principal',
  },
  {
    number: '2',
    title: 'Quiénes Somos',
  },
  {
    number: '3',
    title: 'Líneas Académicas',
  },
  {
    number: '4',
    title: 'Catálogo de Cursos',
  },
  {
    number: '5',
    title: 'Rutas de Aprendizaje',
  },
  {
    number: '6',
    title: 'Precios y Formas de Pago',
  },
  {
    number: '7',
    title: 'Certificados y Metodología',
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Bienvenido/a a MIS Academy. Estoy aquí para ayudarte con información sobre nuestros cursos, rutas y servicios.',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [isOpen]);

  /**
   * Envío centralizado del mensaje.
   * Mantiene el mismo endpoint y comportamiento del chatbot.
   */
  const sendMessageToBot = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/chatbot', {
        message,
      });

      const data = res.data;

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            data.reply ||
            'No pude encontrar una respuesta para esa consulta.',
        },
      ]);
    } catch (err) {
      console.error('Error en chatbot:', err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            'Lo siento, tuve un problema de conexión. Inténtalo de nuevo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    await sendMessageToBot(input);
  };

  const handleQuickOption = async (number: string) => {
    if (loading) return;

    await sendMessageToBot(number);
  };

  return (
    <>
      {/* =========================================================
          BOTÓN FLOTANTE DEL CHAT
      ========================================================= */}
      <motion.button
        initial={{
          scale: 0,
          opacity: 0,
          y: 20,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
        }}
        whileHover={{
          scale: 1.08,
          rotate: 2,
        }}
        whileTap={{
          scale: 0.94,
        }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-5 sm:bottom-7 sm:right-7 z-[9999] group ${
          isOpen ? 'hidden sm:block' : ''
        }`}
        aria-label={
          isOpen
            ? 'Cerrar asistente'
            : 'Abrir asistente'
        }
      >
        <div className="absolute inset-0 bg-sky-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl" />

        <div className="relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.35)] flex items-center justify-center border border-white/15">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{
                  rotate: -90,
                  opacity: 0,
                }}
                animate={{
                  rotate: 0,
                  opacity: 1,
                }}
                exit={{
                  rotate: 90,
                  opacity: 0,
                }}
              >
                <X
                  size={23}
                  strokeWidth={2.4}
                />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{
                  rotate: 90,
                  opacity: 0,
                }}
                animate={{
                  rotate: 0,
                  opacity: 1,
                }}
                exit={{
                  rotate: -90,
                  opacity: 0,
                }}
              >
                <MessageCircle
                  size={23}
                  strokeWidth={2.4}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* =========================================================
          VENTANA DEL CHAT
      ========================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.94,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              y: 35,
              scale: 0.94,
              filter: 'blur(8px)',
            }}
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 320,
            }}
            className="
              fixed z-[9999]
              flex flex-col overflow-hidden
              inset-3
              h-[calc(100dvh-1.5rem)]
              w-auto
              rounded-[1.75rem]

              sm:inset-auto
              sm:right-7
              sm:bottom-[90px]
              sm:h-[560px]
              sm:w-[92vw]
              sm:max-w-[380px]
              sm:rounded-[1.75rem]

              bg-[#030912]/95
              backdrop-blur-3xl
              border border-white/10
              shadow-[0_40px_100px_-25px_rgba(0,0,0,0.85)]
              ring-1 ring-white/5
              font-outfit
            "
          >
            {/* =====================================================
                HEADER
            ===================================================== */}
            <div className="relative shrink-0 px-4 py-4 sm:px-5 sm:py-5 border-b border-white/5 bg-gradient-to-br from-sky-500/[0.10] via-transparent to-transparent">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar del bot */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-sky-500/40 blur-xl animate-pulse" />

                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white border border-white/15 shadow-lg">
                      <Bot
                        size={22}
                        strokeWidth={2.3}
                      />
                    </div>

                    <div className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-[#030912] flex items-center justify-center border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[13px] sm:text-[15px] font-black text-white uppercase italic tracking-tight">
                      Asistente{' '}
                      <span className="text-sky-400">
                        MIS
                      </span>
                    </h3>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Sparkles
                        size={9}
                        className="text-sky-400"
                      />

                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                        MIS AI · En línea
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    shrink-0
                    w-9 h-9
                    sm:w-10 sm:h-10
                    flex items-center justify-center
                    rounded-xl
                    bg-white/[0.04]
                    hover:bg-white/[0.08]
                    border border-white/10
                    transition-all duration-300
                    group
                  "
                  aria-label="Cerrar asistente"
                >
                  <X
                    size={17}
                    className="text-slate-400 group-hover:text-white transition-colors"
                  />
                </button>
              </div>
            </div>

            {/* =====================================================
                MENSAJES
            ===================================================== */}
            <div
              ref={scrollRef}
              className="
                min-h-0
                flex-1
                px-3 py-4
                sm:px-5 sm:py-5
                overflow-y-auto
                space-y-4
                sm:space-y-5
                scroll-smooth
              "
              style={{
                scrollbarWidth: 'none',
              }}
            >
              {messages.map((msg, index) => {
                const isUser =
                  msg.role === 'user';

                const isWelcomeMessage =
                  index === 0 &&
                  msg.role === 'bot';

                return (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className={`flex ${
                      isUser
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`
                        flex gap-2.5
                        max-w-[94%]
                        sm:max-w-[90%]
                        ${
                          isUser
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div
                        className={`
                          mt-auto
                          mb-1
                          w-7 h-7
                          rounded-xl
                          shrink-0
                          flex items-center justify-center
                          border border-white/10
                          ${
                            isUser
                              ? 'bg-sky-500/15 text-sky-400'
                              : 'bg-white/[0.04] text-sky-400'
                          }
                        `}
                      >
                        {isUser ? (
                          <UserIcon size={13} />
                        ) : (
                          <Bot size={13} />
                        )}
                      </div>

                      <div className="flex flex-col gap-3 min-w-0">
                        {/* Burbuja */}
                        <div
                          className={`
                            px-3.5 py-3.5
                            sm:px-4 sm:py-3.5
                            rounded-2xl
                            text-[12px]
                            sm:text-[13px]
                            leading-relaxed
                            shadow-xl
                            whitespace-pre-line
                            ${
                              isUser
                                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-white/[0.035] text-slate-200 border border-white/[0.08] rounded-bl-md'
                            }
                          `}
                        >
                          <p
                            className={`
                              tracking-tight
                              ${
                                isUser
                                  ? 'font-medium'
                                  : 'font-medium'
                              }
                            `}
                          >
                            {msg.text}
                          </p>
                        </div>

                        {/* =================================================
                            MENÚ RÁPIDO
                        ================================================= */}
                        {isWelcomeMessage && (
                          <div className="flex flex-col gap-2">
                            <div className="px-1">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                ¿Qué deseas consultar?
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {QUICK_OPTIONS.map(
                                (option) => (
                                  <motion.button
                                    key={
                                      option.number
                                    }
                                    whileHover={{
                                      x: 3,
                                    }}
                                    whileTap={{
                                      scale: 0.985,
                                    }}
                                    onClick={() =>
                                      handleQuickOption(
                                        option.number,
                                      )
                                    }
                                    disabled={loading}
                                    className="
                                      group
                                      w-full
                                      flex items-center gap-3
                                      px-3 py-2.5
                                      sm:px-3.5 sm:py-3
                                      rounded-xl
                                      bg-white/[0.025]
                                      hover:bg-sky-500/[0.08]
                                      border border-white/[0.07]
                                      hover:border-sky-500/30
                                      text-left
                                      transition-all duration-300
                                      disabled:opacity-40
                                      disabled:cursor-not-allowed
                                    "
                                  >
                                    <span
                                      className="
                                        shrink-0
                                        w-7 h-7
                                        sm:w-8 sm:h-8
                                        rounded-lg
                                        flex items-center justify-center
                                        bg-sky-500/10
                                        border border-sky-500/15
                                        text-[10px]
                                        sm:text-[11px]
                                        font-black
                                        text-sky-400
                                        group-hover:bg-sky-500
                                        group-hover:text-white
                                        transition-all
                                      "
                                    >
                                      {option.number}
                                    </span>

                                    <span className="text-[11px] sm:text-[12px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                                      {option.title}
                                    </span>

                                    <span className="ml-auto text-slate-600 group-hover:text-sky-400 transition-colors">
                                      →
                                    </span>
                                  </motion.button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* =====================================================
                  LOADING
              ===================================================== */}
              {loading && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex justify-start"
                >
                  <div className="flex items-end gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                      <Bot
                        size={13}
                        className="text-sky-400"
                      />
                    </div>

                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.035] border border-white/[0.08] flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 bg-sky-400 rounded-full"
                        style={{
                          animation:
                            'chatDot 1s infinite ease-in-out',
                        }}
                      />

                      <span
                        className="w-1.5 h-1.5 bg-sky-400 rounded-full"
                        style={{
                          animation:
                            'chatDot 1s infinite ease-in-out',
                          animationDelay: '0.15s',
                        }}
                      />

                      <span
                        className="w-1.5 h-1.5 bg-sky-400 rounded-full"
                        style={{
                          animation:
                            'chatDot 1s infinite ease-in-out',
                          animationDelay: '0.3s',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* =====================================================
                INPUT
            ===================================================== */}
            <div className="shrink-0 px-3 py-3 sm:px-5 sm:py-4 bg-[#020710]/90 border-t border-white/5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-transparent rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="
                      w-full
                      bg-[#071018]
                      text-white
                      text-[13px]
                      sm:text-sm
                      pl-4
                      pr-14
                      py-3.5
                      sm:py-4
                      rounded-2xl
                      border border-white/10
                      focus:border-sky-500/40
                      focus:ring-1
                      focus:ring-sky-500/10
                      outline-none
                      transition-all
                      placeholder:text-slate-600
                      font-medium
                    "
                  />

                  <button
                    onClick={sendMessage}
                    disabled={
                      !input.trim() || loading
                    }
                    className={`
                      absolute
                      right-2
                      w-10 h-10
                      rounded-xl
                      flex items-center justify-center
                      transition-all duration-300
                      ${
                        input.trim() && !loading
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 hover:scale-105'
                          : 'bg-white/[0.05] text-slate-600 cursor-not-allowed'
                      }
                    `}
                    aria-label="Enviar mensaje"
                  >
                    <Send
                      size={17}
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-2 mt-2.5 sm:mt-3 opacity-40">
                <div className="h-px w-5 sm:w-7 bg-slate-500" />

                <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.22em] text-slate-500">
                  MIS ACADEMY INTELLIGENCE
                </p>

                <div className="h-px w-5 sm:w-7 bg-slate-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===========================================================
          ANIMACIONES DEL CHAT
      =========================================================== */}
      <style>{`
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes chatDot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </>
  );
}