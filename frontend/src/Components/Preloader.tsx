import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import './Preloader.css';

interface PreloaderProps {
  onFinish: () => void;
}

export default function Preloader({ onFinish }: PreloaderProps) {
  const [hide, setHide] = useState(false);
  const isMounted = useRef(true);

  // Referencias a cada línea de texto
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const line4Ref = useRef<HTMLSpanElement>(null);

  // Función que aplica el efecto "scramble" a un elemento
  const scrambleText = (element: HTMLElement | null, targetText: string) => {
    if (!element) return;

    // Matar cualquier animación previa
    gsap.killTweensOf(element);

    // Animación de "scramble"
    gsap.to(element, {
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: function () {
        const progress = this.progress(); // 0 a 1
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';

        for (let i = 0; i < targetText.length; i++) {
          const targetChar = targetText[i];
          if (targetChar === ' ') {
            result += ' ';
          } else {
            // Si el progreso es alto, muestra el caracter final
            if (i / targetText.length < progress) {
              result += targetChar;
            } else {
              // Sino, muestra un caracter aleatorio
              result += chars[Math.floor(Math.random() * chars.length)];
            }
          }
        }
        element.textContent = result;
      },
      onComplete: () => {
        element.textContent = targetText; // Asegura el texto final
      }
    });
  };

  useEffect(() => {
    isMounted.current = true;

    // Creamos una línea de tiempo para sincronizar todo
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    // 1. Revelar el logo (opacidad + escala) y aplicar scramble al mismo tiempo
    tl.fromTo('.logo',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 }
    )
    .call(() => {
      // Aplicamos scramble línea por línea con ligero retraso
      scrambleText(line1Ref.current, 'MATT');
      setTimeout(() => scrambleText(line2Ref.current, 'INNOVA'), 150);
      setTimeout(() => scrambleText(line3Ref.current, 'SOLUTION'), 300);
      setTimeout(() => scrambleText(line4Ref.current, 'SOLUCIONES TI QUE TRANSFORMAN'), 450);
    }, [], '+=0.1')

    // 2. Aparece el indicador de carga (puntos)
    .fromTo('.loader-indicator',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    )

    // 3. Glow final en el logo
    .to('.logo', {
      filter: 'drop-shadow(0 0 60px rgba(14, 165, 233, 0.3))',
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2');

    // 4. Esperamos 1.5s después de que termine la animación y ocultamos
    const hideTimer = setTimeout(() => {
      if (isMounted.current) {
        setHide(true);
        setTimeout(() => {
          if (isMounted.current) {
            onFinish();
          }
        }, 500);
      }
    }, 2200); // Tiempo total visible ~2.2s + 0.5s salida = 2.7s

    return () => {
      isMounted.current = false;
      clearTimeout(hideTimer);
      tl.kill(); // Limpia la timeline
    };
  }, [onFinish]);

  return (
    <div className={`preloader ${hide ? 'preloader--hide' : ''}`}>
      <div className="preloader-content">
        <div className="logo">
          <span className="logo-line logo-line--1" ref={line1Ref}>MATT</span>
          <span className="logo-line logo-line--2" ref={line2Ref}>INNOVA</span>
          <span className="logo-line logo-line--3" ref={line3Ref}>SOLUTION</span>
          <span className="logo-line logo-line--4" ref={line4Ref}>
            SOLUCIONES TI QUE TRANSFORMAN
          </span>
        </div>

        <div className="loader-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}