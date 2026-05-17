import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentQuestion, nextQuestion, previousQuestion } from '../../../store/evaluationSlice';
import styles from '../QuizScreen.module.css';

interface Props {
  onFinish: () => void;
}

const QuestionMiniMap: React.FC<Props> = ({ onFinish }) => {
  const dispatch = useDispatch();
  const questions = useSelector((state: any) => state.evaluation.questions);
  const currentQuestionIndex = useSelector((state: any) => state.evaluation.currentQuestionIndex);
  const answers = useSelector((state: any) => state.evaluation.answers);

  const miniMap = questions.map((q: any, idx: number) => {
    const ans = answers[q.id_pregunta];
    let status: 'answered' | 'marked' | 'unanswered' | 'current' = 'unanswered';
    if (idx === currentQuestionIndex) status = 'current';
    else if (ans?.markedForReview) status = 'marked';
    else if (ans?.selectedOptions?.length) status = 'answered';
    return { questionId: q.id_pregunta, index: idx, status };
  });

  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full">
      
      {/* Left side: Navigation Map & Legend */}
      <div className="flex flex-col gap-3 flex-1 w-full max-w-full overflow-hidden">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] bg-white/40" />Respondida</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] bg-amber-500" />Marcada</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] bg-white" />Actual</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] border border-white/30" />Pendiente</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar w-full">
          {miniMap.map((item: any, idx: number) => {
            let itemClass = "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer border shrink-0 ";
            if (item.status === 'current') itemClass += "bg-white text-black border-white";
            else if (item.status === 'marked') itemClass += "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20";
            else if (item.status === 'answered') itemClass += "bg-white/10 text-white border-white/20 hover:bg-white/20";
            else itemClass += "bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white";

            return (
              <div
                key={item.questionId}
                className={itemClass}
                onClick={() => dispatch(setCurrentQuestion(item.index))}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t border-white/10 md:border-none pb-1">
        <button 
          onClick={() => dispatch(previousQuestion())} 
          disabled={currentQuestionIndex === 0}
          className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-semibold transition-all border disabled:cursor-not-allowed bg-transparent border-white/20 text-white hover:bg-white/5 disabled:border-white/5 disabled:text-white/30 disabled:hover:bg-transparent"
        >
          Anterior
        </button>
        <button 
          onClick={() => dispatch(nextQuestion())} 
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-semibold transition-all border disabled:cursor-not-allowed bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 disabled:bg-white/5 disabled:border-transparent disabled:text-white/30 disabled:hover:bg-white/5"
        >
          Siguiente
        </button>
        <button 
          onClick={onFinish} 
          className="flex-1 md:flex-none px-6 py-2.5 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-lg transition-all md:ml-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default QuestionMiniMap;
