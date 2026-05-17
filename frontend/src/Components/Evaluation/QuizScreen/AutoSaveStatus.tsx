import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const AutoSaveStatus: React.FC = () => {
  const saveStatus = useSelector((state: any) => state.evaluation.saveStatus);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (saveStatus === 'saving' || saveStatus === 'error') {
      setVisible(true);
    } else if (saveStatus === 'saved') {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  if (!visible) return null;

  let text = '';
  if (saveStatus === 'saving') text = 'Guardando...';
  else if (saveStatus === 'saved') text = `Guardado`;
  else if (saveStatus === 'error') text = 'Error al guardar';

  return (
    <div className={`w-full flex justify-end px-4 md:px-8 pt-4 transition-opacity duration-1000 ${
      saveStatus === 'saved' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border shadow-lg ${
        saveStatus === 'error' 
          ? 'bg-red-500/10 text-red-500 border-red-500/30' 
          : 'bg-white/10 text-white/90 border-white/20'
      }`}>
        {saveStatus === 'saving' && <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />}
        {saveStatus === 'saved' && <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        {text}
      </div>
    </div>
  );
};

export default AutoSaveStatus;
