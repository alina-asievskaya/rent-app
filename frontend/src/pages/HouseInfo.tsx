import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  faHeart,
  faCheck,
  faSubway,
  faSchool,
  faStore,
  faTree,
  faStar,
  faStarHalfAlt,
  faChevronLeft,
  faSnowflake,
  faWifi,
  faShieldAlt,
  faCar,
  faSwimmingPool,
  faHotTub,
  faSpinner,
  faUser,
  faReply
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import "./HouseInfo.css";

// Интерфейс для данных с сервера
interface ApiHouseInfo {
  id: number;
  price: number;
  area: number;
  description: string;
  houseType: string;
  announcementData: string;
  active: boolean;
  photos: string[];
  houseInfo?: {
    region?: string;
    city?: string;
    street?: string;
    rooms?: number;
    bathrooms?: number;
    floor?: number;
  };
  owner?: {
    fio?: string;
    email?: string;
    phone_num?: string;
  };
  convenience?: {
    conditioner: boolean;
    furniture: boolean;
    internet: boolean;
    security: boolean;
    videoSurveillance: boolean;
    fireAlarm: boolean;
    parking: boolean;
    garage: boolean;
    garden: boolean;
    swimmingPool: boolean;
    sauna: boolean;
    transport?: string;
    education?: string;
    shops?: string;
  };
}

// Упрощенный интерфейс для компонента
interface HouseInfo {
  id: number;
  price: number;
  area: number;
  description: string;
  houseType: string;
  announcementData: string;
  active: boolean;
  photos: string[];
  region?: string;
  city?: string;
  street?: string;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  owner?: {
    fio?: string;
    email?: string;
    phone_num?: string;
    avatar?: string;
  };
  convenience?: {
    conditioner: boolean;
    furniture: boolean;
    internet: boolean;
    security: boolean;
    videoSurveillance: boolean;
    fireAlarm: boolean;
    parking: boolean;
    garage: boolean;
    garden: boolean;
    swimmingPool: boolean;
    sauna: boolean;
    transport?: string;
    education?: string;
    shops?: string;
  };
}

interface Review {
  id: number;
  id_user: number;
  rating: number;
  text: string;
  id_houses: number;
  data_reviews: string;
  user?: {
    fio?: string;
  };
  owner_reply?: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiHouseInfo;
  message?: string;
}

interface ReviewsResponse {
  success: boolean;
  data: Review[];
  message?: string;
}

interface UserResponse {
  success: boolean;
  data: {
    fio?: string;
    email?: string;
    phone_num?: string;
    avatar?: string;
  };
}

// Тип для иконок
type IconType = typeof faCheck;

const HouseInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [house, setHouse] = useState<HouseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{
    fio?: string;
    email?: string;
    phone_num?: string;
    avatar?: string;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Проверка авторизации и получение текущего пользователя
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.userId) {
          setCurrentUserId(tokenData.userId);
        }
      } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
      }
    }
  }, []);

  // Загрузка отзывов (ИСПРАВЛЕНО: GET запрос, а не POST)
  const fetchReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const API_URL = 'http://localhost:5213/api';
      
      const response = await fetch(`${API_URL}/houses/${id}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: ReviewsResponse = await response.json();
        if (result.success && result.data) {
          setReviews(result.data);
        }
      } else if (response.status !== 404) {
        console.error('Ошибка при загрузке отзывов:', response.status);
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  // Загрузка информации о владельце
  const fetchOwnerInfo = useCallback(async (owner: { email?: string; fio?: string; phone_num?: string; avatar?: string }) => {
    try {
      const API_URL = 'http://localhost:5213/api';
      if (owner.email) {
        const response = await fetch(`${API_URL}/houses/users/by-email/${encodeURIComponent(owner.email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result: UserResponse = await response.json();
          if (result.success && result.data) {
            setOwnerInfo(result.data);
          }
        }
      } else {
        setOwnerInfo({
          fio: owner.fio,
          email: owner.email,
          phone_num: owner.phone_num,
          avatar: owner.avatar
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке информации о владельце:', error);
      setOwnerInfo({
        fio: owner.fio,
        email: owner.email,
        phone_num: owner.phone_num,
        avatar: owner.avatar
      });
    }
  }, []);

  // Преобразование данных из API в формат для компонента
  const transformApiDataToHouseInfo = (apiData: ApiHouseInfo): HouseInfo => {
    return {
      id: apiData.id,
      price: apiData.price,
      area: apiData.area,
      description: apiData.description,
      houseType: apiData.houseType,
      announcementData: apiData.announcementData,
      active: apiData.active,
      photos: apiData.photos,
      // Распаковываем houseInfo в корень объекта
      region: apiData.houseInfo?.region,
      city: apiData.houseInfo?.city,
      street: apiData.houseInfo?.street,
      rooms: apiData.houseInfo?.rooms,
      bathrooms: apiData.houseInfo?.bathrooms,
      floor: apiData.houseInfo?.floor,
      owner: apiData.owner,
      convenience: apiData.convenience
    };
  };

  // Загрузка данных о доме
  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        setLoading(true);
        const API_URL = 'http://localhost:5213/api';
        
        const response = await fetch(`${API_URL}/houses/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        
        if (result.success && result.data) {
          // Преобразуем данные из API в формат для компонента
          const transformedData = transformApiDataToHouseInfo(result.data);
          setHouse(transformedData);
          
          // Загружаем отзывы
          fetchReviews();
          
          // Загружаем информацию о владельце если есть
          if (result.data.owner) {
            fetchOwnerInfo(result.data.owner);
          }
          
          // Проверяем, является ли текущий пользователь владельцем
          if (currentUserId) {
            const responseOwner = await fetch(`${API_URL}/houses/${id}/is-owner`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (responseOwner.ok) {
              const resultOwner = await responseOwner.json();
              setIsOwner(resultOwner.success && resultOwner.isOwner);
            }
          }
        } else {
          throw new Error(result.message || 'Не удалось загрузить данные о доме');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных о доме:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseData();
  }, [id, fetchReviews, fetchOwnerInfo, currentUserId]);

  // Отправка отзыва
  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      const API_URL = 'http://localhost:5213/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Для отправки отзыва необходимо авторизоваться');
        navigate('/login');
        return;
      }

      if (isOwner) {
        alert('Владелец не может оставлять отзыв на свое объявление');
        return;
      }

      // Проверяем, что текст отзыва содержит минимум 10 символов
      if (newReview.text.trim().length < 10) {
        alert('Текст отзыва должен содержать минимум 10 символов');
        return;
      }

      const response = await fetch(`${API_URL}/houses/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newReview.rating,
          text: newReview.text,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Отзыв успешно отправлен!');
          setNewReview({ rating: 5, text: "" });
          fetchReviews();
        } else {
          alert(result.message || 'Ошибка при отправке отзыва');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка сервера' }));
        alert(`Ошибка сервера: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Ответ владельца на отзыв
  const handleReplyToReview = async (reviewId: number) => {
    const replyText = prompt('Введите ваш ответ на отзыв:');
    if (!replyText || !replyText.trim()) return;

    try {
      const API_URL = 'http://localhost:5213/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Для ответа на отзыв необходимо авторизоваться');
        return;
      }

      const response = await fetch(`${API_URL}/houses/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reply: replyText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Ответ успешно отправлен!');
          fetchReviews();
        } else {
          alert(result.message || 'Ошибка при отправке ответа');
        }
      } else {
        alert('Ошибка сервера при отправке ответа');
      }
    } catch (error) {
      console.error('Ошибка при отправке ответа на отзыв:', error);
      alert('Ошибка при отправке ответа');
    }
  };

  // Функция для форматирования даты публикации
  const formatAnnouncementDate = (dateString: string) => {
    try {
      // Пытаемся разобрать дату в формате yyyy-MM-dd
      const [year, month, day] = dateString.split('-').map(Number);
      if (year && month && day) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
          });
        }
      }
      return 'Дата не указана';
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return 'Дата не указана';
    }
  };

  // Функция для форматирования даты отзыва (исправленная)
  const formatReviewDate = (dateString: string) => {
    try {
      // Проверяем разные форматы даты
      if (!dateString) return 'Дата не указана';
      
      // Если дата уже в формате ISO (содержит T)
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      }
      
      // Если дата в формате yyyy-MM-dd
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        if (year && month && day) {
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          }
        }
      }
      
      console.log('Неизвестный формат даты:', dateString);
      return 'Дата не указана';
    } catch (error) {
      console.error('Ошибка при форматировании даты отзыва:', error, 'dateString:', dateString);
      return 'Дата не указана';
    }
  };

  // Функция для получения иконки по названию особенности
  const getFeatureIcon = (feature: string): IconType => {
    const iconMap: Record<string, IconType> = {
      "Кондиционер": faSnowflake,
      "Мебель": faCheck,
      "Интернет": faWifi,
      "Охрана": faShieldAlt,
      "Видеонаблюдение": faShieldAlt,
      "Пожарная сигнализация": faShieldAlt,
      "Парковка": faCar,
      "Гараж": faCar,
      "Сад": faTree,
      "Бассейн": faSwimmingPool,
      "Сауна": faHotTub
    };
    return iconMap[feature] || faCheck;
  };

  // Функция для получения списка особенностей из convenience
  const getFeaturesList = () => {
    if (!house?.convenience) return [];
    
    const features: string[] = [];
    const conv = house.convenience;
    
    if (conv.conditioner) features.push("Кондиционер");
    if (conv.furniture) features.push("Мебель");
    if (conv.internet) features.push("Интернет");
    if (conv.security) features.push("Охрана");
    if (conv.videoSurveillance) features.push("Видеонаблюдение");
    if (conv.fireAlarm) features.push("Пожарная сигнализация");
    if (conv.parking) features.push("Парковка");
    if (conv.garage) features.push("Гараж");
    if (conv.garden) features.push("Сад");
    if (conv.swimmingPool) features.push("Бассейн");
    if (conv.sauna) features.push("Сауна");
    
    return features;
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
    
    const totalStars = 5;
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="star-icon empty-star" />);
    }
    
    return stars;
  };

  // Функция для звонка
  const handleCall = () => {
    if (ownerInfo?.phone_num) {
      window.location.href = `tel:${ownerInfo.phone_num}`;
    } else {
      alert('Телефон владельца не указан');
    }
  };

  // Функция для отправки сообщения
  const handleMessage = () => {
    alert('Функция чата будет доступна в ближайшее время');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Загрузка информации о доме...</p>
        </div>
      </>
    );
  }

  if (!house) {
    return (
      <>
        <Header />
        <div className="error-container">
          <h2>Дом не найден</h2>
          <p>К сожалению, информация о данном доме недоступна.</p>
          <button onClick={handleBack} className="btn-primary-house">
            Вернуться назад
          </button>
        </div>
      </>
    );
  }

  const features = getFeaturesList();
  const mainImage = house.photos?.[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&h=800&fit=crop";
  const images = house.photos && house.photos.length > 0 ? house.photos : [mainImage];
  const address = house.city && house.street ? `${house.city}, ${house.street}` : 'Адрес не указан';
  const info = `${house.houseType || 'Дом'}, ${house.area} м²`;
  const formattedPrice = `${house.price?.toLocaleString('ru-RU')} BYN/мес`;
  const announcementDate = formatAnnouncementDate(house.announcementData);

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
                <img src={images[activeImage]} alt={`Дом ${activeImage + 1}`} />
                <div className="image-badges-house">
                  <span className="property-badge-house available-house">
                    Аренда
                  </span>
                </div>
              </div>
              <div className="thumbnails-house">
                {images.slice(0, 5).map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-house ${index === activeImage ? 'active-house' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`Миниатюра ${index + 1}`} />
                  </div>
                ))}
                {images.length > 5 && (
                  <button className="more-photos-house">
                    +{images.length - 5} фото
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
                  <h1>{info}</h1>
                  <p className="property-address-house">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {address}
                  </p>
                  <div className="price-section-house">
                    <h2>{formattedPrice}</h2>
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
                      <span className="feature-value-house">{house.rooms || '?'}</span>
                      <span className="feature-label-house">Комнаты</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faBath} />
                    <div>
                      <span className="feature-value-house">{house.bathrooms || '?'}</span>
                      <span className="feature-label-house">Санузлы</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faBuilding} />
                    <div>
                      <span className="feature-value-house">{house.floor || '?'}</span>
                      <span className="feature-label-house">Этажность</span>
                    </div>
                  </div>
                  <div className="feature-item-house">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <div>
                      <span className="feature-value-house">
                        {announcementDate}
                      </span>
                      <span className="feature-label-house">Дата публикации</span>
                    </div>
                  </div>
                </div>

                {/* Описание */}
                <div className="description-section-house">
                  <h3>Описание дома</h3>
                  {house.description ? (
                    <p>{house.description}</p>
                  ) : (
                    <p>Описание отсутствует</p>
                  )}
                </div>

                {/* Особенности */}
                {features.length > 0 && (
                  <div className="features-section-house">
                    <h3>Особенности дома</h3>
                    <div className="features-grid-house">
                      {features.map((feature, index) => (
                        <div key={index} className="feature-item-check-house">
                          <FontAwesomeIcon icon={getFeatureIcon(feature)} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Инфраструктура */}
                {house.convenience?.transport || house.convenience?.education || house.convenience?.shops ? (
                  <div className="location-section-house">
                    <h3>Инфраструктура поблизости</h3>
                    <div className="location-info-house">
                      <div className="location-features-house">
                        {house.convenience.transport && (
                          <div className="location-item-house">
                            <FontAwesomeIcon icon={faSubway} />
                            <div>
                              <strong>Транспорт:</strong>
                              <span>{house.convenience.transport}</span>
                            </div>
                          </div>
                        )}
                        {house.convenience.education && (
                          <div className="location-item-house">
                            <FontAwesomeIcon icon={faSchool} />
                            <div>
                              <strong>Образование:</strong>
                              <span>{house.convenience.education}</span>
                            </div>
                          </div>
                        )}
                        {house.convenience.shops && (
                          <div className="location-item-house">
                            <FontAwesomeIcon icon={faStore} />
                            <div>
                              <strong>Магазины:</strong>
                              <span>{house.convenience.shops}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Отзывы */}
                <div className="reviews-section-house">
                  <h3>Отзывы о доме</h3>
                  
                  {/* Форма для добавления отзыва */}
                  {!isOwner && (
                    <div className="review-form-house">
                      <h4>Оставить отзыв</h4>
                      <div className="rating-input-house">
                        <span>Рейтинг:</span>
                        <div className="stars-input-house">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FontAwesomeIcon
                              key={star}
                              icon={faStar}
                              className={`star-input ${newReview.rating >= star ? 'active' : ''}`}
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="review-text-house">
                        <textarea
                          value={newReview.text}
                          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                          placeholder="Расскажите о вашем опыте (минимум 10 символов)..."
                          rows={4}
                        />
                        <div className="char-count">
                          {newReview.text.length}/1000 символов
                        </div>
                      </div>
                      <button 
                        className="btn-primary-house"
                        onClick={handleSubmitReview}
                        disabled={submittingReview || newReview.text.trim().length < 10}
                      >
                        {submittingReview ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Отправка...
                          </>
                        ) : (
                          'Отправить отзыв'
                        )}
                      </button>
                    </div>
                  )}

                  {/* Список отзывов */}
                  {loadingReviews ? (
                    <div className="loading-reviews">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Загрузка отзывов...</span>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="reviews-list-house">
                      {reviews.map((review) => (
                        <div key={review.id} className="review-item-house">
                          <div className="review-header-house">
                            <div className="reviewer-info-house">
                              <FontAwesomeIcon icon={faUser} />
                              <span>{review.user?.fio || 'Анонимный пользователь'}</span>
                            </div>
                            <div className="review-rating-house">
                              {renderStars(review.rating)}
                              <span className="review-date-house">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                {formatReviewDate(review.data_reviews)}
                              </span>
                            </div>
                          </div>
                          <p className="review-text-content">{review.text}</p>
                          
                          {/* Ответ владельца */}
                          {review.owner_reply && (
                            <div className="owner-reply-house">
                              <div className="owner-reply-header">
                                <FontAwesomeIcon icon={faReply} />
                                <strong>Ответ владельца:</strong>
                              </div>
                              <p className="owner-reply-text">{review.owner_reply}</p>
                            </div>
                          )}
                          
                          {/* Кнопка ответа для владельца */}
                          {isOwner && !review.owner_reply && (
                            <button 
                              className="reply-button-house"
                              onClick={() => handleReplyToReview(review.id)}
                            >
                              <FontAwesomeIcon icon={faReply} />
                              Ответить на отзыв
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-reviews-house">Пока нет отзывов. Будьте первым!</p>
                  )}
                </div>
              </div>

              {/* Боковая панель */}
              <div className="sidebar-house">
                {/* Карточка владельца */}
                <div className="contact-card-house">
                  <div className="owner-info-house">
                    <div className="owner-avatar-house">
                      {ownerInfo?.avatar ? (
                        <img src={ownerInfo.avatar} alt={ownerInfo.fio || 'Владелец'} />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="avatar-placeholder" />
                      )}
                    </div>
                    <div className="owner-details-house">
                      <h4>Владелец: {ownerInfo?.fio || house.owner?.fio || 'Не указан'}</h4>
                      <p>Владелец недвижимости</p>
                    </div>
                  </div>
                  <div className="contact-actions-house">
                    {ownerInfo?.phone_num && (
                      <button className="btn-primary-house full-width-house" onClick={handleCall}>
                        <FontAwesomeIcon icon={faPhone} />
                        Позвонить владельцу
                      </button>
                    )}
                    <button className="btn-secondary-house full-width-house" onClick={handleMessage}>
                      <FontAwesomeIcon icon={faComment} />
                      Написать сообщение
                    </button>
                  </div>
                  
                  {/* Информация о публикации */}
                  <div className="contact-meta-house">
                    <div className="meta-item-house">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{announcementDate}</span>
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