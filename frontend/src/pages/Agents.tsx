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
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import "./Agents.css";

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

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiDetails, setApiDetails] = useState<ApiErrorDetails | null>(null);

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
        // Преобразуем данные из API в формат Agent
        const transformedAgents: Agent[] = result.data.agents.map((agent: AgentApiResponse) => ({
          id: agent.id || 0,
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
                    <AgentCard key={agent.id} agent={agent} viewMode={viewMode}/>
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