import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faArrowRight,
  faBuilding,
  faSpinner,
  faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';

interface House {
  id: number;
  price: number;
  houseType: string;
  photos: string[];
  rentType?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Неверный формат токена');
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    return null;
  }
};

const formatPriceWithIcon = (price: number, rentType?: string): React.ReactNode => {
  const unit = rentType === 'month' ? 'месяц' : 'сутки';
  const numberStr = price.toLocaleString('ru-RU');
  const suffix = `/${unit}`;
  return (
    <>
      {numberStr} <i className="nbrb-icon">&#xe901;</i>{suffix}
    </>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadUserFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/favorites/my-favorites-ids', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) setFavorites(new Set<number>(data.data));
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    }
  };

  const loadPropertiesFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5213/api/houses', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const result: ApiResponse<House[]> = await response.json();
        if (result.success && result.data) {
          setFeaturedProperties(result.data.slice(0, 3));
        } else {
          setFeaturedProperties([]);
        }
      } else {
        setFeaturedProperties([]);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setError('Не удалось загрузить данные');
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadPropertiesFromApi();
      await loadUserFavorites();
    };
    init();
  }, []);

  useEffect(() => {
    const handleFavoritesUpdate = () => {
      loadUserFavorites();
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, []);

  const handleSearchClick = () => navigate("/catalog");
  const handleListProperty = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/profile?tab=add-property");
    } else {
      navigate("/login");
    }
  };
  const handleViewAllProperties = () => navigate("/catalog");
  const handlePropertyClick = (id: number) => navigate(`/house/${id}`);

  const handleFavoriteClick = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = parseJwt(token);
      if (!payload) {
        console.error('Ошибка авторизации');
        return;
      }

      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      if (role === 'Admin') {
        console.warn('Администраторы не могут добавлять в избранное');
        return;
      }

      const isFavorite = favorites.has(id);
      const url = isFavorite
        ? `http://localhost:5213/api/favorites/remove/${id}`
        : `http://localhost:5213/api/favorites/add/${id}`;
      const method = isFavorite ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (isFavorite) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      } else if (response.status === 403) {
        console.warn('У вас нет прав на это действие');
      } else {
        const errorData = await response.json();
        console.error(errorData.message || 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Ошибка при работе с избранным:', error);
    }
  };

  return (
    <>
      <Header />
      <main className="home-page">
        <section className="hero-premium">
          <div className="hero-premium-bg"></div>
          <div className="hero-premium-overlay"></div>
          <div className="container hero-premium-container">
            <div className="hero-premium-content">
              <h1 className="hero-premium-title">
                <span className="gradient-text">Элитная недвижимость</span>
                <br />для аренды в Беларуси
              </h1>
              <div className="hero-premium-divider"></div>
              <p className="hero-premium-subtitle">
                Находите и снимайте лучшие коттеджи, виллы и особняки.
                Эксклюзивные предложения премиум-класса.
              </p>
              <div className="hero-premium-buttons">
                <button className="btn-premium-primary" onClick={handleSearchClick}>
                  <FontAwesomeIcon icon={faSearch} /> Найти жилье
                </button>
                <button className="btn-premium-secondary" onClick={handleListProperty}>
                  <FontAwesomeIcon icon={faBuilding} /> Сдать недвижимость
                </button>
              </div>
            </div>
          </div>
          
          <div className="hero-premium-decoration">
            <div className="circle-1"></div>
            <div className="circle-2"></div>
          </div>
        </section>

        <section className="categories-section">
          <div className="container">
            <h2 className="section-title-modern">Типы элитного жилья</h2>

            <div className="categories-grid-photo">

              <div className="category-photo-card">
                <img src="/photo/cotagge.jpeg" alt="Коттеджи" />
                <div className="category-photo-overlay">
                  <h3>Коттеджи</h3>
                  <p className="category-description">
                    Загородный отдых в окружении природы и тишины
                  </p>
                </div>
              </div>

              <div className="category-photo-card">
                <img src="/photo/villa.jpg" alt="Виллы" />
                <div className="category-photo-overlay">
                  <h3>Виллы</h3>
                  <p className="category-description">
                    Роскошные дома с бассейнами и просторными террасами
                  </p>
                </div>
              </div>

              <div className="category-photo-card">
                <img src="/photo/osobnnak.jpg" alt="Особняки" />
                <div className="category-photo-overlay">
                  <h3>Особняки</h3>
                  <p className="category-description">
                    Просторные резиденции премиум-класса для больших компаний
                  </p>
                </div>
              </div>

              <div className="category-photo-card">
                <img src="/photo/taynhouse.jpg" alt="Таунхаусы" />
                <div className="category-photo-overlay">
                  <h3>Таунхаусы</h3>
                  <p className="category-description">
                    Современное жильё с комфортом загородной жизни
                  </p>
                </div>
              </div>

              <div className="category-photo-card">
                <img src="/photo/ysadba.jpg" alt="Усадьбы" />
                <div className="category-photo-overlay">
                  <h3>Усадьбы</h3>
                  <p className="category-description">
                    Атмосферные дома для отдыха и семейных мероприятий
                  </p>
                </div>
              </div>

              <div className="category-photo-card">
                <img src="/photo/home.jpg" alt="Резиденции" />
                <div className="category-photo-overlay">
                  <h3>Резиденции</h3>
                  <p className="category-description">
                    Эксклюзивная недвижимость для взыскательных гостей
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="featured-section-modern">
          <div className="container">
            <div className="section-header-modern">
              <h2 className="section-title-modern">Премиум предложения</h2>
              <button className="view-all-btn-modern" onClick={handleViewAllProperties}>
                Все предложения <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            {loading ? (
              <div className="loading-properties"><FontAwesomeIcon icon={faSpinner} spin size="2x" /><p>Загрузка...</p></div>
            ) : error ? (
              <div className="error-message"><p>{error}</p><button onClick={loadPropertiesFromApi}>Повторить</button></div>
            ) : featuredProperties.length > 0 ? (
              <div className="properties-grid-modern">
                {featuredProperties.map((property) => (
                  <div key={property.id} className="property-card-modern" onClick={() => handlePropertyClick(property.id)}>
                    <div className="property-image-modern">
                      <img src={property.photos?.[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop"} alt={property.houseType} />
                      <button className="favorite-btn-modern" onClick={(e) => handleFavoriteClick(property.id, e)}>
                        <FontAwesomeIcon icon={favorites.has(property.id) ? faHeartSolid : faHeartOutline} style={{ color: favorites.has(property.id) ? '#EF4444' : 'var(--gold, #d4af37)' }} />
                      </button>
                    </div>
                    <div className="property-content-modern">
                      <div className="property-price-modern">
                        <span className="price-modern">
                          {formatPriceWithIcon(property.price, property.rentType)}
                        </span>
                      </div>
                      <h3 className="property-title-modern">{property.houseType}</h3>
                      <button className="property-btn-modern">Подробнее <FontAwesomeIcon icon={faArrowRight} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-properties"><p>Нет активных объявлений</p></div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;