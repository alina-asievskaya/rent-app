// ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Прокручиваем к верху страницы
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Можно заменить на 'auto' для мгновенного скролла
    });
  }, [pathname]); // Срабатывает при каждом изменении пути

  return null; // Этот компонент ничего не рендерит
};

export default ScrollToTop;