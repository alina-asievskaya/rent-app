import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart as faHeartSolid,
  faUser,
  faTimes,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import "./Header.css";

const Header: React.FC = () => {
  const location = useLocation();
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "3-комн. квартира в ЦАО",
      price: "15,000,000 ₽",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop"
    },
    {
      id: 2,
      title: "2-комн. квартира у моря",
      price: "120,000 ₽/мес",
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop"
    }
  ]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const removeFromFavorites = (id: number) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const clearFavorites = () => {
    setFavorites([]);
    setShowFavorites(false);
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  // Функция для определения активного пункта меню
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <h2>Prime<span>House</span></h2>
          </Link>
        </div>
        
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={isActive("/") ? "active" : ""}
            >
              Главная
            </Link>
          </li>
          <li>
            <Link 
              to="/catalog" 
              className={isActive("/catalog") ? "active" : ""}
            >
              Каталог
            </Link>
          </li>
          <li>
            <Link 
              to="/agents" 
              className={isActive("/agents") ? "active" : ""}
            >
              Агенты
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={isActive("/about") ? "active" : ""}
            >
                О нас
            </Link>
          </li>
        </ul>
        
        <div className="nav-auth">
          {/* Кнопка избранного */}
          <div className="nav-favorites">
            <button 
              className="nav-favorites-btn" 
              onClick={toggleFavorites}
              aria-label="Избранное"
            >
              <FontAwesomeIcon 
                icon={favorites.length > 0 ? faHeartSolid : faHeartOutline} 
              />
              {favorites.length > 0 && (
                <span className="favorites-badge">{favorites.length}</span>
              )}
            </button>
            
            {/* Dropdown избранного */}
            <div className={`favorites-dropdown ${showFavorites ? 'show' : ''}`}>
              <div className="favorites-dropdown-header">
                <h4>Избранное ({favorites.length})</h4>
                {favorites.length > 0 && (
                  <button 
                    className="clear-favorites" 
                    onClick={clearFavorites}
                  >
                    Очистить
                  </button>
                )}
              </div>
              
              <div className="favorites-items">
                {favorites.length === 0 ? (
                  <div className="favorites-empty">
                    <FontAwesomeIcon icon={faHeartOutline} />
                    <p>В избранном пока ничего нет</p>
                  </div>
                ) : (
                  favorites.map(item => (
                    <div key={item.id} className="favorites-item">
                      <div className="favorites-item-image">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="favorites-item-content">
                        <div className="favorites-item-title">{item.title}</div>
                        <div className="favorites-item-price">{item.price}</div>
                      </div>
                      <button 
                        className="favorites-item-remove"
                        onClick={() => removeFromFavorites(item.id)}
                        aria-label="Удалить из избранного"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {favorites.length > 0 && (
                <div className="favorites-dropdown-footer">
                  <Link 
                    to="/favorites" 
                    className="view-all-favorites"
                    onClick={() => setShowFavorites(false)}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                    Перейти в избранное
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Профиль пользователя */}
          {isLoggedIn ? (
            <div className="user-profile">
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <button 
                className="btn-secondary" 
                onClick={toggleLogin}
              >
                Выйти
              </button>
            </div>
          ) : (
            <>
              <button 
                className="btn-secondary" 
                onClick={toggleLogin}
              >
                Войти
              </button>
              <button 
                className="btn-primary"
                onClick={toggleLogin}
              >
                Регистрация
              </button>
            </>
          )}
          
          {/* Кнопка мобильного меню */}
          <button 
            className="mobile-menu-btn"
            aria-label="Меню"
          >
            ☰
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;