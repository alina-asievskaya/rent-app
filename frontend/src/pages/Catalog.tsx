import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
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
  faHome,
  faHeart as faHeartSolid,
  faSnowflake,
  faWifi,
  faShieldAlt,
  faCar,
  faTree,
  faSwimmingPool,
  faHotTub,
  faExclamationTriangle
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
  description: string;
  features: string[];
  houseType?: string;
  region?: string;
  city?: string;
  street?: string;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isPremium?: boolean;
  isHot?: boolean;
  photos?: string[];
  ownerName?: string;
  ownerEmail?: string;
  announcementData?: string;
}

interface ApiResponse {
  success: boolean;
  data: Property[];
  total?: number;
  message?: string;
  error?: string;
}

const Catalog: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('price-asc');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Данные для фильтров - извлекаем уникальные города из данных
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(
      properties
        .map(p => p.city)
        .filter((city): city is string => city != null && city.trim() !== "")
    ));
    return ["Все города", ...uniqueCities];
  }, [properties]);

  const propertyTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(
      properties
        .map(p => p.houseType)
        .filter((type): type is string => type != null && type.trim() !== "")
    ));
    return ["Все типы", ...uniqueTypes];
  }, [properties]);

  const roomOptions = ["Любое", "1", "2", "3", "4+"];
  const featuresOptions = [
    "Кондиционер",
    "Мебель", 
    "Интернет",
    "Охрана",
    "Парковка",
    "Гараж",
    "Сад",
    "Бассейн",
    "Сауна"
  ];
  
  const sortOptions: SortOption[] = [
    { id: 'price-asc', label: 'Цена: по возрастанию', icon: faSortAmountUp },
    { id: 'price-desc', label: 'Цена: по убыванию', icon: faSortAmountDown },
    { id: 'area-desc', label: 'Площадь: большая', icon: faRulerCombined },
    { id: 'newest', label: 'Сначала новые', icon: faClock },
    { id: 'popular', label: 'Популярные', icon: faFire }
  ];

  // Функция для загрузки данных из API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const API_URL = 'http://localhost:5213/api';
      console.log('Загружаю данные с:', `${API_URL}/houses/catalog`);
      
      const response = await fetch(`${API_URL}/houses/catalog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      console.log('Статус ответа:', response.status, response.statusText);
      
      if (!response.ok) {
        // Попробуем получить больше информации об ошибке
        let errorText = response.statusText;
        try {
          const errorData = await response.text();
          console.error('Тело ошибки:', errorData);
          if (errorData) {
            const parsed = JSON.parse(errorData);
            errorText = parsed.message || parsed.error || errorText;
          }
        } catch {
          // Игнорируем ошибки парсинга
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result: ApiResponse = await response.json();
      console.log('Данные получены:', result);
      
      if (result.success && result.data) {
        const transformedProperties = result.data.map(house => {
          const priceStr = house.price || '';
          const priceMatch = priceStr.match(/(\d+)/);
          const numericPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
          
          const year = house.announcementData 
            ? new Date(house.announcementData).getFullYear()
            : new Date().getFullYear();
          
          const address = house.address || 
            (house.city && house.street ? `${house.city}, ${house.street}` : 'Адрес не указан');
          
          const info = house.info || 
            `${house.rooms || house.beds || 1}-комн. ${house.houseType?.toLowerCase() || 'дом'}, ${house.area || 0} м²`;
          
          return {
            id: house.id || 0,
            badge: house.badge || "Аренда",
            imageUrl: house.imageUrl || 
              (house.photos && house.photos[0]) || 
              "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
            price: priceStr || `${numericPrice} BYN/мес`,
            address: address,
            info: info,
            beds: house.beds || house.rooms || 1,
            baths: house.baths || house.bathrooms || 1,
            area: house.area || 0,
            year: year,
            rating: house.rating || 0,
            description: house.description || "Описание отсутствует",
            features: house.features || [],
            houseType: house.houseType,
            region: house.region,
            city: house.city,
            street: house.street,
            rooms: house.rooms,
            bathrooms: house.bathrooms,
            floor: house.floor,
            isPremium: house.isPremium,
            isHot: house.isHot,
            photos: house.photos,
            ownerName: house.ownerName,
            ownerEmail: house.ownerEmail,
            announcementData: house.announcementData
          };
        });
        
        console.log('Трансформированные данные:', transformedProperties.length, 'объявлений');
        setProperties(transformedProperties);
      } else {
        throw new Error(result.message || result.error || 'Не удалось загрузить данные');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Не удалось подключиться к серверу. Возможные причины:\n' +
                      '1. Бекенд не запущен на localhost:5213\n' +
                      '2. Проблемы с CORS настройками\n' +
                      '3. Сетевая ошибка';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // Демо-данные
      const mockProperties: Property[] = [
        {
          id: 1,
          badge: "Аренда",
          imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
          price: "1200 BYN/мес",
          address: "Боровляны, Минский район",
          info: "2-комн. квартира, 65 м²",
          beds: 2,
          baths: 1,
          area: 65,
          year: 2022,
          rating: 4.8,
          description: "Светлая квартира с современным ремонтом, мебелью и техникой. Рядом метро и парк.",
          features: ["Мебель", "Интернет", "Парковка"]
        },
        {
          id: 2,
          badge: "Аренда", 
          imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
          price: "850 BYN/мес",
          address: "Минск, Центральный район",
          info: "1-комн. квартира, 45 м²",
          beds: 1,
          baths: 1,
          area: 45,
          year: 2021,
          rating: 4.5,
          description: "Уютная квартира в новом доме. Идеально для одного человека или пары.",
          features: ["Мебель", "Кондиционер"]
        }
      ];
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка избранного при монтировании компонента
  useEffect(() => {
    fetchProperties();
    
    // Парсинг query параметров из URL
    const searchParams = new URLSearchParams(location.search);
    const city = searchParams.get('city');  
    const type = searchParams.get('type');
    
    const initialFilters: FilterOptions = {
      city: city || '',
      propertyType: type || '',
      rooms: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      features: []
    };
    
    setFilters(initialFilters);

    // Загружаем избранное пользователя
    loadUserFavorites();
  }, [location.search]);

  // Функция для загрузки избранного пользователя
  const loadUserFavorites = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Пользователь не авторизован, избранное не загружено');
      return;
    }

    console.log('Загрузка избранного пользователя...');
    
    const response = await fetch('http://localhost:5213/api/favorites/my-favorites-ids', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Ошибка при загрузке избранного:', response.status);
      return;
    }

    const data = await response.json();
    if (data.success && data.data) {
      // Явно указываем тип для элементов Set
      const favoriteIds = new Set<number>(data.data);
      console.log('Загружены ID избранных домов:', favoriteIds);
      setFavorites(favoriteIds);
    }
  } catch (error) {
    console.error('Ошибка при загрузке избранного:', error);
  }
};
  // Функция для получения иконки по названию особенности
  const getFeatureIcon = (feature: string) => {
    const iconMap: Record<string, IconProp> = {
      "Кондиционер": faSnowflake,
      "Мебель": faHome,
      "Интернет": faWifi,
      "Охрана": faShieldAlt,
      "Парковка": faCar,
      "Гараж": faCar,
      "Сад": faTree,
      "Бассейн": faSwimmingPool,
      "Сауна": faHotTub
    };
    return iconMap[feature] || faCheckCircle;
  };

  // Обработчик клика на избранное
  const handleFavoriteClick = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Клик по избранному для дома:', id);
    console.log('Пользователь авторизован:', !!localStorage.getItem('token'));
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Пользователь не авторизован, перенаправление на вход');
      alert('Для добавления в избранное необходимо войти в систему');
      navigate('/login');
      return;
    }

    try {
      const isCurrentlyFavorite = favorites.has(id);
      console.log('Текущее состояние:', isCurrentlyFavorite ? 'в избранном' : 'не в избранном');

      if (isCurrentlyFavorite) {
        // Удаляем из избранного
        console.log('Удаление из избранного...');
        const deleteResponse = await fetch(`http://localhost:5213/api/favorites/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Статус ответа при удалении:', deleteResponse.status);

        if (deleteResponse.ok) {
          const deleteData = await deleteResponse.json();
          console.log('Успешно удалено:', deleteData);
          
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            console.log('Обновлен локальный стейт избранного:', newSet);
            return newSet;
          });
          
          alert('Удалено из избранного');
        } else {
          const errorText = await deleteResponse.text();
          console.error('Ошибка при удалении:', errorText);
          alert('Ошибка при удалении из избранного');
        }
      } else {
        // Добавляем в избранное
        console.log('Добавление в избранное...');
        const addResponse = await fetch(`http://localhost:5213/api/favorites/add/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Статус ответа при добавлении:', addResponse.status);

        if (addResponse.ok) {
          const addData = await addResponse.json();
          console.log('Успешно добавлено:', addData);
          
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            console.log('Обновлен локальный стейт избранного:', newSet);
            return newSet;
          });
          
          alert('Добавлено в избранное');
        } else {
          const errorText = await addResponse.text();
          console.error('Ошибка при добавлении:', errorText);
          alert('Ошибка при добавлении в избранное');
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      alert('Произошла ошибка при обновлении избранного');
    }
  };

  // Фильтрация + сортировка через useMemo
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Фильтр по городу
    if (filters.city && filters.city !== "Все города") {
      result = result.filter(prop => 
        (prop.city && prop.city.includes(filters.city)) || 
        prop.address.includes(filters.city)
      );
    }

    // Фильтр по типу недвижимости
    if (filters.propertyType && filters.propertyType !== "Все типы") {
      result = result.filter(prop => 
        (prop.houseType && prop.houseType.toLowerCase().includes(filters.propertyType.toLowerCase())) ||
        prop.info.toLowerCase().includes(filters.propertyType.toLowerCase())
      );
    }

    // Фильтр по комнатам
    if (filters.rooms && filters.rooms !== "Любое") {
      if (filters.rooms === "4+") {
        result = result.filter(prop => prop.beds >= 4);
      } else {
        const roomsNum = parseInt(filters.rooms);
        result = result.filter(prop => prop.beds === roomsNum);
      }
    }

    // Фильтр по цене
    if (filters.priceMin) {
      const minPrice = parseInt(filters.priceMin.replace(/\D/g, ''));
      if (!isNaN(minPrice)) {
        result = result.filter(prop => {
          const propPrice = parseInt(prop.price.replace(/\D/g, ''));
          return propPrice >= minPrice;
        });
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseInt(filters.priceMax.replace(/\D/g, ''));
      if (!isNaN(maxPrice)) {
        result = result.filter(prop => {
          const propPrice = parseInt(prop.price.replace(/\D/g, ''));
          return propPrice <= maxPrice;
        });
      }
    }

    // Фильтр по площади
    if (filters.areaMin) {
      const minArea = parseInt(filters.areaMin);
      if (!isNaN(minArea)) {
        result = result.filter(prop => prop.area >= minArea);
      }
    }

    if (filters.areaMax) {
      const maxArea = parseInt(filters.areaMax);
      if (!isNaN(maxArea)) {
        result = result.filter(prop => prop.area <= maxArea);
      }
    }

    // Фильтр по особенностям
    if (filters.features.length > 0) {
      result = result.filter(prop =>
        filters.features.every(feature => prop.features.includes(feature))
      );
    }

    // Сортировка
    result.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/\D/g, '')) || 0;
      const priceB = parseInt(b.price.replace(/\D/g, '')) || 0;

      switch (sortBy) {
        case "price-asc": {
          return priceA - priceB;
        }
        case "price-desc": {
          return priceB - priceA;
        }
        case "area-desc": {
          return (b.area || 0) - (a.area || 0);
        }
        case "newest": {
          // Сортировка по дате объявления
          const dateA = a.announcementData ? new Date(a.announcementData).getTime() : 0;
          const dateB = b.announcementData ? new Date(b.announcementData).getTime() : 0;
          return dateB - dateA;
        }
        case "popular": {
          // Используем рейтинг для популярности
          return (b.rating || 0) - (a.rating || 0);
        }
        default: {
          return 0;
        }
      }
    });

    return result;
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

  // Быстрый фильтр по типу дома
  const quickFilterByType = (type: string) => {
    handleFilterChange('propertyType', type);
  };

  // Обновление URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.propertyType) params.set('type', filters.propertyType);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [filters.city, filters.propertyType, navigate]);

  // Функция для повторной загрузки данных
  const retryFetch = () => {
    fetchProperties();
  };

  // Компонент загрузки
  if (loading) {
    return (
      <>
        <Header />
        <div className="agents-loading-agent">
          <div className="spinner-agent"></div>
          <p>Загрузка предложений...</p>
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
              <h1>Каталог жилья для аренды</h1>
              <p>
                {filteredProperties.length} предложений {filters.city && `в ${filters.city}`}
              </p>

              {/* Быстрые фильтры по типу дома */}
              <div className="quick-filters-agent">
                {propertyTypes.slice(1, 5).map(type => (
                  <button 
                    key={type}
                    className={`quick-filter-agent ${filters.propertyType === type ? 'active' : ''}`}
                    onClick={() => quickFilterByType(type)}
                  >
                    {type}
                  </button>
                ))}
                <button 
                  className="quick-filter-agent reset"
                  onClick={resetFilters}
                >
                  Сбросить
                </button>
              </div>

              {/* Показать ошибку если есть */}
              {apiError && (
                <div className="api-error-message" style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1.5rem',
                  fontSize: '0.9rem',
                  border: '1px solid #ffeaa7'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <strong>Ошибка загрузки данных:</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>
                    {apiError}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={retryFetch}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Повторить загрузку
                    </button>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      (Показаны демо-данные)
                    </span>
                  </div>
                </div>
              )}
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

              {/* Город */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faMapMarkerAlt}/> Город
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                >
                  {cities.map(city => (
                    <option key={city} value={city === "Все города" ? "" : city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Тип недвижимости */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faHome}/> Тип недвижимости
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type === "Все типы" ? "" : type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Количество комнат */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faBed}/> Комнаты
                </label>
                <select
                  className="filter-select-agent"
                  value={filters.rooms}
                  onChange={(e) => handleFilterChange("rooms", e.target.value)}
                >
                  {roomOptions.map(room => (
                    <option key={room} value={room === "Любое" ? "" : room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Цена */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">Цена, BYN/мес</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="filter-select-agent"
                    placeholder="от 600"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                    style={{ flex: 1, textAlign: 'center' }}
                  />
                  <span style={{ color: '#78909c' }}>—</span>
                  <input
                    type="number"
                    className="filter-select-agent"
                    placeholder="до 5000"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                    style={{ flex: 1, textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Площадь */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faRulerCombined}/> Площадь, м²
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="filter-select-agent"
                    placeholder="от 20"
                    value={filters.areaMin}
                    onChange={(e) => handleFilterChange("areaMin", e.target.value)}
                    style={{ flex: 1, textAlign: 'center' }}
                  />
                  <span style={{ color: '#78909c' }}>—</span>
                  <input
                    type="number"
                    className="filter-select-agent"
                    placeholder="до 200"
                    value={filters.areaMax}
                    onChange={(e) => handleFilterChange("areaMax", e.target.value)}
                    style={{ flex: 1, textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Особенности (Чекбоксы) */}
              <div className="filter-group-agent">
                <label className="filter-label-agent">
                  <FontAwesomeIcon icon={faCheckCircle}/> Особенности
                </label>
                <div className="features-checkbox-container">
                  {featuresOptions.map(feature => (
                    <label key={feature} className="feature-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="feature-checkbox-input"
                      />
                      <span className="feature-checkbox-custom"></span>
                      <span className="feature-checkbox-text">
                        <FontAwesomeIcon 
                          icon={getFeatureIcon(feature)} 
                          style={{ marginRight: '0.5rem', width: '16px' }}
                        />
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
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
                    Найдено: <strong>{filteredProperties.length}</strong> предложений
                  </div>
                </div>
              </div>

              {/* Список свойств */}
              {filteredProperties.length === 0 ? (
                <div className="no-results-agent">
                  <FontAwesomeIcon icon={faFilter} size="3x"/>
                  <h3>Предложения не найдены</h3>
                  <p>Попробуйте изменить параметры фильтрации</p>
                  <button className="btn-primary" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <div className={`properties-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                  {filteredProperties.map(property => (
                    <div 
                      key={property.id} 
                      className={`property-item ${viewMode}`}
                      onClick={() => navigate(`/house/${property.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="property-item-image">
                        <img 
                          src={property.imageUrl} 
                          alt={property.address} 
                          onError={(e) => {
                            // Fallback изображение если основное не загрузилось
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop";
                          }}
                        />
                        <div className="property-item-badges">
                          <button 
                            className={`favorite-btn ${favorites.has(property.id) ? 'active' : ''}`}
                            onClick={(e) => handleFavoriteClick(property.id, e)}
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
                            <span>{property.rating || 0}</span>
                            {property.rating === 0 && <span style={{ fontSize: '0.8rem', color: '#666' }}> (нет отзывов)</span>}
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
                            <FontAwesomeIcon icon={faClock} /> {property.year}
                          </span>
                        </div>
                        
                        <p className="property-item-description">
                          {property.description}
                        </p>
                        
                        <div className="property-item-tags">
                          {property.features.map((feature: string, index: number) => (
                            <span key={index} className="tag">
                              <FontAwesomeIcon 
                                icon={getFeatureIcon(feature)} 
                                style={{ marginRight: '0.25rem' }}
                              />
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        <div className="property-item-actions">
                          <button 
                            className="btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/house/${property.id}`);
                            }}
                          >
                            Подробнее
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (property.ownerEmail) {
                                window.location.href = `mailto:${property.ownerEmail}?subject=Вопрос по объявлению ${property.id}`;
                              } else if (property.id === 1 || property.id === 2) {
                                // Для демо-данных
                                alert('Это демо-объявление. В реальном приложении здесь будет email владельца.');
                              }
                            }}
                            disabled={!property.ownerEmail && property.id > 2}
                          >
                            {property.ownerEmail ? 'Написать владельцу' : 'Контакты недоступны'}
                          </button>
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
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Catalog;