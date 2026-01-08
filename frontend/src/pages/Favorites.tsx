import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as faHeartSolid,
  faMapMarkerAlt,
  faBed,
  faBath,
  faRulerCombined,
  faStar,
  faTrash,
  faShare,
  faEnvelope,
  faCalendar,
  faSearch,
  faFilter,
  faEye,
  faSortAmountDown,
 
  faChevronDown,
  faCheckCircle,
  faSpinner,
 
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutlineRegular } from '@fortawesome/free-regular-svg-icons';
import "./Favorites.css";

// Интерфейс для данных из API
interface FavoriteItem {
  id: number;
  price: number;
  area: number;
  description: string;
  fullDescription: string;
  houseType: string;
  announcementData: string;
  photos: string[];
  city: string;
  street: string;
  rooms: number;
  bathrooms: number;
  floor: number;
  rating: number;
  isActive: boolean;
  year?: number;
  addedToFavorites?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState('date-desc');
  const [isRemoving, setIsRemoving] = useState(false);

  // Загрузка избранного при загрузке страницы
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('Пользователь не авторизован');
        setFavorites([]);
        return;
      }

      const response = await fetch('http://localhost:5213/api/favorites/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Статус ответа:', response.status);
      
      if (!response.ok) {
        console.warn(`Ошибка ${response.status} при получении избранного`);
        setFavorites([]);
        return;
      }

      const data: ApiResponse<FavoriteItem[]> = await response.json();
      console.log('Данные избранного:', data);
      
      if (data.success && data.data) {
        setFavorites(data.data);
      } else {
        console.log('Ошибка в ответе API:', data.message);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления из избранного
  const removeFromFavorites = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Вы не авторизованы');
        return;
      }

      setIsRemoving(true);
      
      const response = await fetch(`http://localhost:5213/api/favorites/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Удаляем из локального состояния
          setFavorites(prev => prev.filter(item => item.id !== id));
          // Убираем из выбранных
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          console.log(`Удалено из избранного: ${id}`);
        }
      } else {
        console.error('Ошибка при удалении');
        alert('Не удалось удалить из избранного');
      }
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      alert('Ошибка при удалении из избранного');
    } finally {
      setIsRemoving(false);
    }
  };

  // Очистка всего избранного
  const clearAllFavorites = async () => {
    if (!window.confirm('Вы уверены, что хотите очистить всё избранное?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Вы не авторизованы');
        return;
      }

      const response = await fetch('http://localhost:5213/api/favorites/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFavorites([]);
          setSelectedItems(new Set());
          alert('Избранное очищено');
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке избранного:', error);
      alert('Ошибка при очистке избранного');
    }
  };

  // Удаление выбранных элементов
  const removeSelected = async () => {
    if (selectedItems.size === 0) return;

    if (!window.confirm(`Вы уверены, что хотите удалить ${selectedItems.size} выбранных домов?`)) return;

    const selectedIds = Array.from(selectedItems);
    for (const id of selectedIds) {
      await removeFromFavorites(id);
    }
  };

  // Выбор/снятие выбора элемента
  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Выбор всех элементов
  const selectAllItems = () => {
    if (selectedItems.size === favorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(favorites.map(item => item.id)));
    }
  };

  // Форматирование цены
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} Br/мес`;
  };

  // Получение основного изображения
  const getMainImage = (photos: string[]): string => {
    return photos && photos.length > 0 
      ? photos[0] 
      : "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop";
  };

  // Сортировка
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.addedToFavorites || 0).getTime() - new Date(a.addedToFavorites || 0).getTime();
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'area-desc':
        return b.area - a.area;
      case 'rating-desc':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Проверка авторизации
  const isLoggedIn = !!localStorage.getItem('token');

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="favorites-page-favorit">
          <div className="container-favorit">
            <div className="favorites-empty-state-favorit">
              <div className="empty-state-icon-favorit">
                <FontAwesomeIcon icon={faHeartOutlineRegular} />
              </div>
              <h1>Для просмотра избранного необходимо авторизоваться</h1>
              <p>Войдите в свой аккаунт, чтобы увидеть сохраненные дома</p>
              <div className="empty-state-actions-favorit">
                <Link to="/login" className="btn-primary-favorit">
                  Войти
                </Link>
                <Link to="/register" className="btn-secondary-favorit">
                  Зарегистрироваться
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="favorites-page-favorit loading">
          <div className="container-favorit">
            <div className="loading-container-favorit">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
              <p>Загрузка избранного...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (favorites.length === 0) {
    return (
      <>
        <Header />
        <div className="favorites-page-favorit">
          <div className="container-favorit">
            <div className="favorites-empty-state-favorit">
              <div className="empty-state-icon-favorit">
                <FontAwesomeIcon icon={faHeartOutlineRegular} />
              </div>
              <h1>Ваше избранное пусто</h1>
              <p>Сохраняйте понравившиеся дома, нажимая на сердечко ♡</p>
              <div className="empty-state-actions-favorit">
                <Link to="/catalog" className="btn-primary-favorit">
                  <FontAwesomeIcon icon={faSearch} />
                  Найти дома
                </Link>
                <Link to="/agents" className="btn-secondary-favorit">
                  <FontAwesomeIcon icon={faFilter} />
                  Выбрать агента
                </Link>
              </div>
              
              <div className="favorites-tips-favorit">
                <h3>Почему стоит сохранять в избранное?</h3>
                <div className="tips-grid-favorit">
                  <div className="tip-card-favorit">
                    <div className="tip-icon-favorit">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <h4>Быстрый доступ</h4>
                    <p>Все понравившиеся дома в одном месте для удобного сравнения</p>
                  </div>
                  <div className="tip-card-favorit">
                    <div className="tip-icon-favorit">
                      <FontAwesomeIcon icon={faCalendar} />
                    </div>
                    <h4>Планирование</h4>
                    <p>Сохраняйте варианты для будущих просмотров с агентом</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="favorites-page-favorit">
        <div className="container-favorit">
          <div className="favorites-header-favorit">
            <div className="favorites-hero-favorit">
              <div className="hero-content-favorit">
                <h1>
                  <FontAwesomeIcon icon={faHeartSolid} />
                  Моё избранное
                </h1>
                <p className="favorites-subtitle-favorit">
                  Все сохраненные дома в одном месте. Сравнивайте, планируйте и делитесь с близкими.
                </p>
              </div>
              <div className="hero-stats-favorit">
                <div className="stat-item-favorit">
                  <div className="stat-value-favorit">{favorites.length}</div>
                  <div className="stat-label-favorit">дома</div>
                </div>
              </div>
            </div>
            
            <div className="favorites-controls-favorit">
              <div className="controls-left-favorit">
                <div className="selection-info-favorit">
                  {selectedItems.size > 0 ? (
                    <>
                      <span className="selected-count-favorit">
                        Выбрано: {selectedItems.size} домов
                      </span>
                      <button 
                        className="btn-clear-selection-favorit"
                        onClick={() => setSelectedItems(new Set())}
                      >
                        Снять выделение
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-select-all-favorit"
                      onClick={selectAllItems}
                    >
                      Выбрать все
                    </button>
                  )}
                </div>
              </div>
              
              <div className="controls-right-favorit">
                <div className="action-buttons-favorit">
                  {selectedItems.size > 0 ? (
                    <>
                      <button 
                        className="btn-danger-favorit"
                        onClick={removeSelected}
                        disabled={isRemoving}
                      >
                        {isRemoving ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Удаление...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faTrash} />
                            Удалить выбранное
                          </>
                        )}
                      </button>
                      <button 
                        className="btn-primary-favorit"
                        onClick={() => {
                          const selectedTitles = favorites
                            .filter(item => selectedItems.has(item.id))
                            .map(item => `${item.houseType} - ${item.city}, ${item.street}`);
                          
                          if (selectedTitles.length === 0) {
                            alert("Выберите дома для отправки!");
                            return;
                          }

                          const message = `Мои избранные дома:\n\n${selectedTitles.join('\n')}`;
                          alert(`Готово для отправки:\n\n${message}`);
                        }}
                      >
                        <FontAwesomeIcon icon={faShare} />
                        Поделиться
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-secondary-favorit"
                        onClick={clearAllFavorites}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Очистить всё
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Контрол для сортировки */}
            <div className="catalog-controls-favorit">
              <div className="controls-left-favorit">
                <div className="sort-control-favorit">
                  <FontAwesomeIcon icon={faSortAmountDown} />
                  <select 
                    className="sort-select-favorit"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date-desc">Сначала новые</option>
                    <option value="price-asc">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                    <option value="area-desc">Площадь: большая</option>
                    <option value="rating-desc">Высокий рейтинг</option>
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="sort-arrow-favorit" />
                </div>
              </div>

              <div className="controls-right-favorit">
                <div className="results-count-favorit">
                  Показано: <strong>{sortedFavorites.length}</strong> домов
                </div>
              </div>
            </div>
          </div>

          {/* Карточки в виде списка */}
          <div className="properties-container-favorit list-view-favorit">
            {sortedFavorites.map(property => (
              <div key={property.id} className="property-item-favorit list-favorit">
                <div className="property-item-image-favorit">
                  <img 
                    src={getMainImage(property.photos)} 
                    alt={property.description}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop";
                    }}
                  />
                  <div className="property-item-badges-favorit">
                    <button 
                      className="favorite-btn-favorit active-favorit"
                      onClick={() => removeFromFavorites(property.id)}
                      title="Удалить из избранного"
                      disabled={isRemoving}
                    >
                      <FontAwesomeIcon icon={faHeartSolid} />
                    </button>
                    <div className="card-select-favorit">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(property.id)}
                        onChange={() => toggleSelectItem(property.id)}
                        id={`select-${property.id}-favorit`}
                      />
                      <label htmlFor={`select-${property.id}-favorit`}></label>
                    </div>
                  </div>
                </div>
                
                <div className="property-item-content-favorit">
                  <div className="property-item-header-favorit">
                    <h3>{formatPrice(property.price)}</h3>
                    <div className="property-rating-favorit">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{property.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="property-item-address-favorit">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {property.city}, {property.street}
                  </div>
                  
                  <p className="property-item-info-favorit">
                    {property.houseType}, {property.area} м², {property.rooms} комн.
                  </p>
                  
                  <div className="property-item-features-favorit">
                    <span>
                      <FontAwesomeIcon icon={faBed} /> {property.rooms} комн.
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faBath} /> {property.bathrooms}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faRulerCombined} /> {property.area} м²
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faCheckCircle} /> {property.floor} эт.
                    </span>
                  </div>
                  
                  <p className="property-item-description-favorit">
                    {property.description}
                  </p>
                  
                  <div className="property-item-actions-favorit">
                    <Link 
                      to={`/house/${property.id}`} 
                      className="btn-primary-favorit"
                    >
                      Подробнее
                    </Link>
                    <button className="btn-secondary-favorit">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Написать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
      
    </>
  );
};

export default Favorites;