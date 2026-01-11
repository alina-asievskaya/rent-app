import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart as faHeartSolid,
  faUser,
  faTimes,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faEnvelope,
  faPhone,
  faLock,
  faUser as faUserIcon,
  faSignOutAlt,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import "./Header.css";

interface UserData {
  id: number;
  email: string;
  fio: string;
  phone_num: string;
  id_agent: boolean;
  token: string;
}

// Интерфейс для элемента избранного из API
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
  // Дополнительные поля, которые могут быть в API
  year?: number;
  addedToFavorites?: string;
}

// Интерфейс для ответа API избранного
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfilePage, setIsProfilePage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  
  // Состояние для всплывающих сообщений
  const [toasts, setToasts] = useState<Array<{
    id: number;
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>>([]);

  // Состояние для формы
  const [formData, setFormData] = useState({
    email: "",
    fio: "",
    password: "",
    confirmPassword: "",
    phone_num: ""
  });

  // Проверяем авторизацию при загрузке и при изменении
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // Данные пользователя
  const [userData, setUserData] = useState<UserData | null>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  // Функция для показа всплывающего сообщения
  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  // Функция для удаления всплывающего сообщения
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Загрузка количества избранного при изменении авторизации
  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchFavoritesCount();
    } else {
      setFavoritesCount(0);
      setFavoritesList([]);
    }
  }, [isLoggedIn]);

  // Загрузка списка избранного при открытии dropdown
  useEffect(() => {
    if (showFavorites && isLoggedIn && !isAdmin) {
      fetchFavoritesList();
    }
  }, [showFavorites]);

  // Проверяем текущую страницу
  useEffect(() => {
    setIsProfilePage(location.pathname === '/profile');
  }, [location]);

  // Функция для получения количества избранного
  const fetchFavoritesCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5213/api/favorites/count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`Ошибка ${response.status} при получении количества избранного`);
        return;
      }

      const data: ApiResponse<{ count: number }> = await response.json();
      
      if (data.success && data.data) {
        setFavoritesCount(data.data.count);
        console.log('Количество избранного загружено:', data.data.count);
      }
    } catch (error) {
      console.error('Ошибка при получении количества избранного:', error);
    }
  };

  // Функция для получения списка избранного
  const fetchFavoritesList = async () => {
    try {
      setIsLoadingFavorites(true);
      const token = localStorage.getItem('token');
      
      console.log('Токен для запроса избранного:', token ? 'есть' : 'нет');
      
      if (!token) {
        console.log('Нет токена, пропускаем запрос');
        return;
      }

      console.log('Загрузка списка избранного...');
      
      const response = await fetch('http://localhost:5213/api/favorites/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Ответ от сервера:', response.status, response.statusText);
      
      if (!response.ok) {
        console.warn(`Ошибка ${response.status} при получении списка избранного`);
        return;
      }

      const data: ApiResponse<FavoriteItem[]> = await response.json();
      console.log('Данные избранного:', data);
      
      if (data.success) {
        setFavoritesList(data.data || []);
        setFavoritesCount(data.data?.length || 0);
        console.log('Список избранного загружен:', data.data?.length || 0, 'элементов');
      } else {
        console.log('Ошибка в ответе API:', data.message);
        setFavoritesList([]);
        setFavoritesCount(0);
      }
    } catch (error) {
      console.error('Ошибка при получении списка избранного:', error);
      setFavoritesList([]);
      setFavoritesCount(0);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const toggleFavorites = async () => {
    // Если пользователь не авторизован, показываем модалку входа
    if (!isLoggedIn) {
      openAuthModal(true);
      return;
    }

    // Если администратор - не показываем избранное
    if (isAdmin) {
      showToast('Администраторы не могут использовать избранное', 'info');
      return;
    }

    if (!showFavorites) {
      await fetchFavoritesList();
    }
    setShowFavorites(!showFavorites);
  };

  const removeFromFavorites = async (houseId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Удаление из избранного:', houseId);
      
      const response = await fetch(`http://localhost:5213/api/favorites/remove/${houseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: ApiResponse<{ message: string }> = await response.json();
        if (data.success) {
          // Обновляем список избранного
          setFavoritesList(prev => prev.filter(item => item.id !== houseId));
          setFavoritesCount(prev => prev - 1);
          
          // Закрываем dropdown если избранное пустое
          if (favoritesCount - 1 === 0) {
            setShowFavorites(false);
          }
          
          showToast('Удалено из избранного', 'success');
          console.log('Удалено из избранного:', houseId);
        }
      } else {
        const errorText = await response.text();
        console.error('Ошибка при удалении из избранного:', errorText);
        showToast('Ошибка при удалении из избранного', 'error');
      }
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      showToast('Ошибка при удалении из избранного', 'error');
    }
  };

  const clearFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!window.confirm('Вы уверены, что хотите очистить всё избранное?')) return;

      const response = await fetch('http://localhost:5213/api/favorites/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: ApiResponse<{ message: string; removedCount: number }> = await response.json();
        if (data.success) {
          setFavoritesList([]);
          setFavoritesCount(0);
          setShowFavorites(false);
          showToast('Избранное очищено', 'success');
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке избранного:', error);
      showToast('Ошибка при очистке избранного', 'error');
    }
  };

  const openAuthModal = (isLogin: boolean) => {
    setIsLoginForm(isLogin);
    setShowAuthModal(true);
    setFormData({
      email: "",
      fio: "",
      password: "",
      confirmPassword: "",
      phone_num: ""
    });
    setShowFavorites(false); // Закрываем dropdown избранного
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5213/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data: ApiResponse<UserData> = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        setIsLoggedIn(true);
        setUserData(data.data);
        setShowAuthModal(false);
        setFormData({
          email: "",
          fio: "",
          password: "",
          confirmPassword: "",
          phone_num: ""
        });
        
        // После успешного входа загружаем избранное если пользователь не администратор
        if (formData.email.toLowerCase() !== 'admin@gmail.com') {
          await fetchFavoritesCount();
        }
        
        // Проверяем, админ ли это
        if (formData.email.toLowerCase() === 'admin@gmail.com') {
          navigate('/admin');
          showToast('Вход выполнен успешно. Добро пожаловать в административную панель!', 'success');
        } else {
          navigate('/profile');
          showToast('Вход выполнен успешно!', 'success');
        }
      } else {
        // Обработка различных ошибок
        if (data.message?.toLowerCase().includes('неверный email или пароль') || 
            data.message?.toLowerCase().includes('invalid credentials')) {
          showToast('Неверный email или пароль', 'error');
        } else if (data.message?.toLowerCase().includes('пользователь не найден')) {
          showToast('Пользователь не найден', 'error');
        } else {
          showToast(data.message || 'Ошибка входа', 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      showToast('Ошибка соединения с сервером', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Валидация формы
    if (!formData.fio.trim()) {
      showToast("Введите имя и фамилию!", "warning");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Пароли не совпадают!", "error");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showToast("Пароль должен содержать минимум 6 символов!", "warning");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5213/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fio: formData.fio,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone_num: formData.phone_num
        })
      });
      
      const data: ApiResponse<{ message: string; userId: number }> = await response.json();
      
      if (data.success) {
        // После успешной регистрации автоматически входим
        const loginResponse = await fetch('http://localhost:5213/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
        
        const loginData: ApiResponse<UserData> = await loginResponse.json();
        
        if (loginData.success) {
          localStorage.setItem('token', loginData.data.token);
          localStorage.setItem('user', JSON.stringify(loginData.data));
          
          setIsLoggedIn(true);
          setUserData(loginData.data);
          setShowAuthModal(false);
          setFormData({
            email: "",
            fio: "",
            password: "",
            confirmPassword: "",
            phone_num: ""
          });
          
          // После успешной регистрации загружаем избранное
          await fetchFavoritesCount();
          
          // Регистрация всегда создает обычного пользователя, перенаправляем на профиль
          navigate('/profile');
          showToast('Регистрация прошла успешно! Добро пожаловать!', 'success');
        } else {
          showToast("Регистрация прошла успешно, но не удалось автоматически войти. Пожалуйста, войдите вручную.", "info");
        }
      } else {
        // Обработка различных ошибок регистрации
        if (data.message?.toLowerCase().includes('уже существует') || 
            data.message?.toLowerCase().includes('already exists')) {
          showToast('Пользователь с таким email уже существует', 'error');
        } else if (data.message?.toLowerCase().includes('неверный формат email')) {
          showToast('Неверный формат email', 'error');
        } else if (data.message?.toLowerCase().includes('пароль') || 
                   data.message?.toLowerCase().includes('password')) {
          showToast('Ошибка в пароле: ' + data.message, 'error');
        } else {
          showToast(data.message || 'Ошибка регистрации', 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      showToast('Ошибка соединения с сервером', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsLoginForm(false);
    setFormData({
      email: "",
      fio: "",
      password: "",
      confirmPassword: "",
      phone_num: ""
    });
  };

  const switchToLogin = () => {
    setIsLoginForm(true);
    setFormData({
      email: "",
      fio: "",
      password: "",
      confirmPassword: "",
      phone_num: ""
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    setFavoritesCount(0);
    setFavoritesList([]);
    setShowFavorites(false);
    navigate('/');
    showToast('Вы вышли из системы', 'info');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Проверяем, является ли пользователь администратором
  const isAdmin = userData?.email?.toLowerCase() === 'admin@gmail.com';

  // Проверяем, должен ли показываться раздел избранного
  // Показываем только авторизованным пользователям, которые не являются администраторами
  const shouldShowFavorites = isLoggedIn && !isAdmin;

  // Класс для Header в зависимости от страницы
  const headerClass = `header ${isProfilePage ? 'header-fixed' : ''}`;

  // Функция для форматирования цены
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} Br/мес`;
  };

  // Функция для получения основного изображения
  const getMainImage = (photos: string[]): string => {
    return photos && photos.length > 0 
      ? photos[0] 
      : "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop";
  };

  // Функция для форматирования описания
  const truncateDescription = (description: string, maxLength: number = 30): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <>
      <header className={headerClass}>
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
            {/* Кнопка избранного - показываем только авторизованным пользователям, которые не администраторы */}
            {shouldShowFavorites && (
              <div className="nav-favorites">
                <button 
                  className="nav-favorites-btn" 
                  onClick={toggleFavorites}
                  aria-label="Избранное"
                  title="Избранное"
                  disabled={isLoadingFavorites}
                >
                  {isLoadingFavorites ? (
                    <span className="loading-spinner-small"></span>
                  ) : (
                    <FontAwesomeIcon 
                      icon={favoritesCount > 0 ? faHeartSolid : faHeartOutline} 
                    />
                  )}
                  {favoritesCount > 0 && (
                    <span className="favorites-badge">{favoritesCount}</span>
                  )}
                </button>
                
                {/* Dropdown избранного */}
                <div className={`favorites-dropdown ${showFavorites ? 'show' : ''}`}>
                  <div className="favorites-dropdown-header">
                    <h4>Избранное ({favoritesCount})</h4>
                    {favoritesCount > 0 && (
                      <button 
                        className="clear-favorites" 
                        onClick={clearFavorites}
                        disabled={isLoadingFavorites}
                      >
                        {isLoadingFavorites ? 'Очистка...' : 'Очистить'}
                      </button>
                    )}
                  </div>
                  
                  <div className="favorites-items">
                    {isLoadingFavorites ? (
                      <div className="favorites-loading">
                        <span className="loading-spinner"></span>
                        <p>Загрузка избранного...</p>
                      </div>
                    ) : favoritesCount === 0 ? (
                      <div className="favorites-empty">
                        <FontAwesomeIcon icon={faHeartOutline} />
                        <p>В избранном пока ничего нет</p>
                        <p className="favorites-empty-hint">
                          Нажмите на ♡ в каталоге, чтобы добавить дом в избранное
                        </p>
                      </div>
                    ) : (
                      favoritesList.slice(0, 5).map(item => (
                        <div key={item.id} className="favorites-item">
                          <div className="favorites-item-image">
                            <img 
                              src={getMainImage(item.photos)} 
                              alt={truncateDescription(item.description)} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop";
                              }}
                            />
                          </div>
                          <div className="favorites-item-content">
                            <div className="favorites-item-title">
                              {item.houseType} - {item.rooms} комн.
                            </div>
                            <div className="favorites-item-price">
                              {formatPrice(item.price)}
                            </div>
                            <div className="favorites-item-address">
                              {item.city}, {item.street}
                            </div>
                          </div>
                          <button 
                            className="favorites-item-remove"
                            onClick={() => removeFromFavorites(item.id)}
                            aria-label="Удалить из избранного"
                            disabled={isLoadingFavorites}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ))
                    )}
                    {favoritesCount > 5 && !isLoadingFavorites && (
                      <div className="favorites-more">
                        <span>... и еще {favoritesCount - 5} домов</span>
                      </div>
                    )}
                  </div>
                  
                  {favoritesCount > 0 && !isLoadingFavorites && (
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
            )}

            {/* Альтернативная кнопка избранного для неавторизованных пользователей */}
            {!isLoggedIn && (
              <div className="nav-favorites">
                <button 
                  className="nav-favorites-btn" 
                  onClick={() => openAuthModal(true)}
                  aria-label="Избранное"
                  title="Войдите, чтобы добавить в избранное"
                >
                  <FontAwesomeIcon icon={faHeartOutline} />
                </button>
              </div>
            )}
            
            {/* Профиль пользователя */}
            {isLoggedIn ? (
              <div className="user-profile-menu">
                <button className="user-profile-link" onClick={() => {
                  // Если админ - перенаправляем на админ-панель
                  if (isAdmin) {
                    navigate('/admin');
                  } else {
                    navigate('/profile');
                  }
                }}>
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                    {isAdmin && (
                      <div className="admin-badge" title="Администратор">
                        <FontAwesomeIcon icon={faShieldAlt} />
                      </div>
                    )}
                  </div>
                </button>
                {/* Dropdown меню (для не-админов) */}
                {!isAdmin && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowFavorites(false)}>
                      <FontAwesomeIcon icon={faUser} />
                      <span>Мой профиль</span>
                    </Link>
                    <Link to="/favorites" className="dropdown-item" onClick={() => setShowFavorites(false)}>
                      <FontAwesomeIcon icon={faHeartOutline} />
                      <span>Избранное</span>
                      {favoritesCount > 0 && (
                        <span className="dropdown-badge">{favoritesCount}</span>
                      )}
                    </Link>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Выйти</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  className="btn-secondary" 
                  onClick={() => openAuthModal(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Войти'}
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => openAuthModal(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Регистрация'}
                </button>
              </>
            )}
            
            {/* Кнопка мобильного меню */}
            <button 
              className="mobile-menu-btn"
              aria-label="Меню"
              onClick={() => {/* Логика мобильного меню */}}
            >
              ☰
            </button>
          </div>
        </nav>
      </header>

      {/* Всплывающие сообщения */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-icon">
              {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
              {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
              {toast.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
              {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
            </div>
            <div className="toast-content">
              <div className="toast-message">{toast.text}</div>
            </div>
            <button 
              className="toast-close" 
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно авторизации/регистрации */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={closeAuthModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="auth-modal-header">
              <h2>{isLoginForm ? "Вход в аккаунт" : "Регистрация"}</h2>
              <p className="auth-modal-subtitle">
                {isLoginForm 
                  ? "Введите ваши данные для входа" 
                  : "Создайте новый аккаунт"
                }
              </p>
            </div>
            
            {isLoginForm ? (
              // Форма входа
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@mail.ru"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Введите пароль"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-right"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Загрузка..." : "Войти"}
                </button>
                
                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Нет аккаунта?{" "}
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={switchToRegister}
                      disabled={isLoading}
                    >
                      Зарегистрироваться
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              // Форма регистрации
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                      type="email"
                      id="register-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@mail.ru"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faUserIcon} className="input-icon" />
                    <input
                      type="text"
                      id="register-fio"
                      name="fio"
                      value={formData.fio}
                      onChange={handleInputChange}
                      placeholder="Иванов Иван"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                  </div>
                  <small className="input-hint">Введите имя и фамилию</small>
                </div>
                
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faPhone} className="input-icon" />
                    <input
                      type="tel"
                      id="register-phone"
                      name="phone_num"
                      value={formData.phone_num}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 999-99-99"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="register-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Придумайте пароль"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-right"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="register-confirm-password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Повторите пароль"
                      required
                      className="auth-input"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-right"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Загрузка..." : "Зарегистрироваться"}
                </button>
                
                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Уже есть аккаунт?{" "}
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={switchToLogin}
                      disabled={isLoading}
                    >
                      Войти
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;