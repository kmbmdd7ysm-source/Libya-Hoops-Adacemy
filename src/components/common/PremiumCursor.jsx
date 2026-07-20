import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function PremiumCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !window.matchMedia('(pointer:fine)').matches) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      raf;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    };
    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    const over = (e) => {
      const interactive = e.target.closest('a,button,input,select,textarea,[data-cursor]');
      ring.classList.toggle('is-active', Boolean(interactive));
      dot.classList.toggle('is-active', Boolean(interactive));
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    raf = requestAnimationFrame(tick);
    if (reducedMotion) return null;

    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <span ref={dotRef} className="premium-cursor-dot" aria-hidden="true" />
      <span ref={ringRef} className="premium-cursor-ring" aria-hidden="true" />
    </>
  );
}
