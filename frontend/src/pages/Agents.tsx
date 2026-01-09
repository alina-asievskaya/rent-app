import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import AgentCard from "../components/AgentCard";
import type { Agent } from "../components/AgentCard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faSlidersH,
  faSortAmountDown,
  faChevronDown,
  faTimes,
  faStar,
  faHome,
  faClock,
  faExclamationTriangle,
  faSyncAlt,

} from '@fortawesome/free-solid-svg-icons';
import "./Agents.css";
import { useNavigate } from "react-router-dom";

// Типы для API ответов
interface AgentApiResponse {
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
  userId?: number; // Добавляем поле userId
}

interface ApiResponse {
  success: boolean;
  data: {
    agents: AgentApiResponse[];
    totalCount: number;
    filters: {
      specialties: string[];
    };
  };
  message?: string;
  error?: string;
  detailed?: string;
}

interface ApiErrorDetails {
  message?: string;
  error?: string;
  detailed?: string;
  stackTrace?: string;
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

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiDetails, setApiDetails] = useState<ApiErrorDetails | null>(null);
  const [creatingChatForAgent, setCreatingChatForAgent] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Фильтры
  const [filters, setFilters] = useState({
    specialty: '',
    experience: '',
    rating: ''
  });

  // Данные для фильтров
  const [specialties, setSpecialties] = useState(["Все", "Загородные дома", "Коттеджи", "Усадьбы", "Дома с участком", "Эко-дома", "Дома у озера"]);
  const experienceOptions = ["Любой", "1-3 года", "3-5 лет", "5-10 лет", "10+ лет"];
  const ratingOptions = ["Любой", "4.0+", "4.5+", "4.8+"];

  const sortOptions = [
    { id: 'rating-desc', label: 'По рейтингу' },
    { id: 'experience-desc', label: 'По опыту' },
    { id: 'reviews-desc', label: 'По отзывам' },
    { id: 'name-asc', label: 'По имени (А-Я)' }
  ];

  // Декодирование токена
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

  // Проверка авторизации
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
        const result = await response.json();
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

  // Основная функция для открытия/создания чата с агентом
  const handleOpenChatWithAgent = async (agentId: number, agentUserId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для начала чата необходимо авторизоваться');
      navigate('/login');
      return;
    }

    // Проверяем, не является ли текущий пользователь администратором
    if (isAdmin) {
      if (currentUserEmail?.toLowerCase() === 'admin@gmail.com') {
        alert('Администратор может писать только в ответ на сообщения пользователей');
        return;
      }
    }

    // Находим агента для проверки его email
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      alert('Агент не найден');
      return;
    }

    // Проверяем, не является ли агент администратором
    if (agent.contact.email.toLowerCase() === 'admin@gmail.com') {
      alert('Вы не можете написать администратору. Пожалуйста, свяжитесь с поддержкой через форму обратной связи.');
      return;
    }

    setCreatingChatForAgent(agentId);
    
    try {
      console.log('💬 Начинаем процесс создания чата с агентом:', {
        agentId: agentId,
        agentUserId: agentUserId,
        currentUserId: currentUserId,
        agentName: agent.name
      });

      // Проверяем, не пытается ли пользователь написать самому себе
      if (currentUserId && agentUserId === currentUserId) {
        alert('Вы не можете создать чат с самим собой');
        return;
      }
      
      // Проверяем существующий чат
      const existingChatId = await checkExistingChat(agentUserId);
      
      if (existingChatId) {
        console.log('🚀 Переходим в существующий чат:', existingChatId);
        navigate(`/chat/${existingChatId}`);
        return;
      }

      // Создаем новый чат
      console.log('➕ Создаем новый чат с агентом (UserId):', agentUserId);
      const newChatId = await createNewChatWithAgent(agentUserId);
      
      if (newChatId) {
        console.log('🚀 Переходим в новый чат:', newChatId);
        navigate(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при открытии чата:', error);
      alert(error instanceof Error ? error.message : 'Не удалось создать чат. Попробуйте позже.');
    } finally {
      setCreatingChatForAgent(null);
    }
  };

  // Загрузка данных агентов из API
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      setApiDetails(null);
      
      // Формируем параметры запроса
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.specialty && filters.specialty !== "Все") params.append('specialty', filters.specialty);
      if (filters.experience && filters.experience !== "Любой") params.append('experience', filters.experience);
      if (filters.rating && filters.rating !== "Любой") params.append('rating', filters.rating);
      params.append('sortBy', sortBy);
      
      console.log('🔄 Загружаю агентов с параметрами:', params.toString());
      
      const API_URL = 'http://localhost:5213/api';
      const url = `${API_URL}/agents/catalog?${params.toString()}`;
      console.log('📡 URL запроса:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('📊 Статус ответа:', response.status, response.statusText);
      
      // Пробуем получить текст ответа для отладки
      const responseText = await response.text();
      console.log('📝 Текст ответа (первые 1000 символов):', responseText.substring(0, 1000));
      
      if (!response.ok) {
        // Пытаемся парсить как JSON для деталей ошибки
        let errorData: ApiErrorDetails | null = null;
        try {
          errorData = JSON.parse(responseText) as ApiErrorDetails;
          console.error('❌ Ошибка API:', errorData);
          setApiDetails(errorData);
          throw new Error(`API ошибка: ${errorData.message || response.statusText}`);
        } catch {
          // Если не JSON, используем текст
          throw new Error(`HTTP ${response.status}: ${response.statusText}\nОтвет: ${responseText.substring(0, 200)}`);
        }
      }

      // Парсим JSON
      const result: ApiResponse = JSON.parse(responseText);
      console.log('✅ Данные агентов получены. Успех:', result.success);
      console.log('📊 Структура данных:', {
        hasData: !!result.data,
        agentsCount: result.data?.agents?.length || 0,
        totalCount: result.data?.totalCount || 0,
        filters: result.data?.filters || {}
      });
      
      if (result.success && result.data && Array.isArray(result.data.agents)) {
        // Получаем UserId для каждого агента
        const agentsWithUserId = await Promise.all(
          result.data.agents.map(async (agent: AgentApiResponse) => {
            try {
              const userId = await getAgentUserId(agent.id);
              return {
                ...agent,
                userId: userId
              };
            } catch (error) {
              console.error(`Ошибка при получении UserId для агента ${agent.id}:`, error);
              return {
                ...agent,
                userId: agent.id // Fallback
              };
            }
          })
        );
        
        // Преобразуем данные из API в формат Agent
        const transformedAgents: Agent[] = agentsWithUserId.map((agent: AgentApiResponse & { userId: number }) => ({
          id: agent.id,
          userId: agent.userId, // Сохраняем UserId
          name: agent.fio || "Неизвестный агент",
          position: agent.position || `${agent.specialization || "недвижимости"}`,
          avatar: agent.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
          rating: agent.rating || 0,
          reviewsCount: agent.reviewsCount || 0,
          experience: agent.experience || 0,
          propertiesManaged: agent.propertiesManaged || 0,
          description: agent.description || `Специализируюсь на ${agent.specialization || "недвижимости"}. Опыт работы ${agent.experience || 0} лет.`,
          satisfactionRate: agent.satisfactionRate || 90,
          contact: {
            phone: agent.phone || "+375 (29) 000-00-00",
            email: agent.email || "agent@example.com"
          },
          specialties: agent.specialties || [agent.specialization || "Недвижимость"],
          stats: {
            avgResponseTime: "15 мин",
            dealSuccessRate: 95,
            avgDaysToRent: 7
          }
        }));
        
        console.log(`✅ Успешно преобразовано ${transformedAgents.length} агентов`);
        console.log('📋 Агенты с UserId:', transformedAgents.map(a => ({ id: a.id, userId: a.userId, name: a.name, email: a.contact.email })));
        setAgents(transformedAgents);
        
        // Обновляем список специализаций из API если они есть
        if (result.data.filters?.specialties && Array.isArray(result.data.filters.specialties)) {
          const apiSpecialties = result.data.filters.specialties;
          console.log('📋 Специализации из API:', apiSpecialties);
          if (apiSpecialties.length > 0) {
            setSpecialties(["Все", ...apiSpecialties]);
          }
        }
      } else {
        console.error('❌ API вернул неожиданную структуру:', result);
        throw new Error(result.message || 'Не удалось загрузить данные. Неверная структура ответа.');
      }
    } catch (error) {
      console.error('❌ Полная ошибка при загрузке агентов:', error);
      
      let errorMessage = 'Не удалось загрузить данные агентов';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Ошибка сети. Проверьте:\n' +
                       '1. Бекенд запущен на localhost:5213\n' +
                       '2. Проверьте консоль бекенда на ошибки\n' +
                       '3. Попробуйте открыть http://localhost:5213/api/agents/catalog в браузере';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // Очищаем список агентов при ошибке
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortBy]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Фильтрация + поиск + сортировка через useMemo
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Поиск
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(agent =>
        agent.name.toLowerCase().includes(q) ||
        agent.position.toLowerCase().includes(q) ||
        agent.specialties.some(spec => spec.toLowerCase().includes(q))
      );
    }

    // Фильтр по специализации
    if (filters.specialty && filters.specialty !== "Все") {
      result = result.filter(agent => agent.specialties.includes(filters.specialty));
    }

    // Фильтр по опыту
    if (filters.experience && filters.experience !== "Любой") {
      const expRanges = {
        "1-3 года": { min: 1, max: 3 },
        "3-5 лет": { min: 3, max: 5 },
        "5-10 лет": { min: 5, max: 10 },
        "10+ лет": { min: 10, max: Infinity }
      };
      
      const range = expRanges[filters.experience as keyof typeof expRanges];
      if (range) {
        result = result.filter(agent => 
          agent.experience >= range.min && agent.experience <= range.max
        );
      }
    }

    // Фильтр по рейтингу
    if (filters.rating && filters.rating !== "Любой") {
      const minRating = parseFloat(filters.rating);
      if (!isNaN(minRating)) {
        result = result.filter(agent => agent.rating >= minRating);
      }
    }

    // Сортировка
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return b.rating - a.rating;
        case "experience-desc":
          return b.experience - a.experience;
        case "reviews-desc":
          return b.reviewsCount - a.reviewsCount;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [agents, searchQuery, filters, sortBy]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      specialty: '',
      experience: '',
      rating: ''
    });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="agents-loading-agent">
          <div className="spinner-agent"></div>
          <p>Загрузка агентов...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="agents-page-agent">
        <section className="agents-hero-agent">
          <div className="container">
            <div className="agents-hero-content-agent">
              <h1>Наши профессиональные агенты по домам</h1>
              <p>
                Наши специалисты готовы помочь вам с арендой домов в Беларуси
              </p>

              {/* Показать ошибку если есть */}
              {apiError && (
                <div className="api-error-message" style={{
                  backgroundColor: '#ffe6e6',
                  color: '#cc0000',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1.5rem',
                  fontSize: '0.9rem',
                  border: '1px solid #ff9999'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <strong>Ошибка загрузки данных:</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>
                    {apiError}
                  </div>
                  
                  {apiDetails && (
                    <div style={{
                      backgroundColor: '#fff3cd',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      fontSize: '0.8rem'
                    }}>
                      <strong>Детали ошибки:</strong>
                      <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(apiDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                      onClick={fetchAgents}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} />
                      Повторить загрузку
                    </button>
                    <button 
                      onClick={() => {
                        window.open('http://localhost:5213/api/agents/catalog', '_blank');
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Проверить API
                    </button>
                  </div>
                </div>
              )}

              <div className="agents-search-agent">
                <div className="search-box-agent">
                  <FontAwesomeIcon icon={faSearch} className="search-icon-agent" />
                  <input
                    type="text"
                    placeholder="Поиск агента по имени или специализации..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="agents-content-agent">
            {/* Фильтры */}
            <aside className={`agents-filters-agent ${showFilters ? "show" : ""}`}>
              <div className="filters-header-agent">
                <h3><FontAwesomeIcon icon={faFilter}/> Фильтры</h3>
                <button className="close-filters-agent" onClick={() => setShowFilters(false)}>
                  <FontAwesomeIcon icon={faTimes}/>
                </button>
              </div>

              {/* Специализация */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faHome}/> Тип домов
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange("specialty", e.target.value)}
                >
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Опыт */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faClock}/> Опыт
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange("experience", e.target.value)}
                >
                  {experienceOptions.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Рейтинг */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faStar}/> Рейтинг
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                >
                  {ratingOptions.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>

              <div className="filter-actions-agent">
                <button className="btn-secondary filter-reset-agent" onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              </div>
            </aside>

            {/* Основной контент */}
            <main className="agents-main-agent">
              <div className="agents-controls-agent">
                <div className="controls-left-agent">
                  <button
                    className="toggle-filters-btn-agent"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FontAwesomeIcon icon={faSlidersH}/> Фильтры
                  </button>

                  <div className="sort-control-agent">
                    <FontAwesomeIcon icon={faSortAmountDown}/>
                    <select
                      className="sort-select-agent"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className="sort-arrow-agent"/>
                  </div>
                </div>

                <div className="controls-right-agent">
                  <div className="view-toggle-agent">
                    <button
                      className={`view-btn-agent ${viewMode === "grid" ? "active" : ""}`}
                      onClick={() => setViewMode("grid")}
                    >
                      ▦
                    </button>
                    <button
                      className={`view-btn-agent ${viewMode === "list" ? "active" : ""}`}
                      onClick={() => setViewMode("list")}
                    >
                      ☰
                    </button>
                  </div>

                  <div className="results-count-agent">
                    Найдено: <strong>{filteredAgents.length}</strong> агентов
                  </div>
                </div>
              </div>

              {/* Список агентов */}
              {filteredAgents.length === 0 ? (
                <div className="no-results-agent">
                  <FontAwesomeIcon icon={faSearch} size="3x"/>
                  <h3>{apiError ? "Не удалось загрузить данные" : "Агенты не найдены"}</h3>
                  <p>
                    {apiError 
                      ? "Проверьте подключение к серверу и попробуйте позже" 
                      : "Попробуйте изменить параметры поиска"}
                  </p>
                  <button className="btn-primary" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                  {apiError && (
                    <button 
                      className="btn-secondary" 
                      onClick={fetchAgents}
                      style={{ marginTop: '10px' }}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
                      Повторить попытку
                    </button>
                  )}
                </div>
              ) : (
                <div className={`agents-container-agent ${viewMode === "list" ? "list-view-agent" : "grid-view-agent"}`}>
                  {filteredAgents.map(agent => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      viewMode={viewMode}
                      onChatClick={(agentId, e) => handleOpenChatWithAgent(agentId, agent.userId, e)}
                      isCreatingChat={creatingChatForAgent === agent.id}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Agents;