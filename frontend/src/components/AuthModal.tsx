import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faLock,
  faUser as faUserIcon,
  faEye,
  faEyeSlash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import "./AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginForm: boolean;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  email: string;
  fio: string;
  password: string;
  confirmPassword: string;
  phone_num: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isLoginForm,
  onSwitchToRegister,
  onSwitchToLogin,
  onLogin,
  onRegister
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fio: "",
    password: "",
    confirmPassword: "",
    phone_num: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(formData.email, formData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    if (!formData.fio.trim()) {
      alert("Введите имя и фамилию!");
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
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
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="email"
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
            
            <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Войти"}
            </button>
            
            <div className="auth-form-footer">
              <p className="auth-switch-text">
                Нет аккаунта?{" "}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={onSwitchToRegister}
                  disabled={isLoading}
                >
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="email"
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
                  name="phone_num"
                  value={formData.phone_num}
                  onChange={handleInputChange}
                  placeholder="+375 (29) 123-45-67"
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
            
            <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
            
            <div className="auth-form-footer">
              <p className="auth-switch-text">
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={onSwitchToLogin}
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
  );
};

export default AuthModal;