import React from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import WhatsAppButton from "./WhatsAppButton";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface DefaultLayoutProps {
  children: ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="bg-premium min-h-screen relative flex flex-col">
      {/* Elementos de fondo globales animados */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-sky-600/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-blue-800/5 blur-[120px] animate-pulse" />
      </div>

      <Header />
      
      <main className="flex-grow relative z-10 pt-24 md:pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <Chatbot />
      <WhatsAppButton />
    </div>
  );
};

export default DefaultLayout;