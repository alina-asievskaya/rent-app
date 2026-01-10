import React from "react";
import "./LegalPages.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-card">
          <div className="legal-icon">🔒</div>
          <h1 className="legal-title">Конфиденциальность</h1>
          
          <div className="legal-list">
            <div className="legal-item">
              <div className="item-icon">📱</div>
              <span>Собираем только телефон и email</span>
            </div>
            <div className="legal-item">
              <div className="item-icon">🚫</div>
              <span>Не продаем данные третьим лицам</span>
            </div>
            <div className="legal-item">
              <div className="item-icon">🗑️</div>
              <span>Можете запросить удаление данных</span>
            </div>
            <div className="legal-item">
              <div className="item-icon">🍪</div>
              <span>Используем cookies для работы сайта</span>
            </div>
          </div>

          <a href="/" className="legal-back">
            Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;