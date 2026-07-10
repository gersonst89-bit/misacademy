import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { apiClient } from "../services/apiClient";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { 
      role: "bot", 
      text: "🏛️ *ASISTENTE VIRTUAL - MIS ACADEMY* 🎓\n\nBienvenido/a. Por favor selecciona una opción enviando el número:\n\n1️⃣ Menú Principal\n2️⃣ Quiénes Somos\n3️⃣ Líneas Académicas (Especialidades)\n4️⃣ Catálogo de Cursos\n5️⃣ Rutas de Aprendizaje\n6️⃣ Precios, Ofertas y Formas de Pago\n7️⃣ Certificados y Metodología" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post("/chatbot", { message: input });
      const data = res.data;

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Lo siento, tuve un problema de conexión. Inténtalo de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante modernizado */}
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[9999] group"
      >
        <div className="absolute inset-0 bg-sky-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="relative bg-gradient-to-tr from-sky-600 to-blue-500 text-white p-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-white/20">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={28} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageCircle size={28} strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Ventana del Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-8 w-[90vw] max-w-[360px] h-[540px] bg-[#050a14]/60 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] rounded-[2rem] z-[9999] flex flex-col overflow-hidden ring-1 ring-white/5 font-outfit"
          >
            {/* Header Premium */}
            <div className="p-6 bg-gradient-to-r from-sky-600/20 to-transparent border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-500 blur-md opacity-50 animate-pulse" />
                  <div className="relative w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Bot size={24} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#050a14] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tight uppercase italic text-sm">Asistente <span className="text-sky-400">MIS</span></h3>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={10} className="text-sky-400" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Powered by MIS AI</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Área de Mensajes */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[88%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`mt-auto mb-1 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-sky-500/20 text-sky-400" : "bg-white/5 text-slate-400"
                    } border border-white/10`}>
                      {msg.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={`p-4 rounded-[1.5rem] text-sm leading-relaxed whitespace-pre-line shadow-xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-tr from-sky-600 to-blue-500 text-white rounded-br-none"
                          : "bg-white/[0.03] text-slate-200 border border-white/10 rounded-bl-none backdrop-blur-md"
                      }`}
                    >
                      <p className="font-medium tracking-tight">{msg.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bot size={14} className="text-sky-400 animate-pulse" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Área de Entrada Premium */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-[1.25rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <div className="relative flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="w-full bg-[#0a1219]/60 text-white text-sm pl-6 pr-14 py-4 rounded-2xl border border-white/10 focus:border-sky-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      input.trim() && !loading 
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:scale-105" 
                        : "text-slate-600 bg-white/5"
                    }`}
                  >
                    <Send size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 opacity-30">
                <div className="h-px w-8 bg-slate-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                  MIS ACADEMY INTELLIGENCE
                </p>
                <div className="h-px w-8 bg-slate-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </>
  );
}