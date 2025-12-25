import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faRulerCombined,
  faBed,
  faBath,
  faStar,
  faFire,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import './HouseCard.css';

interface HouseCardProps {
  house: {
    id: number;
    badge: string;
    imageUrl: string;
    price: string;
    address: string;
    info: string;
    beds: number;
    baths: number;
    area: number;
    year: number;
    rating: number;
    description: string;
    features: string[];
    isPremium?: boolean;
    isHot?: boolean;
  };
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

const HouseCard: React.FC<HouseCardProps> = ({ 
  house, 
  viewMode, 
  isFavorite, 
  onToggleFavorite, 
  onClick 
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div 
      className={`house-card ${viewMode}`}
      onClick={onClick}
    >
      <div className="house-card-image">
        <img src={house.imageUrl} alt={house.address} />
        <div className="house-card-badges">
          {house.isPremium && (
            <span className="badge premium">
              <FontAwesomeIcon icon={faCrown} /> Премиум
            </span>
          )}
          {house.isHot && (
            <span className="badge hot">
              <FontAwesomeIcon icon={faFire} /> Горячее
            </span>
          )}
          <span className="badge type">{house.badge}</span>
        </div>
        
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <FontAwesomeIcon icon={isFavorite ? faHeartSolid : faHeartOutline} />
        </button>
      </div>
      
      <div className="house-card-content">
        <div className="house-card-header">
          <h3 className="house-card-price">{house.price}</h3>
          <div className="house-card-rating">
            <FontAwesomeIcon icon={faStar} />
            <span>{house.rating}</span>
          </div>
        </div>
        
        <div className="house-card-address">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>{house.address}</span>
        </div>
        
        <p className="house-card-info">{house.info}</p>
        
        <div className="house-card-features">
          <div className="feature-item">
            <FontAwesomeIcon icon={faBed} />
            <span>{house.beds} комн.</span>
          </div>
          <div className="feature-item">
            <FontAwesomeIcon icon={faBath} />
            <span>{house.baths} сануз.</span>
          </div>
          <div className="feature-item">
            <FontAwesomeIcon icon={faRulerCombined} />
            <span>{house.area} м²</span>
          </div>
          <div className="feature-item">
            <span>Год: {house.year}</span>
          </div>
        </div>
        
        <p className="house-card-description">{house.description}</p>
        
        {viewMode === 'list' && (
          <>
            <div className="house-card-tags">
              {house.features.map((feature, index) => (
                <span key={index} className="tag">{feature}</span>
              ))}
            </div>
            
            <div className="house-card-actions">
              <button 
                className="btn-primary"
                onClick={(e) => handleButtonClick(e, onClick)}
              >
                Подробнее
              </button>
              <button 
                className="btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  // Логика для "Написать владельцу"
                  console.log('Написать владельцу', house.id);
                }}
              >
                Написать владельцу
              </button>
            </div>
          </>
        )}
      </div>
      
      {viewMode === 'grid' && (
        <div className="house-card-footer">
          <div className="house-card-tags">
            {house.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="tag">{feature}</span>
            ))}
            {house.features.length > 3 && (
              <span className="tag">+{house.features.length - 3}</span>
            )}
          </div>
          
          <button 
            className="house-card-view-btn"
            onClick={(e) => handleButtonClick(e, onClick)}
          >
            Смотреть
          </button>
        </div>
      )}
    </div>
  );
};

export default HouseCard;