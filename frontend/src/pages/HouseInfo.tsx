import React, { useState } from "react";
import {useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faBed,
  faBath,
  faRulerCombined,
  faBuilding,
  faCalendarAlt,
  faPhone,
  faComment,
  faEnvelope,
  faHeart,
  faCheck,
  faSubway,
  faSchool,
  faStore,
  faTree,
  faStar,
  faStarHalfAlt,

  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import "./HouseInfo.css";

interface House {
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
  isPremium: boolean;
  isHot: boolean;
  description: string;
  features: string[];
  owner: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    isVerified: boolean;
  };
  locationFeatures: {
    metro: string;
    schools: string;
    shops: string;
    parks: string;
  };
  images: string[];
}

const HouseInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Пример данных о доме
  const house: House = {
    id: parseInt(id || "1"),
    badge: "Аренда",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
    price: "45,000 BYN/мес",
    address: "Минская область, д. Ратомка, ул. Лесная, 15",
    info: "Загородный дом для аренды, 250 м²",
    beds: 4,
    baths: 3,
    area: 250,
    year: 2020,
    rating: 4.8,
    isPremium: true,
    isHot: true,
    description: `Просторный загородный дом для аренды в живописной местности. Идеальное место для отдыха от городской суеты. Дом построен из экологически чистых материалов, имеет современную отделку и всю необходимую технику.
    
Двухэтажный дом с террасой и большим участком. На первом этаже: просторная гостиная с камином, кухня-столовая, кабинет, гостевой санузел. На втором этаже: 3 спальни, 2 ванные комнаты, гардеробная.
    
Участок 15 соток с садом, беседкой и местом для барбекю. Есть гараж на 2 машины.`,
    features: [
      "Полностью меблированный",
      "Вся техника в наличии",
      "Камин",
      "Терраса с видом на лес",
      "Гараж на 2 машины",
      "Участок 15 соток",
      "Беседка с мангалом",
      "Система безопасности",
      "Wi-Fi по всему дому",
      "Спутниковое ТВ"
    ],
    owner: {
      name: "Андрей Иванов",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      rating: 4.9,
      reviews: 24,
      isVerified: true
    },
    locationFeatures: {
      metro: "Ближайшая станция - 15 км",
      schools: "Школа в 5 км",
      shops: "Магазины в 3 км",
      parks: "Лесной массив рядом"
    },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop"
    ]
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="star-icon" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="star-icon" />);
    }
    
    return stars;
  };

  return (
    <>
      <Header />
      
      <div className="house-info-page">
        <div className="container-house">
          {/* Кнопка назад */}
          <button className="back-button-house" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} />
            Назад
          </button>

          {/* Галерея */}
          <section className="gallery-section-house">
            <div className="gallery-house">
              <div className="main-image-house">
                <img src={house.images[activeImage]} alt={`Дом ${activeImage + 1}`} />
                <div className="image-badges-house">
                  <span className="property-badge-house available-house">
                    {house.badge}
                  </span>
                  {house.isPremium && (
                    <span className="property-badge-house premium-house">
                      <FontAwesomeIcon icon={faStar} /> Премиум
                    </span>
                  )}
                  {house.isHot && (
                    <span className="property-badge-house hot-house">
                      🔥 Горячее
                    </span>
                  )}
                </div>
              </div>
              <div className="thumbnails-house">
                {house.images.slice(0, 5).map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-house ${index === activeImage ? 'active-house' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`Миниатюра ${index + 1}`} />
                  </div>
                ))}
                {house.images.length > 5 && (
                  <button className="more-photos-house">
                    +{house.images.length - 5} фото
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Основная информация */}
          <section className="property-info-section-house">
            <div className="property-layout-house">
              {/* Основной контент */}
              <div className="main-content-house">
                {/* Заголовок */}
                <div className="property-header-house">
                  <h1>{house.info}</h1>
                  <p className="property-address-house">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {house.address}
                  </p>
                  <div className="price-section-house">
                    <h2>{house.price}</h2>
                  </div>
                </div>

                {/* Основные характеристики */}
                <div className="key-features-house">
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faRulerCombined} />
                    <div>
                      <span className="feature-value-house">{house.area} м²</span>
                      <span className="feature-label-house">Общая площадь</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faBed} />
                    <div>
                      <span className="feature-value-house">{house.beds}</span>
                      <span className="feature-label-house">Спальни</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faBath} />
                    <div>
                      <span className="feature-value-house">{house.baths}</span>
                      <span className="feature-label-house">Ванные</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faBuilding} />
                    <div>
                      <span className="feature-value-house">2 этажа</span>
                      <span className="feature-label-house">Этажность</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <div>
                      <span className="feature-value-house">{house.year}</span>
                      <span className="feature-label-house">Год постройки</span>
                    </div>
                  </div>
                </div>

                {/* Описание */}
                <div className="description-section-house">
                  <h3>Описание дома</h3>
                  {house.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* Особенности */}
                <div className="features-section-house">
                  <h3>Особенности дома</h3>
                  <div className="features-grid-house">
                    {house.features.map((feature, index) => (
                      <div key={index} className="feature-item-check-house">
                        <FontAwesomeIcon icon={faCheck} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Расположение */}
                <div className="location-section-house">
                  <h3>Расположение и инфраструктура</h3>
                  <div className="location-info-house">
                    <div className="location-features-house">
                      <div className="location-item-house">
                        <FontAwesomeIcon icon={faSubway} />
                        <div>
                          <strong>Транспорт:</strong>
                          <span>{house.locationFeatures.metro}</span>
                        </div>
                      </div>
                      <div className="location-item-house">
                        <FontAwesomeIcon icon={faSchool} />
                        <div>
                          <strong>Образование:</strong>
                          <span>{house.locationFeatures.schools}</span>
                        </div>
                      </div>
                      <div className="location-item-house">
                        <FontAwesomeIcon icon={faStore} />
                        <div>
                          <strong>Магазины:</strong>
                          <span>{house.locationFeatures.shops}</span>
                        </div>
                      </div>
                      <div className="location-item-house">
                        <FontAwesomeIcon icon={faTree} />
                        <div>
                          <strong>Отдых:</strong>
                          <span>{house.locationFeatures.parks}</span>
                        </div>
                      </div>
                    </div>
                    <div className="map-placeholder-house">
                      <div className="map-image-house">
                        {/* Здесь будет карта */}
                        <div className="map-overlay-house">
                          <p>Карта расположения дома</p>
                        </div>
                      </div>
                      <button className="btn-secondary-house">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        Открыть карту
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Боковая панель */}
              <div className="sidebar-house">
                {/* Карточка владельца */}
                <div className="contact-card-house">
                  <div className="owner-info-house">
                    <img src={house.owner.avatar} alt={house.owner.name} />
                    <div className="owner-details-house">
                      <h4>Владелец: {house.owner.name}</h4>
                      <p>Владелец дома</p>
                      <div className="owner-rating-house">
                        {renderStars(house.owner.rating)}
                        <span>{house.owner.rating} ({house.owner.reviews} отзывов)</span>
                      </div>
                      {house.owner.isVerified && (
                        <div className="verified-badge-house">
                          ✅ Проверенный владелец
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="contact-actions-house">
                    <button className="btn-primary-house full-width-house">
                      <FontAwesomeIcon icon={faPhone} />
                      Позвонить владельцу
                    </button>
                    <button className="btn-secondary-house full-width-house">
                      <FontAwesomeIcon icon={faComment} />
                      Написать сообщение
                    </button>
                    <button className="btn-outline-house full-width-house">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Отправить email
                    </button>
                  </div>
                  
                  {/* Информация о публикации */}
                  <div className="contact-meta-house">
                    <div className="meta-item-house">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Опубликовано 3 дня назад</span>
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="action-buttons-house">
                  <button 
                    className={`btn-outline-house full-width-house ${isFavorite ? 'active-favorite' : ''}`}
                    onClick={toggleFavorite}
                  >
                    <FontAwesomeIcon icon={isFavorite ? faHeart : faHeartRegular} />
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

    </>
  );
};

export default HouseInfo;