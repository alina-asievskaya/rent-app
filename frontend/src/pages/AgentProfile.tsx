import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faComments,
  faCalendarAlt,
  faPhone,
  faEnvelope,
  faCheck,
  faChevronLeft,
  faSpinner,
  faUser,
  faChartLine,
  faShieldAlt,
  faClock,
  faGraduationCap,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import "./AgentProfile.css";

interface AgentProfileData {
  id: number;
  fio: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  photo: string;
  reviewsCount: number;
  propertiesManaged: number;
  specialties: string[];
  description: string;
  position: string;
  satisfactionRate: number;
}

interface AgentReview {
  id: number;
  userId: number;
  userName: string;
  agentId: number;
  rating: number;
  text: string;
  dataReviews: string;
  formattedDate: string;
}

interface ApiResponse {
  success: boolean;
  data: AgentProfileData;
  message?: string;
}

interface ReviewsResponse {
  success: boolean;
  data: AgentReview[];
  message?: string;
}

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Проверка авторизации
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

  // Загрузка отзывов
  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      setLoadingReviews(true);
      const API_URL = 'http://localhost:5213/api';
      
      const response = await fetch(`${API_URL}/agents/${id}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result: ReviewsResponse = await response.json();
        if (result.success && result.data) {
          setReviews(result.data);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Загрузка данных агента
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = 'http://localhost:5213/api';
        
        console.log(`📡 Загружаю данные агента с ID: ${id}`);
        
        // Загружаем основную информацию об агенте
        const agentResponse = await fetch(`${API_URL}/agents/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!agentResponse.ok) {
          throw new Error(`HTTP error! status: ${agentResponse.status}`);
        }

        const agentResult: ApiResponse = await agentResponse.json();
        console.log('✅ Данные агента:', agentResult);

        if (agentResult.success && agentResult.data) {
          setAgent(agentResult.data);
          await fetchReviews();
        } else {
          throw new Error(agentResult.message || 'Не удалось загрузить данные агента');
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке данных агента:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgentData();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleContactClick = (type: 'phone' | 'email') => {
    if (!agent) return;
    
    if (type === 'phone') {
      window.location.href = `tel:${agent.phone}`;
    } else {
      window.location.href = `mailto:${agent.email}`;
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon 
        key={i}
        icon={faStar}
        className={`star ${i < rating ? 'filled' : 'empty'}`}
      />
    ));
  };

  const handleSubmitReview = async () => {
    if (!id || !currentUserId) {
      alert('Для отправки отзыва необходимо авторизоваться');
      navigate('/login');
      return;
    }

    // Проверки
    if (newReview.text.trim().length < 10) {
      alert('Текст отзыва должен содержать минимум 10 символов');
      return;
    }

    if (newReview.text.length > 2000) {
      alert('Текст отзыва не должен превышать 2000 символов');
      return;
    }

    try {
      setSubmittingReview(true);
      const API_URL = 'http://localhost:5213/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Для отправки отзыва необходимо авторизоваться');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/agents/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newReview.rating,
          text: newReview.text.trim(),
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Отзыв успешно добавлен!');
        setNewReview({ rating: 5, text: "" });
        
        // Перезагружаем данные агента и отзывы
        const agentResponse = await fetch(`${API_URL}/agents/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (agentResponse.ok) {
          const agentResult: ApiResponse = await agentResponse.json();
          if (agentResult.success && agentResult.data) {
            setAgent(agentResult.data);
          }
        }
        
        await fetchReviews();
      } else {
        alert(result.message || 'Ошибка при добавлении отзыва');
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="agent-profile-loading">
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          </div>
          <p>Загрузка профиля агента...</p>
        </div>
      </>
    );
  }

  if (error || !agent) {
    return (
      <>
        <Header />
        <div className="agent-profile-error">
          <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
          <h2>Агент не найден</h2>
          <p>К сожалению, профиль данного агента недоступен.</p>
          <button onClick={handleBack} className="btn-primary-agent">
            Вернуться к списку агентов
          </button>
        </div>
      </>
    );
  }

  // Форматирование данных
  const formatExperience = (years: number) => {
    if (years === 1) return '1 год';
    if (years >= 2 && years <= 4) return `${years} года`;
    return `${years} лет`;
  };

  const formatReviews = (count: number) => {
    if (count === 1) return 'отзыв';
    if (count >= 2 && count <= 4) return 'отзыва';
    return 'отзывов';
  };

  // Проверяем, оставлял ли текущий пользователь отзыв
  const hasUserReviewed = currentUserId ? 
    reviews.some(review => review.userId === currentUserId) : false;

  return (
    <>
      <Header />
      
      <div className="agent-profile-page">
        {/* Кнопка назад */}
        <div className="agent-profile-header">
          <button className="back-button-agent" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} />
            Назад к агентам
          </button>
        </div>

        {/* Основной контент */}
        <div className="container-agent">
          <div className="agent-profile-layout">
            {/* Левая колонка - информация об агенте */}
            <div className="agent-profile-sidebar">
              {/* Карточка агента */}
              <div className="agent-profile-card">
                <div className="agent-avatar-container">
                  <img 
                    src={agent.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.fio)}&background=2962ff&color=fff&size=200`} 
                    alt={agent.fio}
                    className="agent-avatar"
                  />
                  {agent.rating >= 4.5 && (
                    <span className="agent-badge">Топ агент</span>
                  )}
                </div>

                <div className="agent-basic-info">
                  <h1 className="agent-name">{agent.fio}</h1>
                  <p className="agent-position">{agent.position}</p>
                  
                  <div className="agent-rating-section">
                    <div className="agent-rating">
                      <div className="stars-container">
                        {renderStars(Math.floor(agent.rating))}
                        <span className="rating-value">{agent.rating.toFixed(1)}</span>
                      </div>
                      <div className="rating-details">
                        <span className="reviews-count">
                          <FontAwesomeIcon icon={faComments} />
                          {agent.reviewsCount} {formatReviews(agent.reviewsCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="agent-contact-info">
                  <h3>Контакты</h3>
                  <div className="contact-items">
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{agent.phone}</span>
                    </div>
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{agent.email}</span>
                    </div>
                  </div>

                  <div className="contact-buttons">
                    <button 
                      className="btn-primary-agent"
                      onClick={() => handleContactClick('phone')}
                    >
                      <FontAwesomeIcon icon={faPhone} />
                      Позвонить
                    </button>
                    <button 
                      className="btn-secondary-agent"
                      onClick={() => handleContactClick('email')}
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                      Написать
                    </button>
                  </div>
                </div>

                {/* Статистика - ТОЛЬКО ОПЫТ */}
                <div className="agent-stats">
                  <h3>Статистика</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{formatExperience(agent.experience)}</div>
                        <div className="stat-label">опыт работы</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{agent.reviewsCount}</div>
                        <div className="stat-label">отзывов</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - детальная информация */}
            <div className="agent-profile-content">
              {/* Вкладки */}
              <div className="agent-tabs">
                <button 
                  className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  Об агенте
                </button>
                <button 
                  className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Отзывы ({agent.reviewsCount})
                </button>
              </div>

              {/* Контент вкладок */}
              <div className="tab-content">
                {activeTab === 'about' && (
                  <div className="about-section">
                    <h2>Обо мне</h2>
                    <p className="agent-description">{agent.description}</p>
                    
                    {/* Специализации */}
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="specialties-section">
                        <h3>Специализация</h3>
                        <div className="specialties-grid">
                          {agent.specialties.map((specialty, index) => (
                            <div key={index} className="specialty-item">
                              <FontAwesomeIcon icon={faCheck} />
                              <span>{specialty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Преимущества */}
                    <div className="advantages-section">
                      <h3>Мои преимущества</h3>
                      <div className="advantages-grid">
                        <div className="advantage-item">
                          <div className="advantage-icon">
                            <FontAwesomeIcon icon={faShieldAlt} />
                          </div>
                          <div className="advantage-content">
                            <h4>Надежность</h4>
                            <p>Гарантирую юридическую чистоту сделок</p>
                          </div>
                        </div>
                        
                        <div className="advantage-item">
                          <div className="advantage-icon">
                            <FontAwesomeIcon icon={faClock} />
                          </div>
                          <div className="advantage-content">
                            <h4>Оперативность</h4>
                            <p>Быстрый подбор вариантов и решение вопросов</p>
                          </div>
                        </div>
                        
                        <div className="advantage-item">
                          <div className="advantage-icon">
                            <FontAwesomeIcon icon={faGraduationCap} />
                          </div>
                          <div className="advantage-content">
                            <h4>Экспертиза</h4>
                            <p>Более {formatExperience(agent.experience)} на рынке недвижимости</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="reviews-section">
                    <h2>Отзывы клиентов</h2>
                    
                    {/* Форма добавления отзыва */}
                    {currentUserId && !hasUserReviewed && (
                      <div className="review-form-section">
                        <h3>Оставить отзыв</h3>
                        <div className="review-form">
                          <div className="rating-input">
                            <span>Ваша оценка:</span>
                            <div className="stars-input">
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
                          <div className="review-text-input">
                            <textarea
                              value={newReview.text}
                              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                              placeholder="Расскажите о вашем опыте работы с агентом (минимум 10 символов)..."
                              rows={4}
                              maxLength={2000}
                            />
                            <div className="char-count">
                              {newReview.text.length}/2000 символов
                              {newReview.text.length < 10 && (
                                <span className="char-warning"> (минимум 10 символов)</span>
                              )}
                            </div>
                          </div>
                          <button 
                            className="btn-primary-agent"
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
                      </div>
                    )}
                    
                    {/* Список отзывов */}
                    {loadingReviews ? (
                      <div className="loading-reviews">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>Загрузка отзывов...</span>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="reviews-list">
                        {reviews.map((review) => (
                          <div key={review.id} className="review-item">
                            <div className="review-header">
                              <div className="reviewer-info">
                                <div className="reviewer-avatar">
                                  <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div className="reviewer-details">
                                  <h4>{review.userName}</h4>
                                  <div className="review-rating">
                                    {renderStars(review.rating)}
                                    <span className="review-rating-value">{review.rating}.0</span>
                                  </div>
                                </div>
                              </div>
                              <div className="review-date">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                {review.formattedDate}
                              </div>
                            </div>
                            <p className="review-text">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-reviews">
                        <FontAwesomeIcon icon={faComments} size="3x" />
                        <h3>Пока нет отзывов</h3>
                        <p>Будьте первым, кто оставит отзыв об этом агенте</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentProfile;