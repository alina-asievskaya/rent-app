import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Логотип и описание */}
          <div className="footer-logo-section">
            <a href="/" className="footer-logo">
              <div className="footer-logo-icon">PH</div>
              <div className="footer-logo-text">Prime<span>House</span></div>
            </a>
            <p className="footer-description">
              Аренда загородных домов и коттеджей в Беларуси
            </p>
            
            {/* Социальные сети */}
            <div className="social-links">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="ВКонтакте">
                <i className="fab fa-vk"></i>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Telegram">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div className="footer-section">
            <h4>Навигация</h4>
            <ul className="footer-links">
              <li><a href="/catalog">Каталог домов</a></li>
              <li><a href="/agents">Наши агенты</a></li>
              <li><a href="/about">О нас</a></li>
              <li><a href="/contacts">Контакты</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="footer-section">
            <h4>Контакты</h4>
            <ul className="contact-info">
              <li>
                <i className="fas fa-phone"></i>
                <a href="tel:+375295849996">+375 (29) 584-99-96</a>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:info@primehouse.by">info@primehouse.by</a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                г. Минск, пр. Победителей, 98
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; 2025 PrimeHouse.by — Аренда домов в Беларуси
          </div>
          <div className="footer-bottom-links">
            <a href="/privacy-policy">Конфиденциальность</a>
            <a href="/user-agreement">Соглашение</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;