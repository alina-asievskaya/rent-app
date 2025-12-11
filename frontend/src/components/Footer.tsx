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
              <div className="footer-logo-icon">P</div>
              <div className="footer-logo-text">Prime<span>House</span></div>
            </a>
            <p className="footer-description">
              Ваш надежный партнер в мире недвижимости с 2010 года. 
              Мы помогаем найти идеальный дом для аренды или покупки.
            </p>
            
            {/* Социальные сети */}
            <div className="social-links">
              <a href="#" className="social-link vk" aria-label="ВКонтакте">
                <i className="fab fa-vk"></i>
              </a>
              <a href="#" className="social-link telegram" aria-label="Telegram">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="#" className="social-link whatsapp" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            
            {/* Форма подписки */}
            <div className="newsletter">
              <p>Подпишитесь на новости о новых предложениях</p>
              <form className="newsletter-form">
                <input 
                  type="email" 
                  className="newsletter-input" 
                  placeholder="Ваш email"
                  required
                />
                <button type="submit" className="newsletter-button">
                  Подписаться
                </button>
              </form>
            </div>
          </div>

          {/* Недвижимость */}
          <div className="footer-section">
            <h4>Недвижимость</h4>
            <ul className="footer-links">
              <li><a href="#"><i className="fas fa-chevron-right"></i> Купить квартиру</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Снять квартиру</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Коттеджи и дома</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Коммерческая</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Новостройки</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Загородная</a></li>
            </ul>
          </div>

          {/* Компания */}
          <div className="footer-section">
            <h4>Компания</h4>
            <ul className="footer-links">
              <li><a href="#"><i className="fas fa-chevron-right"></i> О нас</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Наша команда</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Вакансии</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Отзывы</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Блог</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Партнеры</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="footer-section">
            <h4>Контакты</h4>
            <ul className="contact-info">
              <li>
                <i className="fas fa-phone"></i>
                <div>
                  <a href="tel:+74951234567">+7 (495) 123-45-67</a><br />
                  <small>Ежедневно с 9:00 до 21:00</small>
                </div>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <div>
                  <a href="mailto:info@primehouse.ru">info@primehouse.ru</a><br />
                  <small>Для общих вопросов</small>
                </div>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  Москва, ул. Примерная, 15<br />
                  <small>БЦ "Премиум", 5 этаж</small>
                </div>
              </li>
              <li>
                <i className="fas fa-clock"></i>
                <div>
                  Пн-Пт: 9:00-20:00<br />
                  <small>Сб-Вс: 10:00-18:00</small>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; 2024 PrimeHouse. Все права защищены.
          </div>
          <div className="footer-bottom-links">
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Пользовательское соглашение</a>
            <a href="#">Карта сайта</a>
            <a href="#">Помощь</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;