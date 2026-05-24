import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { flushSync } from 'react-dom';
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
  faShieldAlt,
  faComment,
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
  rentType?: 'day' | 'month';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CountResponse {
  success: boolean;
  count: number;
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
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const [toasts, setToasts] = useState<Array<{
    id: number;
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>>([]);

  const [formData, setFormData] = useState({
    email: "",
    fio: "",
    password: "",
    confirmPassword: "",
    phone_num: ""
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userData, setUserData] = useState<UserData | null>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  const isAdmin = userData?.email?.toLowerCase() === 'admin@gmail.com';
  const shouldShowFavorites = isLoggedIn && !isAdmin;

  const favoritesDropdownRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLDivElement>(null);
  const favoritesBtnRef = useRef<HTMLButtonElement>(null);
  const isFetchingCount = useRef(false);
  const isFetchingList = useRef(false);
  const isFetchingUnread = useRef(false);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const fetchFavoritesCount = useCallback(async () => {
    if (isFetchingCount.current) return;
    try {
      isFetchingCount.current = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`http://localhost:5213/api/favorites/count?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return;
      const data: CountResponse = await response.json();
      if (data.success) {
        setFavoritesCount(data.count);
      }
    } catch (error) {
      console.error('Ошибка при получении количества избранного:', error);
    } finally {
      isFetchingCount.current = false;
    }
  }, []);

  const fetchFavoritesList = useCallback(async () => {
    if (isFetchingList.current) return;
    try {
      isFetchingList.current = true;
      setIsLoadingFavorites(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/favorites/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return;
      const data: ApiResponse<FavoriteItem[]> = await response.json();
      if (data.success) {
        setFavoritesList(data.data || []);
        setFavoritesCount(data.data?.length || 0);
      } else {
        setFavoritesList([]);
        setFavoritesCount(0);
      }
    } catch (error) {
      console.error('Ошибка при получении списка избранного:', error);
      setFavoritesList([]);
      setFavoritesCount(0);
    } finally {
      setIsLoadingFavorites(false);
      isFetchingList.current = false;
    }
  }, []);

  const fetchUnreadMessagesCount = useCallback(async () => {
    if (!isLoggedIn) return;
    if (isFetchingUnread.current) return;
    try {
      isFetchingUnread.current = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/chats/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setUnreadMessagesCount(data.count);
      }
    } catch (error) {
      console.error('Ошибка загрузки непрочитанных сообщений:', error);
    } finally {
      isFetchingUnread.current = false;
    }
  }, [isLoggedIn]);

  const resetUserData = useCallback(() => {
    setFavoritesCount(0);
    setFavoritesList([]);
    setUnreadMessagesCount(0);
  }, []);

  // Главный эффект – загрузка/сброс при входе/выходе
  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchFavoritesCount();
      fetchUnreadMessagesCount();
    } else {
      resetUserData();
    }
  }, [isLoggedIn, isAdmin, fetchFavoritesCount, fetchUnreadMessagesCount, resetUserData]);

  // Открытие дропдауна – подгружаем список, если пуст
  useEffect(() => {
    if (showFavorites && isLoggedIn && !isAdmin && favoritesList.length === 0) {
      fetchFavoritesList();
    }
  }, [showFavorites, isLoggedIn, isAdmin, favoritesList.length, fetchFavoritesList]);

  useEffect(() => {
    setIsProfilePage(location.pathname === '/profile');
  }, [location]);

  // Слушаем глобальное обновление избранного
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      if (isLoggedIn && !isAdmin) fetchFavoritesCount();
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [isLoggedIn, isAdmin, fetchFavoritesCount]);

  // Закрытие дропдаунов
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFavorites && 
          favoritesDropdownRef.current && 
          !favoritesDropdownRef.current.contains(event.target as Node) &&
          favoritesBtnRef.current &&
          !favoritesBtnRef.current.contains(event.target as Node)) {
        setShowFavorites(false);
      }
      if (userBtnRef.current && !userBtnRef.current.contains(event.target as Node)) {
        const dropdown = userBtnRef.current.querySelector('.user-dropdown');
        if (dropdown && dropdown.classList.contains('show')) dropdown.classList.remove('show');
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFavorites) setShowFavorites(false);
        if (userBtnRef.current) {
          const dropdown = userBtnRef.current.querySelector('.user-dropdown');
          if (dropdown && dropdown.classList.contains('show')) dropdown.classList.remove('show');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showFavorites]);

  const toggleFavorites = useCallback(() => {
    if (!isLoggedIn) {
      openAuthModal(true);
      return;
    }
    if (isAdmin) {
      showToast('Администраторы не могут использовать избранное', 'info');
      return;
    }
    setShowFavorites(prev => !prev);
  }, [isLoggedIn, isAdmin, showToast]);

  const removeFromFavorites = useCallback(async (houseId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
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
          setFavoritesList(prev => prev.filter(item => item.id !== houseId));
          setFavoritesCount(prev => prev - 1);
          if (favoritesCount - 1 === 0) setShowFavorites(false);
          showToast('Удалено из избранного', 'success');
          // Уведомляем другие компоненты (каталог) об изменении
          window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        }
      } else {
        showToast('Ошибка при удалении из избранного', 'error');
      }
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      showToast('Ошибка при удалении из избранного', 'error');
    }
  }, [favoritesCount, showToast]);

  const clearFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
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
          window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке избранного:', error);
      showToast('Ошибка при очистке избранного', 'error');
    }
  }, [showToast]);

  const openAuthModal = useCallback((isLogin: boolean) => {
    setIsLoginForm(isLogin);
    setShowAuthModal(true);
    setFormData({
      email: "",
      fio: "",
      password: "",
      confirmPassword: "",
      phone_num: ""
    });
    setShowFavorites(false);
  }, []);

  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5213/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data: ApiResponse<UserData> = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        setIsLoggedIn(true);
        setUserData(data.data);
        setShowAuthModal(false);
        setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
        
        if (data.data.email.toLowerCase() !== 'admin@gmail.com') {
          await fetchFavoritesCount();
          await fetchUnreadMessagesCount();
        }
        
        flushSync(() => {});
        
        if (data.data.email.toLowerCase() === 'admin@gmail.com') {
          navigate('/admin');
          showToast('Вход выполнен успешно. Добро пожаловать в административную панель!', 'success');
        } else {
          navigate('/profile');
          showToast('Вход выполнен успешно!', 'success');
        }
      } else {
        if (data.message?.toLowerCase().includes('неверный email или пароль')) {
          showToast('Неверный email или пароль', 'error');
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
  }, [formData.email, formData.password, fetchFavoritesCount, fetchUnreadMessagesCount, navigate, showToast]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        headers: { 'Content-Type': 'application/json' },
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
        const loginResponse = await fetch('http://localhost:5213/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const loginData: ApiResponse<UserData> = await loginResponse.json();
        if (loginData.success) {
          localStorage.setItem('token', loginData.data.token);
          localStorage.setItem('user', JSON.stringify(loginData.data));
          setIsLoggedIn(true);
          setUserData(loginData.data);
          setShowAuthModal(false);
          setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
          
          await fetchFavoritesCount();
          await fetchUnreadMessagesCount();
          flushSync(() => {});
          
          navigate('/profile');
          showToast('Регистрация прошла успешно! Добро пожаловать!', 'success');
        } else {
          showToast("Регистрация прошла успешно, но не удалось автоматически войти.", "info");
        }
      } else {
        if (data.message?.toLowerCase().includes('уже существует')) {
          showToast('Пользователь с таким email уже существует', 'error');
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
  }, [formData, fetchFavoritesCount, fetchUnreadMessagesCount, navigate, showToast]);

  const switchToRegister = useCallback(() => {
    setIsLoginForm(false);
    setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
  }, []);

  const switchToLogin = useCallback(() => {
    setIsLoginForm(true);
    setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    resetUserData();
    setShowFavorites(false);
    navigate('/');
    showToast('Вы вышли из системы', 'info');
  }, [navigate, showToast, resetUserData]);

  const goToChats = useCallback(() => {
    navigate('/profile?tab=chats');
  }, [navigate]);

  const toggleUserDropdown = useCallback(() => {
    if (userBtnRef.current) {
      const dropdown = userBtnRef.current.querySelector('.user-dropdown');
      if (dropdown) dropdown.classList.toggle('show');
    }
  }, []);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const headerClass = `header ${isProfilePage ? 'header-profile' : ''}`;

  const formatPriceWithIcon = useCallback((price: number, rentType?: 'day' | 'month'): React.ReactNode => {
    const numberStr = price.toLocaleString('ru-RU');
    const suffix = rentType === 'month' ? '/мес' : '/сутки';
    return (
      <>
        {numberStr} <i className="nbrb-icon">&#xe901;</i>{suffix}
      </>
    );
  }, []);

  const getMainImage = useCallback((photos: string[]): string => {
    return photos && photos.length > 0 
      ? photos[0] 
      : "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop";
  }, []);

  const truncateDescription = useCallback((description: string, maxLength: number = 30): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }, []);

  return (
    <>
      <header className={headerClass}>
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/photo/logo.png" alt="PrimeHouse logo" style={{ height: '32px', width: 'auto' }} />
              <h2>Prime<span>House</span></h2>
            </Link>
          </div>
          <ul className="nav-links">
            <li><Link to="/" className={isActive("/") ? "active" : ""}>Главная</Link></li>
            <li><Link to="/catalog" className={isActive("/catalog") ? "active" : ""}>Каталог</Link></li>
            <li><Link to="/agents" className={isActive("/agents") ? "active" : ""}>Услуги</Link></li>
            <li><Link to="/about" className={isActive("/about") ? "active" : ""}>О нас</Link></li>
          </ul>
          <div className="nav-auth">
            {/* Иконка сообщений */}
            {isLoggedIn && !isAdmin && (
              <div className="nav-messages">
                <button className="nav-messages-btn" onClick={goToChats} aria-label="Сообщения">
                  <FontAwesomeIcon icon={faComment} />
                  {unreadMessagesCount > 0 && (
                    <span className="messages-badge">{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</span>
                  )}
                </button>
              </div>
            )}

            {/* Избранное – всегда зелёное сердечко faHeartSolid */}
            {shouldShowFavorites && (
              <div className="nav-favorites">
                <button 
                  ref={favoritesBtnRef}
                  className="nav-favorites-btn" 
                  onClick={toggleFavorites} 
                  aria-label="Избранное" 
                  disabled={isLoadingFavorites}
                >
                  {isLoadingFavorites ? (
                    <span className="loading-spinner-small"></span>
                  ) : (
                    <FontAwesomeIcon icon={faHeartSolid} />
                  )}
                  {favoritesCount > 0 && <span className="favorites-badge">{favoritesCount}</span>}
                </button>
                <div ref={favoritesDropdownRef} className={`favorites-dropdown ${showFavorites ? 'show' : ''}`}>
                  <div className="favorites-dropdown-header">
                    <h4>Избранное ({favoritesCount})</h4>
                    {favoritesCount > 0 && (
                      <button className="clear-favorites" onClick={clearFavorites} disabled={isLoadingFavorites}>
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
                        <p className="favorites-empty-hint">Нажмите на ♡ в каталоге, чтобы добавить дом в избранное</p>
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
                            <div className="favorites-item-title">{item.houseType} - {item.rooms} комн.</div>
                            <div className="favorites-item-price">
                              {formatPriceWithIcon(item.price, item.rentType || 'day')}
                            </div>
                            <div className="favorites-item-address">{item.city}, {item.street}</div>
                          </div>
                          <button className="favorites-item-remove" onClick={() => removeFromFavorites(item.id)} aria-label="Удалить из избранного" disabled={isLoadingFavorites}>
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ))
                    )}
                    {favoritesCount > 5 && !isLoadingFavorites && (
                      <div className="favorites-more"><span>... и еще {favoritesCount - 5} домов</span></div>
                    )}
                  </div>
                  {favoritesCount > 0 && !isLoadingFavorites && (
                    <div className="favorites-dropdown-footer">
                      <Link to="/favorites" className="view-all-favorites" onClick={() => setShowFavorites(false)}>
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        Перейти в избранное
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="nav-favorites">
                <button className="nav-favorites-btn" onClick={() => openAuthModal(true)} aria-label="Избранное">
                  <FontAwesomeIcon icon={faHeartSolid} />
                </button>
              </div>
            )}

            {/* Профиль пользователя */}
            {isLoggedIn ? (
              <div className="user-profile-menu" ref={userBtnRef}>
                <button className="user-profile-link" onClick={toggleUserDropdown}>
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                    {isAdmin && <div className="admin-badge" title="Администратор"><FontAwesomeIcon icon={faShieldAlt} /></div>}
                  </div>
                </button>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowFavorites(false)}>
                    <FontAwesomeIcon icon={faUser} /><span>Профиль</span>
                  </Link>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /><span>Выйти</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button className="header-btn-secondary" onClick={() => openAuthModal(true)} disabled={isLoading}>
                  {isLoading ? 'Загрузка...' : 'Войти'}
                </button>
                <button className="header-btn-primary" onClick={() => openAuthModal(false)} disabled={isLoading}>
                  {isLoading ? 'Загрузка...' : 'Регистрация'}
                </button>
              </>
            )}
            <button className="mobile-menu-btn" aria-label="Меню" onClick={() => {}}>☰</button>
          </div>
        </nav>
      </header>

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
            <div className="toast-icon">
              {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
              {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
              {toast.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
              {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
            </div>
            <div className="toast-content"><div className="toast-message">{toast.text}</div></div>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}><i className="fas fa-times"></i></button>
          </div>
        ))}
      </div>

      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={closeAuthModal}><FontAwesomeIcon icon={faTimes} /></button>
            <div className="auth-modal-header">
              <h2>{isLoginForm ? "Вход в аккаунт" : "Регистрация"}</h2>
              <p className="auth-modal-subtitle">{isLoginForm ? "Введите ваши данные для входа" : "Создайте новый аккаунт"}</p>
            </div>
            {isLoginForm ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@mail.ru" required className="auth-input" disabled={isLoading} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Введите пароль" required className="auth-input" disabled={isLoading} />
                    <button type="button" className="password-toggle-right" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>{isLoading ? "Загрузка..." : "Войти"}</button>
                <div className="auth-form-footer">
                  <p className="auth-switch-text">Нет аккаунта? <button type="button" className="auth-switch-btn" onClick={switchToRegister} disabled={isLoading}>Зарегистрироваться</button></p>
                </div>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@mail.ru" required className="auth-input" disabled={isLoading} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faUserIcon} className="input-icon" />
                    <input type="text" name="fio" value={formData.fio} onChange={handleInputChange} placeholder="Иванов Иван" required className="auth-input" disabled={isLoading} />
                  </div>
                  <small className="input-hint">Введите имя и фамилию</small>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faPhone} className="input-icon" />
                    <input type="tel" name="phone_num" value={formData.phone_num} onChange={handleInputChange} placeholder="+375 (XX) XXX-XX-XX" required className="auth-input" disabled={isLoading} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Придумайте пароль" required className="auth-input" disabled={isLoading} />
                    <button type="button" className="password-toggle-right" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Повторите пароль" required className="auth-input" disabled={isLoading} />
                    <button type="button" className="password-toggle-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>{isLoading ? "Загрузка..." : "Зарегистрироваться"}</button>
                <div className="auth-form-footer">
                  <p className="auth-switch-text">Уже есть аккаунт? <button type="button" className="auth-switch-btn" onClick={switchToLogin} disabled={isLoading}>Войти</button></p>
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