import React from "react";
import "./LegalPages.css";

const UserAgreement: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-card">
          <div className="legal-icon">📄</div>
          <h1 className="legal-title">Соглашение</h1>
          
          <div className="agreement-grid">
            <div className="agreement-col">
              <h3>✅ Можно</h3>
              <ul>
                <li>Бронировать дома</li>
                <li>Звонить консультантам</li>
                <li>Оставлять отзывы</li>
                <li>Отменять бронирование</li>
              </ul>
            </div>
            
            <div className="agreement-col">
              <h3>❌ Нельзя</h3>
              <ul>
                <li>Портить имущество</li>
                <li>Нарушать тишину ночью</li>
                <li>Проводить мероприятия без согласования</li>
                <li>Оставлять мусор</li>
              </ul>
            </div>
          </div>

          <div className="legal-note">
            <p>⚠️ Договор аренды заключается напрямую с владельцем</p>
          </div>

          <a href="/" className="legal-back">
            Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;