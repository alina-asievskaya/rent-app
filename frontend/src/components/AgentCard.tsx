import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faCheckCircle,
  faComments,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faChartLine,
  faHome,
  faLeaf,
  faBuilding,
  faWater,
  faMountain
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
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
  isOnline: boolean;
  responseTime: string;
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

  // Иконки для специализаций
  const getSpecialtyIcon = (specialty: string): IconDefinition => {
    const icons: Record<string, IconDefinition> = {
      'Загородные дома': faHome,
      'Коттеджи': faHome,
      'Усадьбы': faBuilding,
      'Дома с участком': faLeaf,
      'Эко-дома': faLeaf,
      'Дома у озера': faWater,
      'Дома в горах': faMountain,
      'Семейные дома': faHome
    };
    return icons[specialty] || faHome;
  };

  return (
    <div className={`agent-card ${viewMode}`}>
      {/* Аватар и статус */}
      <div className="agent-header">
        <div className="agent-avatar-wrapper">
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="agent-avatar"
          />
          <div className={`agent-status ${agent.isOnline ? 'online' : 'offline'}`}>
            <div className="status-dot"></div>
          </div>
        </div>
        
        <div className="agent-info">
          <h3 className="agent-name">{agent.name}</h3>
          <p className="agent-position">{agent.position}</p>
          
          <div className="agent-location">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{agent.location}</span>
          </div>
        </div>
      </div>

      {/* Рейтинг и отзывы */}
      <div className="agent-rating-section">
        <div className="rating-display">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon 
                key={i}
                icon={faStar}
                className={`star ${i < Math.floor(agent.rating) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <div className="rating-value">{agent.rating.toFixed(1)}</div>
        </div>
        <div className="reviews">
          <FontAwesomeIcon icon={faComments} />
          <span>{agent.reviewsCount} отзывов</span>
        </div>
      </div>

      {/* Специализация */}
      <div className="agent-specialties">
        <div className="specialties-list">
          {agent.specialties.slice(0, 3).map((specialty, index) => (
            <div key={index} className="specialty-item">
              <FontAwesomeIcon icon={getSpecialtyIcon(specialty)} className="specialty-icon" />
              <span>{specialty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <div className="agent-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-details">
            <div className="stat-value">{agent.experience} лет</div>
            <div className="stat-label">Опыт</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-details">
            <div className="stat-value">{agent.propertiesManaged}</div>
            <div className="stat-label">Домов</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="stat-details">
            <div className="stat-value">{agent.stats.dealSuccessRate}%</div>
            <div className="stat-label">Успешность</div>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="agent-actions">
        <Link 
          to={`/agents/${agent.id}`}
          className="btn-profile"
        >
          Открыть профиль
        </Link>
        
        <div className="quick-contacts">
          <button 
            className="contact-btn"
            onClick={(e) => handleContactClick(e, 'phone')}
            title="Позвонить"
          >
            <FontAwesomeIcon icon={faPhone} />
          </button>
          <button 
            className="contact-btn"
            onClick={(e) => handleContactClick(e, 'email')}
            title="Написать"
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </button>
        </div>
      </div>

      {/* Быстрая информация при наведении */}
      <div className="agent-hover-info">
        <div className="hover-info-item">
          <FontAwesomeIcon icon={faClock} />
          <span>Отвечает за {agent.responseTime}</span>
        </div>
        <div className="hover-info-item">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{agent.satisfactionRate}% довольных клиентов</span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;