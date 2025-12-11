import React, { useState } from "react";
import "./PropertyCard.css";

interface PropertyCardProps {
  badge: string;
  imageUrl: string;
  price: string;
  address: string;
  info: string;
  beds: number;
  baths: number;
  area: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  badge,
  imageUrl,
  price,
  address,
  info,
  beds,
  baths,
  area,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="property-card">
      <div className={`property-badge ${badge === "Аренда" ? "rent" : ""}`}>
        {badge}
      </div>
      
      <div className="image-wrapper">
        <img src={imageUrl} alt={info} />
        
        <button 
          className="heart-button"
          onClick={handleFavoriteClick}
          title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div className="property-content">
        <h3>{price}</h3>
        <p className="property-address">{address}</p>
        <p className="property-info">{info}</p>
        <div className="property-features">
          <span><i className="fas fa-bed"></i> {beds}</span>
          <span><i className="fas fa-bath"></i> {baths}</span>
          <span><i className="fas fa-ruler-combined"></i> {area}м²</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;