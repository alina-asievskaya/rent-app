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
              Аренда загородных домов и коттеджей в Беларуси с 2025 года. 
              Мы помогаем найти идеальный дом для отдыха и проживания 
              по всей территории страны.
            </p>
            
            {/* Социальные сети */}
            <div className="social-links">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="social-link vk" aria-label="ВКонтакте">
                <i className="fab fa-vk"></i>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-link telegram" aria-label="Telegram">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="https://wa.me/375295849996" target="_blank" rel="noopener noreferrer" className="social-link whatsapp" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Недвижимость */}
          <div className="footer-section">
            <h4>Недвижимость</h4>
            <ul className="footer-links">
              <li><a href="/catalog"><i className="fas fa-chevron-right"></i> Все дома</a></li>
              <li><a href="/catalog?type=cottage"><i className="fas fa-chevron-right"></i> Коттеджи</a></li>
              <li><a href="/catalog?type=village"><i className="fas fa-chevron-right"></i> Дома в деревнях</a></li>
              <li><a href="/catalog?region=minsk"><i className="fas fa-chevron-right"></i> Минская область</a></li>
              <li><a href="/catalog?region=brest"><i className="fas fa-chevron-right"></i> Брестская область</a></li>
            </ul>
          </div>

          {/* Наши агенты */}
          <div className="footer-section">
            <h4>Наши агенты</h4>
            <ul className="footer-links">
              <li><a href="/agents"><i className="fas fa-chevron-right"></i> Все агенты</a></li>
              <li><a href="/agents?specialty=minsk"><i className="fas fa-chevron-right"></i> Агенты в Минске</a></li>
              <li><a href="/agents?specialty=brest"><i className="fas fa-chevron-right"></i> Агенты в Бресте</a></li>
              <li><a href="/agents?specialty=gomel"><i className="fas fa-chevron-right"></i> Агенты в Гомеле</a></li>
              <li><a href="/become-agent"><i className="fas fa-chevron-right"></i> Стать агентом</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="footer-section">
            <h4>Контакты</h4>
            <ul className="contact-info">
              <li>
                <i className="fas fa-phone"></i>
                <div>
                  <a href="tel:+375295849996">+375 (29) 584-99-96</a><br />
                  <small>Бесплатно по Беларуси</small>
                </div>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <div>
                  <a href="tel:+375173456789">+375 (17) 345-67-89</a><br />
                  <small>Городской телефон</small>
                </div>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <div>
                  <a href="mailto:info@primehouse.by">info@primehouse.by</a><br />
                  <small>Для общих вопросов</small>
                </div>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  г. Минск, пр. Победителей, 89<br />
                  <small>БЦ "Грин Сити", 7 этаж</small>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; 2025 PrimeHouse.by — Аренда домов в Беларуси. Все права защищены.
          </div>
          <div className="footer-bottom-links">
            <a href="/privacy-policy">Политика конфиденциальности</a>
            <a href="/user-agreement">Пользовательское соглашение</a>
            <a href="/sitemap">Карта сайта</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;