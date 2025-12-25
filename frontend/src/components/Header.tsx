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
 
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import "./Header.css";

interface FavoriteItem {
  id: number;
  title: string;
  price: string;
  image: string;
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfilePage, setIsProfilePage] = useState(false);

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

  // Проверяем текущую страницу
  useEffect(() => {
    setIsProfilePage(location.pathname === '/profile');
  }, [location]);

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
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        setIsLoggedIn(true);
        setShowAuthModal(false);
        setFormData({
          email: "",
          fio: "",
          password: "",
          confirmPassword: "",
          phone_num: ""
        });
        
        // Переходим на профиль после входа
        navigate('/profile');
      } else {
        alert(data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    if (!formData.fio.trim()) {
      alert("Введите имя и фамилию!");
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
      
      const data = await response.json();
      
      if (data.success) {
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
        
        const loginData = await loginResponse.json();
        
        if (loginData.success) {
          localStorage.setItem('token', loginData.data.token);
          localStorage.setItem('user', JSON.stringify(loginData.data));
          
          setIsLoggedIn(true);
          setShowAuthModal(false);
          setFormData({
            email: "",
            fio: "",
            password: "",
            confirmPassword: "",
            phone_num: ""
          });
          
          navigate('/profile');
        } else {
          alert("Регистрация прошла успешно, но не удалось автоматически войти. Пожалуйста, войдите вручную.");
        }
      } else {
        alert(data.message || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      alert('Ошибка соединения с сервером');
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
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Класс для Header в зависимости от страницы
  const headerClass = `header ${isProfilePage ? 'header-fixed' : ''}`;

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
              <div className="user-profile-menu">
                <Link to="/profile" className="user-profile-link">
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                </Link>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    <FontAwesomeIcon icon={faUser} />
                    <span>Мой профиль</span>
                  </Link>
                  <button 
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  className="btn-secondary" 
                  onClick={() => openAuthModal(true)}
                >
                  Войти
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => openAuthModal(false)}
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
                    />
                    <button
                      type="button"
                      className="password-toggle-right"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                
                <button type="submit" className="btn-primary auth-submit-btn">
                  Войти
                </button>
                
                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Нет аккаунта?{" "}
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={switchToRegister}
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
                    />
                    <button
                      type="button"
                      className="password-toggle-right"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Скрыть пароль" : "Показать пароль"}
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
                    />
                    <button
                      type="button"
                      className="password-toggle-right"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                
                <button type="submit" className="btn-primary auth-submit-btn">
                  Зарегистрироваться
                </button>
                
                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Уже есть аккаунт?{" "}
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={switchToLogin}
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