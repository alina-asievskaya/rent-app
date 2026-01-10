import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./Home.css";

// Импорт Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faArrowRight,
  faBuilding,
  faSpinner,
  faShieldAlt,
  faCheckCircle,
  faClock,
  faHome,
  faWarehouse,
  faMountain,
  faSwimmingPool,
  faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';

// Интерфейсы для данных из API
interface House {
  id: number;
  price: number;
  houseType: string;
  photos: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Загрузка избранного пользователя
  const loadUserFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5213/api/favorites/my-favorites-ids', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const favoriteIds = new Set<number>(data.data);
          setFavorites(favoriteIds);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
    }
  };

  // Загрузка данных из API каталога
  const loadPropertiesFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Пробуем получить данные из основного эндпоинта домов
      const response = await fetch('http://localhost:5213/api/houses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: ApiResponse<House[]> = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          // Берем первые 3 дома для отображения
          const properties = result.data.slice(0, 3);
          setFeaturedProperties(properties);
        } else {
          setFeaturedProperties([]);
        }
      } else {
        setFeaturedProperties([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setError('Не удалось загрузить данные с сервера');
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    const initData = async () => {
      await loadPropertiesFromApi();
      await loadUserFavorites();
    };

    initData();
  }, []);

  // Категории с иконками
  const categories = [
    { icon: faHome, label: "Коттеджи", color: "#3B82F6" },
    { icon: faWarehouse, label: "Виллы", color: "#10B981" },
    { icon: faWarehouse, label: "Особняки", color: "#8B5CF6" },
    { icon: faHome, label: "Таунхаусы", color: "#F59E0B" },
    { icon: faMountain, label: "Усадьбы", color: "#EC4899" },
    { icon: faSwimmingPool, label: "Резиденции", color: "#06B6D4" }
  ];

  // Преимущества
  const benefits = [
    {
      icon: faShieldAlt,
      title: "Безопасность",
      description: "Все сделки под защитой"
    },
    {
      icon: faCheckCircle,
      title: "Проверка",
      description: "Каждый объект проверен"
    },
    {
      icon: faClock,
      title: "Скорость",
      description: "Быстрое оформление"
    }
  ];

  // Обработчики
  const handleSearchClick = () => {
    navigate("/catalog");
  };

  const handleListProperty = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/profile?tab=add-property");
    } else {
      alert("Для размещения объявления необходимо войти в систему");
      navigate("/login");
    }
  };

  const handleViewAllProperties = () => {
    navigate("/catalog");
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/house/${propertyId}`);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/catalog?type=${encodeURIComponent(category)}`);
  };

  const handleFavoriteClick = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Для добавления в избранное необходимо войти в систему");
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      
      if (userEmail?.toLowerCase() === 'admin@gmail.com') {
        alert('Администраторы не могут добавлять дома в избранное');
        return;
      }

      const isCurrentlyFavorite = favorites.has(id);

      if (isCurrentlyFavorite) {
        // Удаляем из избранного
        const deleteResponse = await fetch(`http://localhost:5213/api/favorites/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      } else {
        // Добавляем в избранное
        const addResponse = await fetch(`http://localhost:5213/api/favorites/add/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (addResponse.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      alert('Произошла ошибка');
    }
  };

  // Функция для форматирования цены
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} Br/мес`;
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="hero-modern">
        <div className="container">
          <div className="hero-content-modern">
            <div className="hero-text-modern">
              <h1 className="hero-title-modern">
                <span className="gradient-text">Элитная недвижимость</span>
                <br />для аренды в Беларуси
              </h1>
              <p className="hero-subtitle-modern">
                Находите и снимайте лучшие коттеджи, виллы и особняки.
                Эксклюзивные предложения премиум-класса.
              </p>
              <div className="hero-actions-modern">
                <button className="btn-primary-modern" onClick={handleSearchClick}>
                  <FontAwesomeIcon icon={faSearch} />
                  Найти элитное жилье
                </button>
                <button className="btn-secondary-modern" onClick={handleListProperty}>
                  <FontAwesomeIcon icon={faBuilding} />
                  Сдать недвижимость
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title-modern">Типы элитного жилья</h2>
          
          <div className="categories-grid-modern">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="category-card-modern"
                onClick={() => handleCategoryClick(category.label)}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-icon-modern" style={{ color: category.color }}>
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <div>
                  <h3>{category.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Последние предложения */}
      <section className="featured-section-modern">
        <div className="container">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title-modern">
                Премиум предложения
              </h2>
            </div>
            <button className="view-all-btn-modern" onClick={handleViewAllProperties}>
              Все предложения
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          
          {loading ? (
            <div className="loading-properties">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Загрузка предложений...</p>
            </div>
          ) : error ? (
            <div className="error-message" style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '0.5rem',
              color: '#DC2626',
              margin: '2rem 0'
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Ошибка загрузки</h3>
              <p>{error}</p>
              <button 
                onClick={loadPropertiesFromApi}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Попробовать снова
              </button>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="properties-grid-modern">
              {featuredProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="property-card-modern"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  <div className="property-image-modern">
                    <img 
                      src={property.photos && property.photos.length > 0 
                        ? property.photos[0] 
                        : "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop"
                      } 
                      alt={property.houseType} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop";
                      }}
                    />
                    <button 
                      className="favorite-btn-modern"
                      onClick={(e) => handleFavoriteClick(property.id, e)}
                      title={favorites.has(property.id) ? "Удалить из избранного" : "Добавить в избранное"}
                    >
                      <FontAwesomeIcon 
                        icon={favorites.has(property.id) ? faHeartSolid : faHeartOutline} 
                        style={{ 
                          color: favorites.has(property.id) ? '#EF4444' : '#FFFFFF',
                          fontSize: '1.2rem'
                        }}
                      />
                    </button>
                  </div>
                  
                  <div className="property-content-modern">
                    <div className="property-price-modern">
                      <span className="price-modern">{formatPrice(property.price)}</span>
                    </div>
                    
                    <h3 className="property-title-modern">
                      {property.houseType || "Элитная недвижимость"}
                    </h3>
                    
                    <button className="property-btn-modern">
                      Подробнее
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-properties" style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: '0.5rem',
              color: '#6B7280'
            }}>
              <h3>Нет доступных объявлений</h3>
              <p>На данный момент нет активных предложений.</p>
            </div>
          )}
        </div>
      </section>

      {/* Преимущества */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title-modern">Почему PrimeHouse для элитной недвижимости?</h2>
          
          <div className="benefits-grid-modern">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card-modern">
                <div className="benefit-icon-modern">
                  <FontAwesomeIcon icon={benefit.icon} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;