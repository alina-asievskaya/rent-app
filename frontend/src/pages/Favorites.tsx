import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  faCalendar,
  faSearch,
  faFilter,
  faEye,
  faSortAmountDown,
  faChevronDown,
  faCheckCircle,
  faSpinner,
  faComment,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutlineRegular } from '@fortawesome/free-regular-svg-icons';
import "./Favorites.css";

// Интерфейсы для данных из API
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
  ownerId?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Интерфейсы для чата
interface ChatItem {
  id: number;
  user_id: number;
  ad_id: number;
  user_name: string;
  user_avatar: string;
  ad_title: string;
  ad_address: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  created_at: string;
  house_price: number;
  house_photo: string;
}

interface ChatsResponse {
  success: boolean;
  data: ChatItem[];
  total: number;
  message?: string;
}

interface ChatCreateResponse {
  success: boolean;
  data: {
    chat_id: number;
    is_new: boolean;
    welcome_message_id?: number;
  };
  message?: string;
}

interface OwnerInfoResponse {
  success: boolean;
  data: {
    id: number;
    fio: string;
    email: string;
    phone_num: string;
    id_agent: boolean;
  };
  message?: string;
}

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState('date-desc');
  const [isRemoving, setIsRemoving] = useState(false);
  const [creatingChatForProperty, setCreatingChatForProperty] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Декодирование токена
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
      return null;
    }
  };

  // Проверка авторизации и ролей
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const payload = decodeToken(token);
          
          if (payload) {
            const roles = payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
            
            setCurrentUserEmail(email);

            if (Array.isArray(roles)) {
              setIsAdmin(roles.includes('Admin'));
            } else if (typeof roles === 'string') {
              setIsAdmin(roles === 'Admin');
            } else if (email?.toLowerCase() === 'admin@gmail.com') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error('Ошибка при декодировании токена:', error);
        }
      }
    };

    checkAuth();
    fetchFavorites();
  }, []);

  // Функция для получения информации о владельце дома
  const getHouseOwnerInfo = async (houseId: number): Promise<number | null> => {
    try {
      const response = await fetch(`http://localhost:5213/api/houses/${houseId}/owner-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result: OwnerInfoResponse = await response.json();
        if (result.success && result.data) {
          if (result.data.email?.toLowerCase() === 'admin@gmail.com') {
            alert('Вы не можете написать администратору. Пожалуйста, свяжитесь с поддержкой через форму обратной связи.');
            return null;
          }
          return result.data.id;
        }
      } else {
        const property = favorites.find(p => p.id === houseId);
        if (property?.ownerId) {
          return property.ownerId;
        }
      }
      return null;
    } catch (error) {
      console.error('Ошибка при получении информации о владельце:', error);
      return null;
    }
  };

  // Функция для проверки существующего чата
  const checkExistingChat = async (ownerId: number, houseId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('http://localhost:5213/api/chats/my-chats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result: ChatsResponse = await response.json();
        if (result.success && result.data) {
          const existingChat = result.data.find((chat: ChatItem) => 
            chat.user_id === ownerId && chat.ad_id === houseId
          );
          
          if (existingChat) {
            return existingChat.id;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Ошибка при проверке существующего чата:', error);
      return null;
    }
  };

  // Функция для создания нового чата
  const createNewChat = async (ownerId: number, houseId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('http://localhost:5213/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          otherUserId: ownerId,
          houseId: houseId,
          initialMessage: "Здравствуйте! Меня интересует ваше объявление из моего избранного."
        })
      });

      if (response.ok) {
        const result: ChatCreateResponse = await response.json();
        if (result.success && result.data) {
          return result.data.chat_id;
        }
      } else {
        const errorData = await response.json();
        console.error('Ошибка создания чата:', errorData);
        alert(errorData.message || 'Ошибка при создании чата');
      }
      return null;
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      alert('Не удалось создать чат. Попробуйте позже.');
      return null;
    }
  };

  // Основная функция для открытия/создания чата
  const handleOpenChat = async (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для начала чата необходимо авторизоваться');
      navigate('/login');
      return;
    }

    // Проверяем, не является ли пользователь администратором
    if (isAdmin) {
      if (currentUserEmail?.toLowerCase() === 'admin@gmail.com') {
        alert('Администратор может писать только в ответ на сообщения пользователей');
        return;
      }
    }

    setCreatingChatForProperty(propertyId);
    
    try {
      const ownerId = await getHouseOwnerInfo(propertyId);
      if (!ownerId) {
        alert('Не удалось определить владельца объявления');
        return;
      }

      const existingChatId = await checkExistingChat(ownerId, propertyId);
      
      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
        return;
      }

      const newChatId = await createNewChat(ownerId, propertyId);
      
      if (newChatId) {
        navigate(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error('Ошибка при открытии чата:', error);
      alert('Произошла ошибка при открытии чата. Попробуйте позже.');
    } finally {
      setCreatingChatForProperty(null);
    }
  };

  // Загрузка избранного при загрузке страницы
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
                    <button 
                      className="btn-secondary-favorit"
                      onClick={(e) => handleOpenChat(property.id, e)}
                      disabled={creatingChatForProperty === property.id || isAdmin}
                    >
                      {creatingChatForProperty === property.id ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                          Открытие чата...
                        </>
                      ) : isAdmin ? (
                        <>
                          <FontAwesomeIcon icon={faComment} style={{ marginRight: '8px' }} />
                          Админам запрещено
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faComment} style={{ marginRight: '8px' }} />
                          Написать владельцу
                        </>
                      )}
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