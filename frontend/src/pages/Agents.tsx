import React, { useState, useEffect, useMemo } from "react";
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
  faMapMarkerAlt,
  faHome,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import "./Agents.css";

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Фильтры
  const [filters, setFilters] = useState({
    city: '',
    specialty: '',
    experience: '',
    rating: ''
  });

  // Данные для фильтров (адаптировано для Беларуси)
  const cities = ["Все города", "Минск", "Гродно", "Брест", "Витебск", "Гомель", "Могилев"];
  const specialties = ["Все", "Загородные дома", "Коттеджи", "Усадьбы", "Дома с участком", "Эко-дома", "Дома у озера"];
  const experienceOptions = ["Любой", "1-3 года", "3-5 лет", "5-10 лет", "10+ лет"];
  const ratingOptions = ["Любой", "4.0+", "4.5+", "4.8+"];

  const sortOptions = [
    { id: 'rating-desc', label: 'По рейтингу' },
    { id: 'experience-desc', label: 'По опыту' },
    { id: 'reviews-desc', label: 'По отзывам' },
    { id: 'name-asc', label: 'По имени (А-Я)' }
  ];

  // Загрузка данных агентов (адаптировано для Беларуси)
  useEffect(() => {
    const mockAgents: Agent[] = [
      {
        id: 1,
        name: "Александр Петров",
        position: "Старший агент по загородной недвижимости",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        rating: 4.9,
        reviewsCount: 128,
        experience: 8,
        propertiesManaged: 156,
        description: "Специализируюсь на загородных домах в Минской области. Помогу найти идеальный вариант для ваших нужд.",
        location: "Минская область",
        satisfactionRate: 97,
        contact: {
          phone: "+375 (29) 123-45-67",
          email: "a.petrov@belhouse.by",
          location: "Минск, ул. Ленина, 10"
        },
        specialties: ["Загородные дома", "Коттеджи", "Дома с участком"],
        serviceAreas: ["Минская область", "Минский район"],
        stats: {
          avgResponseTime: "15 мин",
          dealSuccessRate: 98,
          avgDaysToRent: 7
        }
      },
      {
        id: 2,
        name: "Екатерина Смирнова",
        position: "Эксперт по домам у водоемов",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
        rating: 4.8,
        reviewsCount: 94,
        experience: 6,
        propertiesManaged: 112,

        description: "Специализируюсь на домах у озер и рек. Знаю все лучшие локации для отдыха на природе.",
        location: "Витебская область",
        satisfactionRate: 96,
        contact: {
          phone: "+375 (29) 987-65-43",
          email: "e.smirnova@belhouse.by",
          location: "Витебск"
        },
        specialties: ["Дома у озера", "Коттеджи", "Загородные дома"],
        serviceAreas: ["Витебская область", "Браславский район"],
        stats: {
          avgResponseTime: "25 мин",
          dealSuccessRate: 95,
          avgDaysToRent: 10
        }
      },
      {
        id: 3,
        name: "Дмитрий Иванов",
        position: "Специалист по усадьбам и коттеджам",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        rating: 4.7,
        reviewsCount: 87,
        experience: 10,
        propertiesManaged: 143,
        description: "Эксперт по старинным усадьбам и современным коттеджам. Работаю по всей Беларуси.",
        location: "Гродненская область",
        satisfactionRate: 94,
        contact: {
          phone: "+375 (29) 456-78-90",
          email: "d.ivanov@belhouse.by",
          location: "Гродно"
        },
        specialties: ["Усадьбы", "Коттеджи", "Эко-дома"],
        serviceAreas: ["Гродненская область", "Минская область"],
        stats: {
          avgResponseTime: "20 мин",
          dealSuccessRate: 92,
          avgDaysToRent: 14
        }
      },
      {
        id: 4,
        name: "Ольга Козлова",
        position: "Агент по аренде домов для отдыха",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
        rating: 4.6,
        reviewsCount: 76,
        experience: 5,
        propertiesManaged: 89,
        description: "Специализируюсь на аренде домов для отдыха и отпуска. Помогу быстро найти подходящий вариант.",
        location: "Брестская область",
        satisfactionRate: 95,
        contact: {
          phone: "+375 (29) 234-56-78",
          email: "o.kozlova@belhouse.by",
          location: "Брест"
        },
        specialties: ["Загородные дома", "Коттеджи", "Дома у озера"],
        serviceAreas: ["Брестская область", "Беловежская пуща"],
        stats: {
          avgResponseTime: "12 мин",
          dealSuccessRate: 96,
          avgDaysToRent: 5
        }
      },
      {
        id: 5,
        name: "Михаил Сидоров",
        position: "Агент по большим семейным домам",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
        rating: 4.9,
        reviewsCount: 65,
        experience: 12,
        propertiesManaged: 178,
        description: "Работаю с большими домами для семей. Помогаю найти просторное жилье для комфортной жизни.",
        location: "Могилевская область",
        satisfactionRate: 96,
        contact: {
          phone: "+375 (29) 876-54-32",
          email: "m.sidorov@belhouse.by",
          location: "Могилев"
        },
        specialties: ["Семейные дома", "Дома с участком", "Загородные дома"],
        serviceAreas: ["Могилевская область", "Минская область"],
        stats: {
          avgResponseTime: "35 мин",
          dealSuccessRate: 97,
          avgDaysToRent: 21
        }
      },
      {
        id: 6,
        name: "Анна Волкова",
        position: "Специалист по эко-домам",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
        rating: 4.5,
        reviewsCount: 53,
        experience: 4,
        propertiesManaged: 67,
        description: "Специализируюсь на экологичных домах и домах с земельным участком. Работаю в Гомельской области.",
        location: "Гомельская область",
        satisfactionRate: 92,
        contact: {
          phone: "+375 (29) 345-67-89",
          email: "a.volkova@belhouse.by",
          location: "Гомель"
        },
        specialties: ["Эко-дома", "Дома с участком", "Коттеджи"],
        serviceAreas: ["Гомельская область", "Припятский регион"],
        stats: {
          avgResponseTime: "18 мин",
          dealSuccessRate: 90,
          avgDaysToRent: 12
        }
      },
      {
        id: 7,
        name: "Сергей Николаев",
        position: "Эксперт по элитным загородным домам",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
        rating: 5.0,
        reviewsCount: 42,
        experience: 15,
        propertiesManaged: 89,

        description: "Работаю с эксклюзивными загородными резиденциями. Индивидуальный подход и конфиденциальность.",
        location: "Минск",
        satisfactionRate: 98,
        contact: {
          phone: "+375 (29) 111-22-33",
          email: "s.nikolaev@belhouse.by",
          location: "Минск, пр. Победителей"
        },
        specialties: ["Эко-дома", "Усадьбы", "Дома с участком"],
        serviceAreas: ["Минская область", "Окрестности Минска"],
        stats: {
          avgResponseTime: "50 мин",
          dealSuccessRate: 99,
          avgDaysToRent: 30
        }
      },
      {
        id: 8,
        name: "Ирина Федорова",
        position: "Специалист по домам в исторических местах",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        rating: 4.7,
        reviewsCount: 38,
        experience: 7,
        propertiesManaged: 54,
        description: "Специализируюсь на домах в исторических и культурных местах Беларуси.",
        location: "Несвиж",
        satisfactionRate: 93,
        contact: {
          phone: "+375 (29) 999-88-77",
          email: "i.fedorova@belhouse.by",
          location: "Несвиж"
        },
        specialties: ["Усадьбы", "Исторические дома", "Загородные дома"],
        serviceAreas: ["Несвиж", "Мир", "Новогрудок"],
        stats: {
          avgResponseTime: "1.5 часа",
          dealSuccessRate: 91,
          avgDaysToRent: 25
        }
      }
    ];

    setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 500);
  }, []);

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

    // Фильтр по городу
    if (filters.city && filters.city !== "Все города") {
      result = result.filter(agent => agent.location.includes(filters.city));
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
      city: '',
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

              <div className="agents-search-agent">
                <div className="search-box-agent">
                  <FontAwesomeIcon icon={faSearch} className="search-icon-agent" />
                  <input
                    type="text"
                    placeholder="Поиск агента по имени, специализации или району..."
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

              {/* Город/Область */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faMapMarkerAlt}/> Регион
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
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
                  <h3>Агенты не найдены</h3>
                  <p>Попробуйте изменить параметры поиска</p>
                  <button className="btn-primary" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
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