  import React, { useState, useEffect } from "react";
  import { useLocation } from "react-router-dom";
  import Header from "../components/Header";
  import Footer from "../components/Footer";
  import PropertyCard from "../components/PropertyCard";
  import "./Catalog.css";

  // Импорт Font Awesome
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import {
    faFilter,
    faSlidersH,
    faSortAmountDown,
    faSortAmountUp,
    faMapMarkerAlt,
    faRulerCombined,
    faBed,
    faBath,
    faStar,
    faFire,
    faClock,
    faCheckCircle,
    faChevronDown,
    faTimes,
    faHeart as faHeartSolid
  } from '@fortawesome/free-solid-svg-icons';
  import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
  import type { IconProp } from '@fortawesome/fontawesome-svg-core';

  // Типы для фильтров
  interface FilterOptions {
    city: string;
    propertyType: string;
    rooms: string;
    priceMin: string;
    priceMax: string;
    areaMin: string;
    areaMax: string;
    features: string[];
  }

  interface SortOption {
    id: string;
    label: string;
    icon: IconProp;
  }

  interface Property {
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
  }

  const Catalog: React.FC = () => {
    const location = useLocation();
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('price-asc');
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    // Состояние фильтров
    const [filters, setFilters] = useState<FilterOptions>({
      city: '',
      propertyType: '',
      rooms: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      features: []
    });

    // Данные для фильтров
    const cities = ["Все города", "Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск", "Сочи"];
    const propertyTypes = ["Все типы", "Квартира", "Дом", "Апартаменты", "Комната", "Таунхаус"];
    const roomOptions = ["Любое", "1", "2", "3", "4+"];
    const featuresOptions = ["Меблированная", "С ремонтом", "С техникой", "Балкон/лоджия", "Парковка", "Консьерж", "Лифт"];
    
    const sortOptions: SortOption[] = [
      { id: 'price-asc', label: 'Цена: по возрастанию', icon: faSortAmountUp },
      { id: 'price-desc', label: 'Цена: по убыванию', icon: faSortAmountDown },
      { id: 'area-desc', label: 'Площадь: большая', icon: faRulerCombined },
      { id: 'newest', label: 'Сначала новые', icon: faClock },
      { id: 'popular', label: 'Популярные', icon: faFire }
    ];

    // Функция фильтрации и сортировки - вынесена из useEffect
    const filterAndSortProperties = (
      propertiesList: Property[], 
      filterOptions: FilterOptions, 
      sortOption: string
    ): Property[] => {
      let result = [...propertiesList];

      // Применение фильтров
      if (filterOptions.city && filterOptions.city !== "Все города") {
        result = result.filter(prop => 
          prop.address.toLowerCase().includes(filterOptions.city.toLowerCase())
        );
      }

      if (filterOptions.propertyType && filterOptions.propertyType !== "Все типы") {
        result = result.filter(prop => 
          prop.info.toLowerCase().includes(filterOptions.propertyType.toLowerCase()) ||
          prop.description.toLowerCase().includes(filterOptions.propertyType.toLowerCase())
        );
      }

      if (filterOptions.rooms && filterOptions.rooms !== "Любое") {
        result = result.filter(prop => {
          if (filterOptions.rooms === "4+") {
            return prop.beds >= 4;
          }
          return prop.beds === parseInt(filterOptions.rooms);
        });
      }

      if (filterOptions.priceMin) {
        const minPrice = parseInt(filterOptions.priceMin.replace(/\D/g, ''));
        result = result.filter(prop => {
          const propPrice = parseInt(prop.price.replace(/\D/g, ''));
          return propPrice >= minPrice;
        });
      }

      if (filterOptions.priceMax) {
        const maxPrice = parseInt(filterOptions.priceMax.replace(/\D/g, ''));
        result = result.filter(prop => {
          const propPrice = parseInt(prop.price.replace(/\D/g, ''));
          return propPrice <= maxPrice;
        });
      }

      if (filterOptions.features.length > 0) {
        result = result.filter(prop =>
          filterOptions.features.every(feature => 
            prop.features.includes(feature)
          )
        );
      }

      // Применение сортировки
      result.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, ''));
        const priceB = parseInt(b.price.replace(/\D/g, ''));

        switch (sortOption) {
          case 'price-asc':
            return priceA - priceB;
          case 'price-desc':
            return priceB - priceA;
          case 'area-desc':
            return b.area - a.area;
          case 'newest':
            return b.year - a.year;
          case 'popular':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });

      return result;
    };

    // Загрузка данных
    useEffect(() => {
      // Заглушка с данными (в реальном приложении здесь будет запрос к API)
      const mockProperties: Property[] = [
        {
          id: 1,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
          price: "120,000 ₽/мес",
          address: "Санкт-Петербург, Приморский район",
          info: "2-комн. квартира, 65 м²",
          beds: 2,
          baths: 1,
          area: 65,
          year: 2022,
          rating: 4.8,
          isPremium: true,
          isHot: true,
          description: "Светлая квартира с современным ремонтом, мебелью и техникой. Рядом метро и парк.",
          features: ["Меблированная", "С техникой", "Балкон"]
        },
        {
          id: 2,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
          price: "85,000 ₽/мес",
          address: "Казань, Вахитовский район",
          info: "1-комн. квартира, 45 м²",
          beds: 1,
          baths: 1,
          area: 45,
          year: 2021,
          rating: 4.5,
          isPremium: false,
          isHot: true,
          description: "Уютная квартира в новом доме. Идеально для одного человека или пары.",
          features: ["Меблированная", "С ремонтом"]
        },
        {
          id: 3,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          price: "250,000 ₽/мес",
          address: "Москва, ЦАО, ул. Тверская",
          info: "3-комн. квартира, 85 м²",
          beds: 3,
          baths: 2,
          area: 85,
          year: 2023,
          rating: 4.9,
          isPremium: true,
          isHot: false,
          description: "Элитная квартира в историческом центре с панорамным видом на город.",
          features: ["Меблированная", "С техникой", "Балкон", "Консьерж", "Парковка"]
        },
        {
          id: 4,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          price: "180,000 ₽/мес",
          address: "Москва, Хамовники",
          info: "4-комн. квартира, 120 м²",
          beds: 4,
          baths: 2,
          area: 120,
          year: 2022,
          rating: 4.7,
          isPremium: true,
          isHot: true,
          description: "Просторная семейная квартира в престижном районе. Два санузла, кухня-гостиная.",
          features: ["Меблированная", "С техникой", "Балкон", "Лифт"]
        },
        {
          id: 5,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          price: "65,000 ₽/мес",
          address: "Екатеринбург, Центральный район",
          info: "Студия, 35 м²",
          beds: 1,
          baths: 1,
          area: 35,
          year: 2020,
          rating: 4.3,
          isPremium: false,
          isHot: false,
          description: "Современная студия для молодых специалистов. Все необходимое для комфортной жизни.",
          features: ["Меблированная", "С техникой"]
        },
        {
          id: 6,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
          price: "150,000 ₽/мес",
          address: "Новосибирск, Академгородок",
          info: "3-комн. квартира, 75 м²",
          beds: 3,
          baths: 1,
          area: 75,
          year: 2021,
          rating: 4.6,
          isPremium: false,
          isHot: true,
          description: "Тихая квартира в научном центре города. Идеально для семьи с детьми.",
          features: ["Меблированная", "С ремонтом", "Балкон"]
        },
        {
          id: 7,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          price: "300,000 ₽/мес",
          address: "Сочи, Адлерский район",
          info: "Коттедж, 150 м²",
          beds: 4,
          baths: 3,
          area: 150,
          year: 2023,
          rating: 4.9,
          isPremium: true,
          isHot: true,
          description: "Современный коттедж у моря. Собственный сад и терраса с видом на море.",
          features: ["Меблированная", "С техникой", "Парковка"]
        },
        {
          id: 8,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop",
          price: "95,000 ₽/мес",
          address: "Москва, ЮЗАО",
          info: "2-комн. квартира, 60 м²",
          beds: 2,
          baths: 1,
          area: 60,
          year: 2022,
          rating: 4.4,
          isPremium: false,
          isHot: false,
          description: "Удобная квартира в спальном районе. Рядом метро и все необходимые инфраструктуры.",
          features: ["Меблированная", "С ремонтом"]
        }
      ];

      // Парсинг query параметров из URL
      const searchParams = new URLSearchParams(location.search);
      const city = searchParams.get('city');
      const type = searchParams.get('type');
      
      const initialFilters: FilterOptions = {
        city: '',
        propertyType: '',
        rooms: '',
        priceMin: '',
        priceMax: '',
        areaMin: '',
        areaMax: '',
        features: []
      };

      if (city || type) {
        initialFilters.city = city || '';
        initialFilters.propertyType = type || '';
      }

      // Симуляция загрузки данных с единым обновлением состояния
      setTimeout(() => {
        const loadedProperties = mockProperties;
        setProperties(loadedProperties);
        setFilters(initialFilters);
        
        // Фильтрация после загрузки данных
        const filtered = filterAndSortProperties(loadedProperties, initialFilters, 'price-asc');
        setFilteredProperties(filtered);
        
        setLoading(false);
      }, 500);
    }, [location.search]);

    // Обновление отфильтрованных свойств при изменении фильтров или сортировки
    useEffect(() => {
      if (properties.length > 0) {
        const filtered = filterAndSortProperties(properties, filters, sortBy);
        // Используем requestAnimationFrame для избежания синхронных обновлений
        requestAnimationFrame(() => {
          setFilteredProperties(filtered);
        });
      }
    }, [properties, filters, sortBy]);

    // Обработчики фильтров
    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleFeatureToggle = (feature: string) => {
      setFilters(prev => ({
        ...prev,
        features: prev.features.includes(feature)
          ? prev.features.filter(f => f !== feature)
          : [...prev.features, feature]
      }));
    };

    const resetFilters = () => {
      setFilters({
        city: '',
        propertyType: '',
        rooms: '',
        priceMin: '',
        priceMax: '',
        areaMin: '',
        areaMax: '',
        features: []
      });
    };

    const toggleFavorite = (id: number) => {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        return newFavorites;
      });
    };

    // Компонент загрузки
    if (loading) {
      return (
        <>
          <Header />
          <div className="catalog-loading">
            <div className="spinner"></div>
            <p>Загрузка предложений...</p>
          </div>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Header />

        <div className="catalog-page">
          {/* Hero секция каталога */}
          <section className="catalog-hero">
            <div className="container">
              <div className="catalog-hero-content">
                <h1>Каталог жилья для аренды</h1>
                <p>
                  {filteredProperties.length} предложений {filters.city && `в ${filters.city}`}
                </p>
                
                {/* Быстрые фильтры */}
                <div className="quick-filters">
                  <button 
                    className={`quick-filter ${filters.city === 'Москва' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('city', 'Москва')}
                  >
                    Москва
                  </button>
                  <button 
                    className={`quick-filter ${filters.city === 'Санкт-Петербург' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('city', 'Санкт-Петербург')}
                  >
                    СПб
                  </button>
                  <button 
                    className={`quick-filter ${filters.propertyType === 'Квартира' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('propertyType', 'Квартира')}
                  >
                    Квартиры
                  </button>
                  <button 
                    className={`quick-filter ${filters.propertyType === 'Дом' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('propertyType', 'Дом')}
                  >
                    Дома
                  </button>
                  <button 
                    className={`quick-filter ${filters.rooms === '1' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('rooms', '1')}
                  >
                    1-комн.
                  </button>
                  <button 
                    className={`quick-filter ${filters.rooms === '2' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('rooms', '2')}
                  >
                    2-комн.
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Основной контент */}
          <div className="container">
            <div className="catalog-content">
              {/* Боковая панель фильтров */}
              <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                <div className="filters-header">
                  <h3><FontAwesomeIcon icon={faFilter} /> Фильтры</h3>
                  <button 
                    className="close-filters"
                    onClick={() => setShowFilters(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Город */}
                <div className="filter-group">
                  <label className="filter-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Город
                  </label>
                  <select 
                    className="filter-select"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    {cities.map(city => (
                      <option key={city} value={city === "Все города" ? "" : city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Тип недвижимости */}
                <div className="filter-group">
                  <label className="filter-label">Тип жилья</label>
                  <select 
                    className="filter-select"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type === "Все типы" ? "" : type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Количество комнат */}
                <div className="filter-group">
                  <label className="filter-label">Комнаты</label>
                  <div className="room-buttons">
                    {roomOptions.map(room => (
                      <button
                        key={room}
                        className={`room-btn ${filters.rooms === room ? 'active' : ''}`}
                        onClick={() => handleFilterChange('rooms', room === "Любое" ? "" : room)}
                      >
                        {room}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Цена */}
                <div className="filter-group">
                  <label className="filter-label">Цена, ₽/мес</label>
                  <div className="price-range">
                    <input
                      type="text"
                      className="price-input"
                      placeholder="от 30,000"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    />
                    <span className="price-separator">—</span>
                    <input
                      type="text"
                      className="price-input"
                      placeholder="до 200,000"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    />
                  </div>
                </div>

                {/* Особенности */}
                <div className="filter-group">
                  <label className="filter-label">Особенности</label>
                  <div className="feature-checkboxes">
                    {featuresOptions.map(feature => (
                      <label key={feature} className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                        />
                        <span className="checkmark"></span>
                        {feature}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Кнопки фильтров */}
                <div className="filter-actions">
                  <button className="btn-primary filter-apply">
                    Применить фильтры
                  </button>
                  <button className="btn-secondary filter-reset" onClick={resetFilters}>
                    Сбросить все
                  </button>
                </div>

                {/* Статистика */}
                <div className="filter-stats">
                  <h4>Популярное сейчас</h4>
                  <div className="hot-properties">
                    {properties
                      .filter(p => p.isHot)
                      .slice(0, 2)
                      .map(prop => (
                        <div key={prop.id} className="hot-property">
                          <img src={prop.imageUrl} alt={prop.address} />
                          <div className="hot-property-info">
                            <div className="hot-property-price">{prop.price}</div>
                            <div className="hot-property-address">{prop.address}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </aside>

              {/* Основной контент */}
              <main className="catalog-main">
                {/* Панель управления */}
                <div className="catalog-controls">
                  <div className="controls-left">
                    <button 
                      className="toggle-filters-btn"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FontAwesomeIcon icon={faSlidersH} /> Фильтры
                    </button>
                    <div className="sort-control">
                      <FontAwesomeIcon icon={faSortAmountDown} />
                      <select 
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        {sortOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FontAwesomeIcon icon={faChevronDown} className="sort-arrow" />
                    </div>
                  </div>

                  <div className="controls-right">
                    <div className="view-toggle">
                      <button 
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Сетка"
                      >
                        ▦
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="Список"
                      >
                        ☰
                      </button>
                    </div>
                    <div className="results-count">
                      Показано: <strong>{filteredProperties.length}</strong> из {properties.length}
                    </div>
                  </div>
                </div>

                {/* Карточки недвижимости */}
                {filteredProperties.length === 0 ? (
                  <div className="no-results">
                    <FontAwesomeIcon icon={faFilter} size="3x" />
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                    <button className="btn-primary" onClick={resetFilters}>
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  <div className={`properties-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                    {filteredProperties.map(property => (
                      <div key={property.id} className={`property-item ${viewMode}`}>
                        <div className="property-item-image">
                          <img src={property.imageUrl} alt={property.address} />
                          <div className="property-item-badges">
                            {property.isPremium && (
                              <span className="badge premium">
                                <FontAwesomeIcon icon={faStar} /> Премиум
                              </span>
                            )}
                            {property.isHot && (
                              <span className="badge hot">
                                <FontAwesomeIcon icon={faFire} /> Горячее
                              </span>
                            )}
                            <button 
                              className={`favorite-btn ${favorites.has(property.id) ? 'active' : ''}`}
                              onClick={() => toggleFavorite(property.id)}
                            >
                              <FontAwesomeIcon icon={favorites.has(property.id) ? faHeartSolid : faHeartOutline} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="property-item-content">
                          <div className="property-item-header">
                            <h3>{property.price}</h3>
                            <div className="property-rating">
                              <FontAwesomeIcon icon={faStar} />
                              <span>{property.rating}</span>
                            </div>
                          </div>
                          
                          <div className="property-item-address">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            {property.address}
                          </div>
                          
                          <p className="property-item-info">{property.info}</p>
                          
                          <div className="property-item-features">
                            <span>
                              <FontAwesomeIcon icon={faBed} /> {property.beds} комн.
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faBath} /> {property.baths}
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faRulerCombined} /> {property.area} м²
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faCheckCircle} /> {property.year}
                            </span>
                          </div>
                          
                          <p className="property-item-description">
                            {property.description}
                          </p>
                          
                          <div className="property-item-tags">
                            {property.features.map((feature: string, index: number) => (
                              <span key={index} className="tag">{feature}</span>
                            ))}
                          </div>
                          
                          <div className="property-item-actions">
                            <button className="btn-primary">Подробнее</button>
                            <button className="btn-secondary">Написать владельцу</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Пагинация */}
                {filteredProperties.length > 0 && (
                  <div className="pagination">
                    <button className="pagination-btn disabled">‹</button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn">2</button>
                    <button className="pagination-btn">3</button>
                    <span className="pagination-ellipsis">...</span>
                    <button className="pagination-btn">10</button>
                    <button className="pagination-btn">›</button>
                  </div>
                )}

                {/* Рекомендации */}
                <div className="recommendations">
                  <h3>Возможно, вас заинтересует</h3>
                  <div className="recommendations-grid">
                    {properties
                      .filter(p => !filteredProperties.some(fp => fp.id === p.id))
                      .slice(0, 3)
                      .map(property => (
                        <PropertyCard
                          key={`rec-${property.id}`}
                          {...property}
                        />
                      ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        <Footer />
      </>
    );
  };

  export default Catalog;