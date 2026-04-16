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
  faExclamationCircle,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import "./AgentProfile.css";

// Детали агента для чата
interface AgentDetailsData {
  id: number;
  userId: number; // UserId из таблицы Users
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

// Основные данные агента для профиля
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

// Интерфейсы для чата
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
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Функция для декодирования токена
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

  // Проверка авторизации и получение данных пользователя
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔑 Проверка авторизации, токен:', token ? 'есть' : 'нет');
      
      if (token) {
        try {
          // Пробуем декодировать токен
          const payload = decodeToken(token);
          
          if (payload) {
            console.log('📋 Payload токена:', payload);
            
            // Ищем userId в разных возможных полях
            const userId = payload.userId || payload.sub || payload.nameid || payload.unique_name;
            
            if (userId) {
              console.log('✅ Найден User ID:', userId);
              setCurrentUserId(parseInt(userId));
              localStorage.setItem('currentUserId', userId.toString());
            } else {
              console.log('❌ User ID не найден в токене');
            }
            
            // Проверяем, является ли пользователь администратором
            const roles = payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            
            if (Array.isArray(roles)) {
              setIsAdmin(roles.includes('Admin'));
              console.log('👑 Роли пользователя (массив):', roles, 'Админ:', roles.includes('Admin'));
            } else if (typeof roles === 'string') {
              setIsAdmin(roles === 'Admin');
              console.log('👑 Роль пользователя (строка):', roles, 'Админ:', roles === 'Admin');
            } else {
              console.log('👑 Роли не найдены в токене');
              setIsAdmin(false);
            }

            const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
            setCurrentUserEmail(email);
          }
        } catch (error) {
          console.error('Ошибка при декодировании токена:', error);
        }
      } else {
        console.log('❌ Токен отсутствует');
        setCurrentUserId(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUserId');
      }
    };

    checkAuth();
  }, []);

  // Проверка возможности оставить отзыв
  const canLeaveReview = (): boolean => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔐 Нет токена - нельзя оставить отзыв');
      return false;
    }
    
    // Администраторы не могут оставлять отзывы (согласно вашему бэкенду)
    if (isAdmin) {
      console.log('🚫 Пользователь - администратор, нельзя оставить отзыв');
      return false;
    }
    
    // Проверяем, что есть userId
    if (!currentUserId) {
      console.log('❌ Нет User ID - нельзя оставить отзыв');
      return false;
    }
    
    console.log('✅ Пользователь может оставить отзыв');
    return true;
  };

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

  // Функция для получения UserId агента
  const getAgentUserId = async (agentId: number): Promise<number> => {
    try {
      const API_URL = 'http://localhost:5213/api';
      const response = await fetch(`${API_URL}/agents/${agentId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result: AgentDetailsResponse = await response.json();
        if (result.success && result.data && result.data.userId) {
          console.log(`✅ Получен UserId агента ${agentId}: ${result.data.userId}`);
          return result.data.userId;
        }
      }
      // Если не удалось получить UserId, используем agentId как fallback
      console.log(`⚠️ Не удалось получить UserId агента ${agentId}, использую agentId как fallback`);
      return agentId;
    } catch (error) {
      console.error(`❌ Ошибка при получении UserId агента ${agentId}:`, error);
      return agentId;
    }
  };

  // Проверка существующего чата
  const checkExistingChat = async (agentUserId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('http://localhost:5213/api/chats/my-chats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result: ChatsResponse = await response.json();
        if (result.success && result.data) {
          const existingChat = result.data.find((chat: ChatItem) => 
            chat.user_id === agentUserId && chat.ad_id === 0
          );
          
          if (existingChat) {
            console.log('✅ Найден существующий чат с агентом:', existingChat.id);
            return existingChat.id;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Ошибка при проверке существующего чата:', error);
      return null;
    }
  };

  // Создание нового чата с агентом
  const createNewChatWithAgent = async (agentUserId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Токен авторизации не найден');
        return null;
      }

      console.log('➕ Создаем новый чат с агентом (UserId):', agentUserId);
      
      const response = await fetch('http://localhost:5213/api/chats/create-with-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: agentUserId, // Отправляем UserId агента
          initialMessage: "Здравствуйте! Мне нужна консультация по подбору жилья."
        })
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка при создании чата';
        try {
          const errorData = await response.text();
          console.error('❌ Ошибка создания чата:', errorData);
          if (errorData) {
            const parsed = JSON.parse(errorData);
            errorMessage = parsed.message || errorData;
            // Добавляем дополнительные детали из ошибки
            if (parsed.detailed) errorMessage += `\nДетали: ${parsed.detailed}`;
            if (parsed.innerException) errorMessage += `\nВнутренняя ошибка: ${parsed.innerException}`;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: ChatCreateResponse = await response.json();
      if (result.success && result.data) {
        console.log('🎉 Чат создан:', result.data);
        return result.data.chat_id;
      } else {
        throw new Error(result.message || 'Неизвестная ошибка при создании чата');
      }
    } catch (error) {
      console.error('❌ Ошибка при создании чата:', error);
      throw error;
    }
  };

  // Функция для очистки текста позиции
const cleanPositionText = (text: string): string => {
  // Удаляем "Агент по", "Агент", "по" в разных комбинациях
  const cleaned = text
    .replace(/^Агент\s+(по\s+)?/i, '') // Удаляет "Агент по " или "Агент "
    .replace(/^\s+по\s+/i, '') // Удаляет "по " в начале, если осталось
    .trim();
  
  // Если после очистки строка пустая, возвращаем значение по умолчанию
  if (!cleaned) {
    return "Специалист по недвижимости";
  }
  
  // Делаем первую букву заглавной
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

  // Основная функция для открытия/создания чата с агентом
  const handleOpenChatWithAgent = async () => {
    if (!id || !agent) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для начала чата необходимо авторизоваться');
      navigate('/login');
      return;
    }

    // Проверяем, не является ли текущий пользователь администратором
    if (isAdmin) {
      if (currentUserEmail?.toLowerCase() === 'admin@gmail.com') {
        alert('Администратор не может писать сообщения');
        return;
      }
    }

    // Проверяем, не является ли агент администратором
    if (agent.email.toLowerCase() === 'admin@gmail.com') {
      alert('Вы не можете написать администратору. Пожалуйста, свяжитесь с поддержкой через форму обратной связи.');
      return;
    }

    // Используем userId агента
    const agentUserId = agent.userId;
    
    // Проверяем, не пытается ли пользователь написать самому себе
    if (currentUserId && agentUserId === currentUserId) {
      alert('Вы не можете создать чат с самим собой');
      return;
    }
    
    setCreatingChat(true);
    
    try {
      console.log('💬 Начинаем процесс создания чата с агентом:', {
        agentId: agent.id,
        agentUserId: agentUserId,
        currentUserId: currentUserId,
        agentName: agent.fio
      });
      
      // Проверяем существующий чат (используем userId агента)
      const existingChatId = await checkExistingChat(agentUserId);
      
      if (existingChatId) {
        console.log('🚀 Переходим в существующий чат:', existingChatId);
        navigate(`/chat/${existingChatId}`);
        return;
      }

      // Создаем новый чат (используем userId агента)
      console.log('➕ Создаем новый чат с агентом (userId):', agentUserId);
      const newChatId = await createNewChatWithAgent(agentUserId);
      
      if (newChatId) {
        console.log('🚀 Переходим в новый чат:', newChatId);
        navigate(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при открытии чата:', error);
      alert(error instanceof Error ? error.message : 'Не удалось создать чат. Попробуйте позже.');
    } finally {
      setCreatingChat(false);
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
        
        // Сначала получаем основную информацию об агенте
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
        console.log('✅ Основные данные агента:', agentResult);

        if (agentResult.success && agentResult.data) {
          // Теперь получаем UserId агента из деталей
          try {
            const userId = await getAgentUserId(parseInt(id!));
            
            // Объединяем основные данные с UserId
            const agentWithUserId: AgentProfileData = {
              ...agentResult.data,
              userId: userId,
              isAgent: true,
              position: cleanPositionText(agentResult.data.position || agentResult.data.specialization || "Специалист по недвижимости")
            };
            
            console.log('✅ Агент с UserId:', agentWithUserId);
            setAgent(agentWithUserId);
            await fetchReviews();
          } catch (error) {
            console.error('❌ Ошибка при получении UserId агента:', error);
            // Используем основные данные без userId
            setAgent(agentResult.data);
            await fetchReviews();
          }
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
    console.log('🔄 handleSubmitReview called');
    console.log('📊 Current state:', {
      id, 
      currentUserId, 
      isAdmin,
      textLength: newReview.text.length,
      text: newReview.text
    });
    
    if (!id) {
      alert('Ошибка: ID агента не найден');
      return;
    }

    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для отправки отзыва необходимо авторизоваться');
      navigate('/login');
      return;
    }

    // Проверяем, что пользователь не администратор
    if (isAdmin) {
      alert('Администраторы не могут оставлять отзывы');
      return;
    }

    // Проверяем, что есть userId
    if (!currentUserId) {
      alert('Ошибка: не удалось определить пользователя. Пожалуйста, войдите снова.');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    // Проверки текста отзыва
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
      
      console.log('📤 Sending review with data:', {
        rating: newReview.rating,
        text: newReview.text.trim(),
      });

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

      console.log('📥 Response status:', response.status);
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
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

  // Обработчик клика по звездам для незарегистрированных пользователей
  const handleStarClickUnauthorized = () => {
    alert('Для оценки агента необходимо авторизоваться');
    navigate('/login');
  };

  // Обработчик клика по textarea для незарегистрированных пользователей
  const handleTextareaClickUnauthorized = () => {
    alert('Для оставления отзыва необходимо авторизоваться');
    navigate('/login');
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

  // Получаем результат проверки
  const canLeaveReviewResult = canLeaveReview();
  
  console.log('🔐 canLeaveReview check:', {
    hasToken: !!localStorage.getItem('token'),
    currentUserId,
    isAdmin,
    canLeaveReview: canLeaveReviewResult
  });

  return (
    <>
      <Header />
      
      <div className="agent-profile-page">
        <div className="agent-profile-header">
          <button className="back-button-agent" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} />
            Назад к агентам
          </button>
        </div>

        <div className="container-agent">
          <div className="agent-profile-layout">
            {/* Левая колонка - информация об агенте */}
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
                      onClick={handleOpenChatWithAgent}
                      disabled={creatingChat}
                    >
                      {creatingChat ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          Открытие чата...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faComment} />
                          Написать в чат
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Статистика */}
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

              <div className="tab-content">
                {activeTab === 'about' && (
                  <div className="about-section">
                    <h2>Обо мне</h2>
                    <p className="agent-description">{agent.description}</p>
                    
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
                    
                    {/* ФОРМА ОТЗЫВА */}
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
                                onClick={canLeaveReviewResult ? 
                                  () => setNewReview({ ...newReview, rating: star }) : 
                                  handleStarClickUnauthorized}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="review-text-input">
                          <textarea
                            value={newReview.text}
                            onChange={canLeaveReviewResult ? 
                              (e) => setNewReview({ ...newReview, text: e.target.value }) : 
                              undefined}
                            onClick={!canLeaveReviewResult ? handleTextareaClickUnauthorized : undefined}
                            placeholder={canLeaveReviewResult ? 
                              "Расскажите о вашем опыте работы с агентом (минимум 10 символов)..." :
                              "Для оставления отзыва необходимо авторизоваться"}
                            rows={4}
                            maxLength={2000}
                            readOnly={!canLeaveReviewResult}
                          />
                          <div className="char-count">
                            {newReview.text.length}/2000 символов
                            {newReview.text.length < 10 && (
                              <span className="char-warning"> (минимум 10 символов)</span>
                            )}
                          </div>
                        </div>
                        {canLeaveReviewResult ? (
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
                        ) : (
                          <button 
                            className="btn-primary-agent"
                            onClick={() => navigate('/login')}
                          >
                            {isAdmin ? 'Администраторы не могут оставлять отзывы' : 'Войти для отправки отзыва'}
                          </button>
                        )}
                        
                      </div>
                    </div>
                    
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