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
  faExclamationCircle,
  faComment,
  faChevronRight,
  faChevronLeft as faChevronLeftSolid,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import "./AgentProfile.css";

interface AgentDetailsData {
  id: number;
  userId: number;
  fio: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  photo: string;
  reviewsCount: number;
  isAgent: boolean;
}

interface AgentProfileData {
  id: number;
  userId: number;
  fio: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  photo: string;
  reviewsCount: number;
  specialties: string[];
  description: string;
  position: string;
  isAgent?: boolean;
  displayName: string;
  portfolioPhotos: string[];
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

interface AgentDetailsResponse {
  success: boolean;
  data: AgentDetailsData;
  message?: string;
}

interface ReviewsResponse {
  success: boolean;
  data: AgentReview[];
  message?: string;
}

interface ChatItem {
  id: number;
  user_id: number;
  ad_id: number;
  user_name: string;
  user_avatar: string;
  ad_title: string;
  ad_address: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  created_at: string;
  house_price: number;
  house_photo: string;
}

interface ChatsResponse {
  success: boolean;
  data: ChatItem[];
  total: number;
  message?: string;
}

interface ChatCreateResponse {
  success: boolean;
  data: {
    chat_id: number;
    is_new: boolean;
    welcome_message_id?: number;
  };
  message?: string;
}

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Состояния для карусели (прокрутка по одному фото)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [totalItems, setTotalItems] = useState(0);

  // Адаптив: на узких экранах показываем 2 фото
  useEffect(() => {
    const updateItemsPerPage = () => {
      const newItemsPerPage = window.innerWidth < 650 ? 2 : 3;
      setItemsPerPage(newItemsPerPage);
      // Корректируем индекс при изменении количества видимых элементов
      setCurrentIndex(prev => Math.min(prev, totalItems - newItemsPerPage));
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, [totalItems]);

  // Сбрасываем индекс при изменении списка фото
  useEffect(() => {
    setTotalItems(portfolioPhotos.length);
    setCurrentIndex(0);
  }, [portfolioPhotos]);

  const nextSlide = () => {
    if (currentIndex < totalItems - itemsPerPage) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = decodeToken(token);
          if (payload) {
            const userId = payload.userId || payload.sub || payload.nameid || payload.unique_name;
            if (userId) {
              setCurrentUserId(parseInt(userId));
              localStorage.setItem('currentUserId', userId.toString());
            }
            const roles = payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (Array.isArray(roles)) {
              setIsAdmin(roles.includes('Admin'));
            } else if (typeof roles === 'string') {
              setIsAdmin(roles === 'Admin');
            } else {
              setIsAdmin(false);
            }
            const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
            setCurrentUserEmail(email);
          }
        } catch (error) {
          console.error('Ошибка при декодировании токена:', error);
        }
      } else {
        setCurrentUserId(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUserId');
      }
    };
    checkAuth();
  }, []);

  const canLeaveReview = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (isAdmin) return false;
    if (!currentUserId) return false;
    return true;
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const response = await fetch(`http://localhost:5213/api/agents/${id}/reviews`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result: ReviewsResponse = await response.json();
        if (result.success && result.data) setReviews(result.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getAgentUserId = async (agentId: number): Promise<number> => {
    try {
      const response = await fetch(`http://localhost:5213/api/agents/${agentId}/details`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const result: AgentDetailsResponse = await response.json();
        if (result.success && result.data && result.data.userId) return result.data.userId;
      }
      return agentId;
    } catch (error) {
      console.error(`Ошибка при получении UserId агента ${agentId}:`, error);
      return agentId;
    }
  };

  const checkExistingChat = async (agentUserId: number): Promise<number | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const response = await fetch('http://localhost:5213/api/chats/my-chats', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const result: ChatsResponse = await response.json();
        if (result.success && result.data) {
          const existingChat = result.data.find(chat => chat.user_id === agentUserId && chat.ad_id === 0);
          if (existingChat) return existingChat.id;
        }
      }
      return null;
    } catch (error) {
      console.error('Ошибка при проверке существующего чата:', error);
      return null;
    }
  };

  const createNewChatWithAgent = async (agentUserId: number): Promise<number | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Токен авторизации не найден');
      return null;
    }
    try {
      const response = await fetch('http://localhost:5213/api/chats/create-with-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ agentId: agentUserId, initialMessage: "Здравствуйте! Мне нужна консультация по подбору жилья." })
      });
      if (!response.ok) throw new Error('Ошибка при создании чата');
      const result: ChatCreateResponse = await response.json();
      if (result.success && result.data) return result.data.chat_id;
      throw new Error(result.message || 'Неизвестная ошибка');
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      throw error;
    }
  };

  const cleanPositionText = (text: string): string => {
    const cleaned = text.replace(/^Агент\s+(по\s+)?/i, '').replace(/^\s+по\s+/i, '').trim();
    return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Специалист по недвижимости";
  };

  const handleOpenChatWithAgent = async () => {
    if (!id || !agent) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для начала чата необходимо авторизоваться');
      navigate('/login');
      return;
    }
    if (isAdmin && currentUserEmail?.toLowerCase() === 'admin@gmail.com') {
      alert('Администратор не может писать сообщения');
      return;
    }
    if (agent.email.toLowerCase() === 'admin@gmail.com') {
      alert('Вы не можете написать администратору. Пожалуйста, свяжитесь с поддержкой.');
      return;
    }
    const agentUserId = agent.userId;
    if (currentUserId && agentUserId === currentUserId) {
      alert('Вы не можете создать чат с самим собой');
      return;
    }
    setCreatingChat(true);
    try {
      const existingChatId = await checkExistingChat(agentUserId);
      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
        return;
      }
      const newChatId = await createNewChatWithAgent(agentUserId);
      if (newChatId) navigate(`/chat/${newChatId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось создать чат. Попробуйте позже.');
    } finally {
      setCreatingChat(false);
    }
  };

  const nextPhoto = () => {
    if (portfolioPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % portfolioPhotos.length);
  };

  const prevPhoto = () => {
    if (portfolioPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + portfolioPhotos.length) % portfolioPhotos.length);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxIndex, portfolioPhotos.length]);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5213/api/agents/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result: ApiResponse = await response.json();
        if (result.success && result.data) {
          const userId = await getAgentUserId(parseInt(id!));
          const agentWithUserId: AgentProfileData = {
            ...result.data,
            userId: userId,
            isAgent: true,
            position: cleanPositionText(result.data.position || result.data.specialization || "Специалист по недвижимости"),
            displayName: result.data.displayName || "",
            portfolioPhotos: result.data.portfolioPhotos || []
          };
          setAgent(agentWithUserId);
          setPortfolioPhotos(agentWithUserId.portfolioPhotos);
          await fetchReviews();
        } else {
          throw new Error(result.message || 'Не удалось загрузить данные агента');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных агента:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAgentData();
  }, [id]);

  const handleBack = () => navigate(-1);
  const handleContactClick = (type: 'phone' | 'email') => {
    if (!agent) return;
    if (type === 'phone') window.location.href = `tel:${agent.phone}`;
    else window.location.href = `mailto:${agent.email}`;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon key={i} icon={faStar} className={`star ${i < rating ? 'filled' : 'empty'}`} />
    ));
  };

  const handleSubmitReview = async () => {
    if (!id) {
      alert('Ошибка: ID организатора не найден');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для отправки отзыва необходимо авторизоваться');
      navigate('/login');
      return;
    }
    if (isAdmin) {
      alert('Администраторы не могут оставлять отзывы');
      return;
    }
    if (!currentUserId) {
      alert('Ошибка: не удалось определить пользователя. Пожалуйста, войдите снова.');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
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
      const response = await fetch(`http://localhost:5213/api/agents/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating: newReview.rating, text: newReview.text.trim() })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert('Отзыв успешно добавлен!');
        setNewReview({ rating: 5, text: "" });
        const agentResponse = await fetch(`http://localhost:5213/api/agents/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (agentResponse.ok) {
          const agentResult: ApiResponse = await agentResponse.json();
          if (agentResult.success && agentResult.data) {
            setAgent(prev => prev ? { ...agentResult.data, displayName: agentResult.data.displayName || "" } : null);
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

  const handleStarClickUnauthorized = () => {
    alert('Для оценки организатора необходимо авторизоваться');
    navigate('/login');
  };

  const handleTextareaClickUnauthorized = () => {
    alert('Для оставления отзыва необходимо авторизоваться');
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="agent-profile-loading">
          <div className="loading-spinner"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>
          <p>Загрузка профиля организатора...</p>
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
          <h2>Организатор не найден</h2>
          <p>К сожалению, профиль данного организатора недоступен.</p>
          <button onClick={handleBack} className="btn-primary-agent">Вернуться к списку организаторов</button>
        </div>
      </>
    );
  }

  const renderDescription = (text: string) => {
    if (!text) return <p>Информация отсутствует</p>;
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map((para, idx) => {
      const lines = para.split(/\n/);
      if (lines.length === 1) {
        return <p key={idx}>{para}</p>;
      }
      return (
        <p key={idx}>
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

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

  const canLeaveReviewResult = canLeaveReview();

  return (
    <>
      <Header />
      <div className="agent-profile-page">
        <div className="agent-profile-header">
          <button className="back-button-agent" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} /> Назад к организаторам
          </button>
        </div>

        <div className="container-agent">
          <div className="agent-profile-layout">
            {/* Левая колонка */}
            <div className="agent-profile-sidebar">
              <div className="agent-profile-card">
                <div className="agent-avatar-container">
                  <img 
                    src={agent.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.fio)}&background=2962ff&color=fff&size=200`} 
                    alt={agent.fio}
                    className="agent-avatar"
                  />
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

                <div className="agent-contact-info">
                  <h3>Контакты</h3>
                  <div className="contact-items">
                    <div className="contact-item"><FontAwesomeIcon icon={faPhone} /><span>{agent.phone}</span></div>
                    <div className="contact-item"><FontAwesomeIcon icon={faEnvelope} /><span>{agent.email}</span></div>
                  </div>
                  <div className="contact-buttons">
                    <button className="btn-primary-agent" onClick={() => handleContactClick('phone')}>
                      <FontAwesomeIcon icon={faPhone} /> Позвонить
                    </button>
                    <button className="btn-secondary-agent" onClick={handleOpenChatWithAgent} disabled={creatingChat}>
                      {creatingChat ? <><FontAwesomeIcon icon={faSpinner} spin /> Открытие чата...</> : <><FontAwesomeIcon icon={faComment} /> Написать в чат</>}
                    </button>
                  </div>
                </div>

                <div className="agent-stats">
                  <h3>Статистика</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon"><FontAwesomeIcon icon={faCalendarAlt} /></div>
                      <div className="stat-content">
                        <div className="stat-value">{formatExperience(agent.experience)}</div>
                        <div className="stat-label">опыт работы</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon"><FontAwesomeIcon icon={faChartLine} /></div>
                      <div className="stat-content">
                        <div className="stat-value">{agent.reviewsCount}</div>
                        <div className="stat-label">отзывов</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="agent-profile-content">
              <div className="about-section">
                <h2>Обо мне</h2>
                <div className="agent-description">
                  {renderDescription(agent.displayName && agent.displayName.trim() !== "" ? agent.displayName : agent.description)}
                </div>
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
              </div>

              {/* ===== ИСПРАВЛЕННАЯ КАРУСЕЛЬ – СДВИГ НА ОДНО ФОТО ===== */}
              <div className="portfolio-section">
                <h2>Портфолио работ</h2>
                {portfolioPhotos.length === 0 ? (
                  <p className="no-portfolio">Фотографии работ пока не добавлены</p>
                ) : (
                  <>
                    <div className="portfolio-carousel-wrapper">
                      <button 
                        className="carousel-btn carousel-btn-prev" 
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                      >
                        <FontAwesomeIcon icon={faChevronLeftSolid} />
                      </button>
                      
                      <div className="portfolio-viewport">
                        <div 
                          className="portfolio-slides"
                          style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                          }}
                        >
                          {portfolioPhotos.map((url, idx) => (
                            <div 
                              key={idx} 
                              className="portfolio-item" 
                              style={{ flex: `0 0 calc(100% / ${itemsPerPage})` }}
                              onClick={() => openLightbox(idx)}
                            >
                              <div className="portfolio-img-wrapper">
                                <img src={url} alt={`Работа ${idx + 1}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        className="carousel-btn carousel-btn-next" 
                        onClick={nextSlide}
                        disabled={currentIndex >= totalItems - itemsPerPage}
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                    <div className="carousel-counter">
                      {currentIndex + 1} – {Math.min(currentIndex + itemsPerPage, totalItems)} из {totalItems}
                    </div>
                  </>
                )}
              </div>

              {/* Лайтбокс */}
              {lightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                  <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                    <button className="lightbox-close" onClick={closeLightbox}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button className="lightbox-prev" onClick={prevPhoto}>
                      <FontAwesomeIcon icon={faChevronLeftSolid} />
                    </button>
                    <div className="lightbox-image-wrapper">
                      <img src={portfolioPhotos[lightboxIndex]} alt={`Работа ${lightboxIndex + 1}`} />
                    </div>
                    <button className="lightbox-next" onClick={nextPhoto}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <div className="lightbox-counter">
                      {lightboxIndex + 1} / {portfolioPhotos.length}
                    </div>
                  </div>
                </div>
              )}

              <div className="reviews-section">
                <h2>Отзывы клиентов ({agent.reviewsCount})</h2>
                <div className="review-form-section">
                  <h3>Оставить отзыв</h3>
                  <div className="review-form">
                    <div className="rating-input">
                      <span>Ваша оценка:</span>
                      <div className="stars-input">
                        {[1,2,3,4,5].map(star => (
                          <FontAwesomeIcon
                            key={star}
                            icon={faStar}
                            className={`star-input ${newReview.rating >= star ? 'active' : ''}`}
                            onClick={canLeaveReviewResult ? () => setNewReview({ ...newReview, rating: star }) : handleStarClickUnauthorized}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="review-text-input">
                      <textarea
                        value={newReview.text}
                        onChange={canLeaveReviewResult ? (e) => setNewReview({ ...newReview, text: e.target.value }) : undefined}
                        onClick={!canLeaveReviewResult ? handleTextareaClickUnauthorized : undefined}
                        placeholder={canLeaveReviewResult ? "Расскажите о вашем опыте работы с организатором (минимум 10 символов)..." : "Для оставления отзыва необходимо авторизоваться"}
                        rows={4}
                        maxLength={2000}
                        readOnly={!canLeaveReviewResult}
                      />
                      <div className="char-count">
                        {newReview.text.length}/2000 символов
                        {newReview.text.length < 10 && <span className="char-warning"> (минимум 10 символов)</span>}
                      </div>
                    </div>
                    {canLeaveReviewResult ? (
                      <button className="btn-primary-agent" onClick={handleSubmitReview} disabled={submittingReview || newReview.text.trim().length < 10}>
                        {submittingReview ? <><FontAwesomeIcon icon={faSpinner} spin /> Отправка...</> : 'Отправить отзыв'}
                      </button>
                    ) : (
                      <button className="btn-primary-agent" onClick={() => navigate('/login')}>
                        {isAdmin ? 'Администраторы не могут оставлять отзывы' : 'Войти для отправки отзыва'}
                      </button>
                    )}
                  </div>
                </div>

                {loadingReviews ? (
                  <div className="loading-reviews"><FontAwesomeIcon icon={faSpinner} spin /><span>Загрузка отзывов...</span></div>
                ) : reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar"><FontAwesomeIcon icon={faUser} /></div>
                            <div className="reviewer-details">
                              <h4>{review.userName}</h4>
                              <div className="review-rating">
                                {renderStars(review.rating)}
                                <span className="review-rating-value">{review.rating}.0</span>
                              </div>
                            </div>
                          </div>
                          <div className="review-date"><FontAwesomeIcon icon={faCalendarAlt} />{review.formattedDate}</div>
                        </div>
                        <p className="review-text">{review.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <FontAwesomeIcon icon={faComments} size="3x" />
                    <h3>Пока нет отзывов</h3>
                    <p>Будьте первым, кто оставит отзыв об этом организаторе</p>
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