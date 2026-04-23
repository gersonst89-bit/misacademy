import React from 'react';
import { useSelector } from 'react-redux';

const EvaluationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentScreen = useSelector((state: any) => state.evaluation.currentScreen);
  const [prevScreen, setPrevScreen] = React.useState(currentScreen);
  const [fade, setFade] = React.useState(1);

  React.useEffect(() => {
    if (prevScreen !== currentScreen) {
      setFade(0);
      const timer = setTimeout(() => {
        setPrevScreen(currentScreen);
        setFade(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, prevScreen]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(45deg, #0E1C2B 0%, #09111D 50%, #0E1C2B 100%)' }}>
      <div style={{ opacity: fade, transition: 'opacity 0.3s ease-in-out' }}>
        {children}
      </div>
    </div>
  );
};

export default EvaluationLayout;
