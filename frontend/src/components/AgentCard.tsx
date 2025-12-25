import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faComments,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './AgentCard.css';

export interface Agent {
  id: number;
  name: string;
  position: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  experience: number;
  propertiesManaged: number;
  description: string;
  location: string;
  satisfactionRate: number;
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  specialties: string[];
  serviceAreas: string[];
  stats: {
    avgResponseTime: string;
    dealSuccessRate: number;
    avgDaysToRent: number;
  };
}

interface AgentCardProps {
  agent: Agent;
  viewMode?: 'grid' | 'list';
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, viewMode = 'grid' }) => {
  const handleContactClick = (e: React.MouseEvent, type: 'phone' | 'email') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'phone') {
      window.location.href = `tel:${agent.contact.phone}`;
    } else {
      window.location.href = `mailto:${agent.contact.email}`;
    }
  };

  // Форматирование отзывов
  const formatReviews = (count: number) => {
    if (count === 1) return 'отзыв';
    if (count >= 2 && count <= 4) return 'отзыва';
    return 'отзывов';
  };

  if (viewMode === 'list') {
    return (
      <div className={`agentcard ${viewMode}`}>
        {/* Левая панель с аватаром и основной информацией */}
        <div className="agentcard-header">
          <div className="agentcard-avatar-container">
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="agentcard-avatar"
            />
          </div>
          
          <div className="agentcard-info">
            <h3 className="agentcard-name">{agent.name}</h3>
            <p className="agentcard-position">{agent.position}</p>
            
            <div className="agentcard-location">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="agentcard-location-icon" />
              <span>{agent.location}</span>
            </div>
          </div>
        </div>

        {/* Основное содержимое справа */}
        <div className="agentcard-main-content">
          {/* Рейтинг и отзывы в одну строку */}
          <div className="agentcard-rating">
            <div className="agentcard-stars">
              <div className="agentcard-stars-container">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon 
                    key={i}
                    icon={faStar}
                    className={`agentcard-star ${i < Math.floor(agent.rating) ? 'filled' : ''}`}
                  />
                ))}
                <span className="agentcard-rating-value">{agent.rating.toFixed(1)}</span>
              </div>
              <div className="agentcard-reviews">
                <FontAwesomeIcon icon={faComments} className="agentcard-reviews-icon" />
                <span>{agent.reviewsCount} {formatReviews(agent.reviewsCount)}</span>
              </div>
            </div>
          </div>

          {/* Специализация */}
          {agent.specialties.length > 0 && (
            <div className="agentcard-specialties">
              <div className="agentcard-specialties-list">
                {agent.specialties.slice(0, 3).map((specialty, index) => (
                  <span key={index} className="agentcard-specialty">
                    {specialty}
                  </span>
                ))}
                {agent.specialties.length > 3 && (
                  <span className="agentcard-specialty-more">
                    +{agent.specialties.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Статистика в строку */}
          <div className="agentcard-stats">
            <div className="agentcard-stat-item">
              <div className="agentcard-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="agentcard-stat-content">
                <div className="agentcard-stat-value">{agent.experience} {agent.experience === 1 ? 'год' : 'лет'}</div>
                <div className="agentcard-stat-label">опыт</div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="agentcard-actions">
            <Link 
              to={`/agents/${agent.id}`}
              className="agentcard-btn agentcard-btn-primary"
            >
              Профиль агента
            </Link>
            
            <div className="agentcard-contact-buttons">
              <button 
                className="agentcard-btn agentcard-btn-call"
                onClick={(e) => handleContactClick(e, 'phone')}
                aria-label="Позвонить"
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>Позвонить</span>
              </button>
              <button 
                className="agentcard-btn agentcard-btn-email"
                onClick={(e) => handleContactClick(e, 'email')}
                aria-label="Написать"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Написать</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Оригинальный код для режима grid
  return (
    <div className={`agentcard ${viewMode}`}>
      {/* Аватар и основная информация */}
      <div className="agentcard-header">
        <div className="agentcard-avatar-container">
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="agentcard-avatar"
          />
        </div>
        
        <div className="agentcard-info">
          <h3 className="agentcard-name">{agent.name}</h3>
          <p className="agentcard-position">{agent.position}</p>
          
          <div className="agentcard-location">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="agentcard-location-icon" />
            <span>{agent.location}</span>
          </div>
        </div>
      </div>

      {/* Рейтинг и отзывы */}
      <div className="agentcard-rating">
        <div className="agentcard-stars">
          <div className="agentcard-stars-container">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon 
                key={i}
                icon={faStar}
                className={`agentcard-star ${i < Math.floor(agent.rating) ? 'filled' : ''}`}
              />
            ))}
            <span className="agentcard-rating-value">{agent.rating.toFixed(1)}</span>
          </div>
          <div className="agentcard-reviews">
            <FontAwesomeIcon icon={faComments} className="agentcard-reviews-icon" />
            <span>{agent.reviewsCount} {formatReviews(agent.reviewsCount)}</span>
          </div>
        </div>
      </div>

      {/* Специализация */}
      {agent.specialties.length > 0 && (
        <div className="agentcard-specialties">
          <div className="agentcard-specialties-list">
            {agent.specialties.slice(0, 2).map((specialty, index) => (
              <span key={index} className="agentcard-specialty">
                {specialty}
              </span>
            ))}
            {agent.specialties.length > 2 && (
              <span className="agentcard-specialty-more">
                +{agent.specialties.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="agentcard-stats">
        <div className="agentcard-stat-item">
          <div className="agentcard-stat-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="agentcard-stat-content">
            <div className="agentcard-stat-value">{agent.experience} {agent.experience === 1 ? 'год' : 'лет'}</div>
            <div className="agentcard-stat-label">опыт работы</div>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="agentcard-actions">
        <Link 
          to={`/agents/${agent.id}`}
          className="agentcard-btn agentcard-btn-primary"
        >
          Смотреть профиль
        </Link>
        
        <div className="agentcard-contact-buttons">
          <button 
            className="agentcard-btn agentcard-btn-call"
            onClick={(e) => handleContactClick(e, 'phone')}
            aria-label="Позвонить"
          >
            <FontAwesomeIcon icon={faPhone} />
            <span>Позвонить</span>
          </button>
          <button 
            className="agentcard-btn agentcard-btn-email"
            onClick={(e) => handleContactClick(e, 'email')}
            aria-label="Написать"
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Написать</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;