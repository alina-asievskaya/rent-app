import React from "react";
import "./LegalPages.css";

const UserAgreement: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-card">
          <div className="legal-header">
            <h1 className="legal-title">Пользовательское соглашение</h1>
            <p className="legal-subtitle">Условия использования сервиса PrimeHouse</p>
          </div>
          
          <div className="legal-content">
            <div className="agreement-grid">
              <div className="agreement-section">
                <h2 className="section-title allowed">Обязанности пользователя</h2>
                <ul className="rule-list">
                  <li>Соблюдать правила проживания в арендуемом доме</li>
                  <li>Своевременно оплачивать аренду</li>
                  <li>Сообщать о повреждениях имущества</li>
                  <li>Соблюдать тишину в ночное время</li>
                  <li>Оставлять помещение в чистоте</li>
                </ul>
              </div>

              <div className="agreement-section">
                <h2 className="section-title prohibited">Запрещенные действия</h2>
                <ul className="rule-list">
                  <li>Проведение мероприятий без согласования</li>
                  <li>Нарушение общественного порядка</li>
                  <li>Курение в помещениях</li>
                  <li>Размещение большего числа гостей</li>
                  <li>Порча имущества</li>
                </ul>
              </div>
            </div>

            <section className="legal-section">
              <h2 className="section-title">Правовые аспекты</h2>
              <div className="section-content">
                <p className="legal-note">
                  Договор аренды заключается напрямую между арендатором и владельцем недвижимости. 
                  Сервис PrimeHouse выступает в качестве посредника и не несет ответственности 
                  за выполнение условий договора сторонами.
                </p>
              </div>
            </section>

            <div className="legal-footer">
              <p className="footer-note">
                Бронируя жилье через наш сервис, вы подтверждаете согласие с данными условиями.
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

export default UserAgreement;