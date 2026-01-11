import React from "react";
import "./LegalPages.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-card">
          <div className="legal-header">
            <h1 className="legal-title">Политика конфиденциальности</h1>
          </div>
          
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="section-title">Сбор данных</h2>
              <div className="section-content">
                <p>Мы собираем минимально необходимую информацию для предоставления услуг:</p>
                <ul className="feature-list">
                  <li>Номер телефона</li>
                  <li>Адрес электронной почты</li>
                  <li>Имя и фамилия</li>
                </ul>
              </div>
            </section>

            <section className="legal-section">
              <h2 className="section-title">Использование данных</h2>
              <div className="section-content">
                <p>Ваши данные используются исключительно для:</p>
                <ul className="feature-list">
                  <li>Организации бронирования</li>
                  <li>Связи с консультантами</li>
                  <li>Отправки важных уведомлений</li>
                </ul>
              </div>
            </section>

            <section className="legal-section">
              <h2 className="section-title">Защита данных</h2>
              <div className="section-content">
                <ul className="feature-list">
                  <li>Мы не передаем данные третьим лицам</li>
                  <li>Доступ к данным имеют только сотрудники</li>
                  <li>Вы можете запросить удаление ваших данных</li>
                </ul>
              </div>
            </section>

            <div className="legal-footer">
              <p className="footer-note">
                Используя наш сервис, вы соглашаетесь с данной политикой конфиденциальности.
              </p>
              <a href="/" className="back-button">
                <span className="arrow">←</span>Главная
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;