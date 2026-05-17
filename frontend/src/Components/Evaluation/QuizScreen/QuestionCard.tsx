import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAnswer, toggleMarkForReview } from '../../../store/evaluationSlice';
import styles from '../QuizScreen.module.css';

interface Props {
  question: any;
  currentAnswer: any;
}

const QuestionCard: React.FC<Props> = ({ question, currentAnswer }) => {
  const dispatch = useDispatch();

  const handleOptionChange = (optionId: string) => {
    let newSelected: string[] = [];
    if (question.allowMultipleAnswers) {
      newSelected = currentAnswer?.selectedOptions || [];
      if (newSelected.includes(optionId)) {
        newSelected = newSelected.filter(id => id !== optionId);
      } else {
        newSelected = [...newSelected, optionId];
      }
    } else {
      newSelected = [optionId];
    }
    dispatch(setAnswer({
      questionId: question.id_pregunta,
      answer: {
        selectedOptions: newSelected,
        markedForReview: currentAnswer?.markedForReview || false,
        answeredAt: new Date().toISOString(),
      },
    }));
  };

  const handleMarkForReview = () => {
    dispatch(toggleMarkForReview(question.id_pregunta));
  };

  return (
    <div className="w-full my-4">
      {/* Main Card */}
      <div className="w-full bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white font-medium text-xs">{question.orden || question.index || question.id_pregunta}</span>
            </div>
            <span className="text-white/50 font-medium tracking-wide text-xs uppercase">Pregunta Actual</span>
          </div>
          
          <button 
            onClick={handleMarkForReview}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              currentAnswer?.markedForReview 
                ? 'bg-amber-500 text-black hover:bg-amber-400' 
                : 'bg-transparent text-white/60 border border-white/10 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill={currentAnswer?.markedForReview ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <span className="hidden sm:inline">{currentAnswer?.markedForReview ? 'Marcada' : 'Revisar después'}</span>
          </button>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-10">
          {question.texto_pregunta}
        </h3>

        <div className="space-y-3">
          {question.opciones?.map((op: any) => {
            const isSelected = currentAnswer?.selectedOptions?.includes(op.id_opcion);
            return (
              <div
                key={op.id_opcion}
                onClick={() => handleOptionChange(op.id_opcion)}
                className={`p-5 rounded-xl cursor-pointer transition-all duration-200 border flex items-center gap-4 group ${
                  isSelected 
                    ? 'bg-white/10 border-white text-white' 
                    : 'bg-transparent border-white/10 hover:bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'border-white bg-white' : 'border-white/30 group-hover:border-white/60'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
                <span className="text-base font-medium">
                  {op.texto_opcion}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
