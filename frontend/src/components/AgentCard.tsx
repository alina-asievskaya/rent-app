import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faComments,
  faCalendarAlt,
  faComment,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './AgentCard.css';

export interface Agent {
  id: number;
  userId: number;
  name: string;
  position: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  experience: number;
  propertiesManaged: number;
  description: string;
  satisfactionRate: number;
  contact: {
    phone: string;
    email: string;
  };
  specialties: string[];
  stats: {
    avgResponseTime: string;
    dealSuccessRate: number;
    avgDaysToRent: number;
  };
  price?: number | null;   
}

interface AgentCardProps {
  agent: Agent;
  viewMode?: 'grid' | 'list';
  onChatClick?: (agentId: number, e: React.MouseEvent) => void;
  isCreatingChat?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  viewMode = 'grid',
  onChatClick,
  isCreatingChat = false
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.agentcard-btn') || target.closest('a')) return;
    navigate(`/agents/${agent.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onChatClick) {
      onChatClick(agent.id, e);
    }
  };

  const formatReviews = (count: number) => {
    if (count === 1) return 'отзыв';
    if (count >= 2 && count <= 4) return 'отзыва';
    return 'отзывов';
  };

  const formatPrice = (price?: number | null) => {
    if (!price && price !== 0) return '—';
    return `от ${price.toLocaleString('ru-RU')}`;
  };

  const renderContent = () => (
    <>
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
        </div>
      </div>

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

        <div className="agentcard-stat-item">
          <div className="agentcard-stat-icon">
            <i className="nbrb-icon" style={{ fontSize: '1.2rem' }}>&#xe901;</i>
          </div>
          <div className="agentcard-stat-content">
            <div className="agentcard-stat-value">
              {formatPrice(agent.price)}
            </div>
            <div className="agentcard-stat-label">стоимость услуги</div>
          </div>
        </div>
      </div>

      <div className="agentcard-actions">
        <button 
          className="agentcard-btn agentcard-btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/agents/${agent.id}`);
          }}
        >
          Смотреть профиль
        </button>
        
        <button 
          className="agentcard-btn agentcard-btn-chat"
          onClick={handleChatClick}
          disabled={isCreatingChat}
          aria-label="Написать в чат"
        >
          <FontAwesomeIcon icon={faComment} />
          <span>Чат</span>
        </button>
      </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <div className={`agentcard ${viewMode}`} onClick={handleCardClick}>
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
          </div>
        </div>

        <div className="agentcard-main-content">
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
            <div className="agentcard-stat-item">
              <div className="agentcard-stat-icon">
                <i className="nbrb-icon" style={{ fontSize: '1.2rem' }}>&#xe901;</i>
              </div>
              <div className="agentcard-stat-content">
                <div className="agentcard-stat-value">
                  {formatPrice(agent.price)}
                </div>
                <div className="agentcard-stat-label">цена услуги</div>
              </div>
            </div>
          </div>

          <div className="agentcard-actions">
            <button 
              className="agentcard-btn agentcard-btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/agents/${agent.id}`);
              }}
            >
              Смотреть профиль
            </button>
            <button 
              className="agentcard-btn agentcard-btn-chat"
              onClick={handleChatClick}
              disabled={isCreatingChat}
            >
              <FontAwesomeIcon icon={faComment} />
              <span>Чат</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`agentcard ${viewMode}`} onClick={handleCardClick}>
      {renderContent()}
    </div>
  );
};

export default AgentCard;