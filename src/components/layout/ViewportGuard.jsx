import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Keeps the document viewport anchored to the physical screen edge.
 * Horizontal product/category scrollers remain independent; only accidental
 * document-level horizontal drift is corrected.
 */
export default function ViewportGuard() {
  const location = useLocation();
  const { lang } = useLanguage();

  useEffect(() => {
    const resetDocumentX = () => {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      if (window.scrollX !== 0) window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
    };

    resetDocumentX();
    const frame = requestAnimationFrame(resetDocumentX);
    const visualViewport = window.visualViewport;
    window.addEventListener('resize', resetDocumentX, { passive: true });
    window.addEventListener('orientationchange', resetDocumentX, { passive: true });
    visualViewport?.addEventListener('resize', resetDocumentX, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resetDocumentX);
      window.removeEventListener('orientationchange', resetDocumentX);
      visualViewport?.removeEventListener('resize', resetDocumentX);
    };
  }, [location.pathname, location.search, lang]);

  return null;
}
