import React from 'react';
import { useSelector } from 'react-redux';
import styles from '../QuizScreen.module.css';

const AutoSaveStatus: React.FC = () => {
  const saveStatus = useSelector((state: any) => state.evaluation.saveStatus);
  const lastSaved = useSelector((state: any) => state.evaluation.lastSaved);

  let text = '';
  if (saveStatus === 'saving') text = 'Guardando...';
  else if (saveStatus === 'saved') text = `Guardado (${new Date(lastSaved).toLocaleTimeString()})`;
  else if (saveStatus === 'error') text = 'Error al guardar';

  return (
    <div className={
      `${styles['autosave-status']}${saveStatus === 'error' ? ' ' + styles['error'] : ''}`
    }>
      {text}
    </div>
  );
};

export default AutoSaveStatus;
