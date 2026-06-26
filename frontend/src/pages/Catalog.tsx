import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./Catalog.css";

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
  faExclamationTriangle,
  faComment,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faEllipsisH,
  faSun,
  faCalendarAlt,
  faTrash,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

interface FilterOptions {
  city: string;
  propertyType: string;
  rooms: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
  features: string[];
  rentType: string;
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
  houseNumber?: string;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isPremium?: boolean;
  isHot?: boolean;
  photos?: string[];
  ownerName?: string;
  ownerEmail?: string;
  announcementData?: string;
  ownerId?: number;
  rentType?: string;
}

interface ApiResponse {
  success: boolean;
  data: Property[];
  total?: number;
  message?: string;
  error?: string;
}

interface OwnerInfoResponse {
  success: boolean;
  data: {
    id: number;
    fio: string;
    email: string;
    phone_num: string;
    id_agent: boolean;
  };
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

interface Toast {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
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
  const [creatingChatForProperty, setCreatingChatForProperty] = useState<number | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);

  const [filters, setFilters] = useState<FilterOptions>({
    city: '',
    propertyType: '',
    rooms: '',
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: '',
    features: [],
    rentType: ''
  });

  const [currentUser, setCurrentUser] = useState<{ email: string; isAdmin: boolean } | null>(null);

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

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const formatPriceWithIcon = (priceStr: string): React.ReactNode => {
    const match = priceStr.match(/^([\d\s]+)\s*Br\s*(.*)$/i);
    if (match) {
      const number = match[1].trim(); 
      const suffix = match[2];        
      return (
        <>
          {number} <i className="nbrb-icon">&#xe901;</i>{suffix}
        </>
      );
    }
    return priceStr;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        const roles = payload.role || payload.roles || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        let isAdmin = false;
        if (Array.isArray(roles)) {
          isAdmin = roles.includes('Admin');
        } else if (typeof roles === 'string') {
          isAdmin = roles === 'Admin';
        }
        
        if (userEmail?.toLowerCase() === 'admin@gmail.com') {
          isAdmin = true;
        }
        
        setCurrentUser({ email: userEmail, isAdmin });
      } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  const getHouseOwnerInfo = async (houseId: number): Promise<number | null> => {
    try {
      const response = await fetch(`http://localhost:5213/api/houses/${houseId}/owner-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result: OwnerInfoResponse = await response.json();
        if (result.success && result.data) {
          if (result.data.email?.toLowerCase() === 'admin@gmail.com') {
            return null;
          }
          return result.data.id;
        }
      } else {
        const property = properties.find(p => p.id === houseId);
        if (property?.ownerId) {
          return property.ownerId;
        }
      }
      return null;
    } catch (error) {
      console.error('Ошибка при получении информации о владельце:', error);
      return null;
    }
  };

  const checkExistingChat = async (ownerId: number, houseId: number): Promise<number | null> => {
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
            chat.user_id === ownerId && chat.ad_id === houseId
          );
          
          if (existingChat) {
            return existingChat.id;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Ошибка при проверке существующего чата:', error);
      return null;
    }
  };

  const createNewChat = async (ownerId: number, houseId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('http://localhost:5213/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          otherUserId: ownerId,
          houseId: houseId,
          initialMessage: "Здравствуйте! Меня интересует ваше объявление."
        })
      });

      if (response.ok) {
        const result: ChatCreateResponse = await response.json();
        if (result.success && result.data) {
          return result.data.chat_id;
        }
      } else {
        const errorData = await response.json();
        console.error('Ошибка создания чата:', errorData);
      }
      return null;
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      return null;
    }
  };

  const handleOpenChat = async (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      if (userEmail?.toLowerCase() === 'admin@gmail.com') {
        showToast('Администратор не может использовать чат', 'warning');
        return;
      }
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
    }

    setCreatingChatForProperty(propertyId);
    
    try {
      const ownerId = await getHouseOwnerInfo(propertyId);
      if (!ownerId) {
        showToast('Не удалось найти владельца объявления', 'error');
        return;
      }

      const existingChatId = await checkExistingChat(ownerId, propertyId);
      
      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
        return;
      }

      const newChatId = await createNewChat(ownerId, propertyId);
      
      if (newChatId) {
        navigate(`/chat/${newChatId}`);
      } else {
        showToast('Не удалось создать чат', 'error');
      }
    } catch (error) {
      console.error('Ошибка при открытии чата:', error);
      showToast('Ошибка при открытии чата', 'error');
    } finally {
      setCreatingChatForProperty(null);
    }
  };

  const handleDeleteProperty = async (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!currentUser?.isAdmin) {
      showToast('У вас нет прав для удаления объявлений', 'error');
      return;
    }

    setDeletingProperty(propertyId);
    
    try {
      const response = await fetch(`http://localhost:5213/api/houses/admin/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProperties(prevProperties => prevProperties.filter(p => p.id !== propertyId));
        showToast('Объявление успешно удалено', 'success');
        
        const remainingOnPage = currentProperties.filter(p => p.id !== propertyId).length;
        if (remainingOnPage === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        showToast(result.message || 'Ошибка при удалении объявления', 'error');
      }
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
      showToast('Ошибка соединения с сервером', 'error');
    } finally {
      setDeletingProperty(null);
    }
  };

  const handleViewProperty = (propertyId: number) => {
    navigate(`/house/${propertyId}`);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const API_URL = 'http://localhost:5213/api';
      
      const response = await fetch(`${API_URL}/houses/catalog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        let errorText = response.statusText;
        try {
          const errorData = await response.text();
          if (errorData) {
            const parsed = JSON.parse(errorData);
            errorText = parsed.message || parsed.error || errorText;
          }
        } catch (error) {
          console.error('Ошибка парсинга ошибки', error);
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        const transformedProperties = result.data.map(house => {
          const priceStr = house.price || '';
          const priceMatch = priceStr.match(/(\d+)/);
          const numericPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
          
          const year = house.announcementData 
            ? new Date(house.announcementData).getFullYear()
            : new Date().getFullYear();
          
          let city = house.city || '';
          const address = house.address || '';
          
          if (!city && address.includes(',')) {
            city = address.split(',')[0].trim();
          }
          
          const info = house.info || 
            `${house.rooms || house.beds || 1}-комн. ${house.houseType?.toLowerCase() || 'дом'}, ${house.area || 0} м²`;
          
          const ownerId = house.ownerId || house.id || 0;
          
          let rentType = house.rentType;
          if (!rentType) {
            rentType = priceStr.includes('сутки') ? 'day' : 'month';
          }
          
          return {
            id: house.id || 0,
            badge: house.badge || "Аренда",
            imageUrl: house.imageUrl || 
              (house.photos && house.photos[0]) || 
              "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
            price: priceStr || `${numericPrice} BYN/сутки`,
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
            city: city,
            street: house.street,
            houseNumber: house.houseNumber, 
            rooms: house.rooms,
            bathrooms: house.bathrooms,
            floor: house.floor,
            isPremium: false,
            isHot: false,
            photos: house.photos,
            ownerName: house.ownerName,
            ownerEmail: house.ownerEmail,
            announcementData: house.announcementData,
            ownerId: ownerId,
            rentType: rentType
          };
        });
        
        setProperties(transformedProperties);
        setCurrentPage(1);
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
      setProperties([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    
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
      features: [],
      rentType: ''
    };
    
    setFilters(initialFilters);

    loadUserFavorites();
  }, [location.search]);

  useEffect(() => {
    const handleFavoritesUpdate = () => {
      loadUserFavorites();
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, []);

  const loadUserFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5213/api/favorites/my-favorites-ids', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.data) {
        const favoriteIds = new Set<number>(data.data);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
    }
  };

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

  const handleFavoriteClick = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const roles = payload.role || payload.roles || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      
      let isAdmin = false;
      if (Array.isArray(roles)) {
        isAdmin = roles.includes('Admin');
      } else if (typeof roles === 'string') {
        isAdmin = roles === 'Admin';
      }
      
      if (userEmail?.toLowerCase() === 'admin@gmail.com') {
        isAdmin = true;
      }
      
      if (isAdmin) {
        showToast('Администраторы не могут использовать избранное', 'warning');
        return;
      }
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
    }

    try {
      const isCurrentlyFavorite = favorites.has(id);

      if (isCurrentlyFavorite) {
        const deleteResponse = await fetch(`http://localhost:5213/api/favorites/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          window.dispatchEvent(new CustomEvent('favoritesUpdated'));
          showToast('Удалено из избранного', 'success');
        } else {
          console.error('Ошибка при удалении из избранного');
          showToast('Ошибка при удалении из избранного', 'error');
        }
      } else {
        const addResponse = await fetch(`http://localhost:5213/api/favorites/add/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (addResponse.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          });
          window.dispatchEvent(new CustomEvent('favoritesUpdated'));
          showToast('Добавлено в избранное', 'success');
        } else {
          console.error('Ошибка при добавлении в избранное');
          showToast('Ошибка при добавлении в избранное', 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      showToast('Ошибка при обновлении избранного', 'error');
    }
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (filters.city && filters.city !== "Все города") {
      result = result.filter(prop => 
        (prop.city && prop.city.toLowerCase() === filters.city.toLowerCase())
      );
    }

    if (filters.propertyType && filters.propertyType !== "Все типы") {
      result = result.filter(prop => 
        (prop.houseType && prop.houseType.toLowerCase().includes(filters.propertyType.toLowerCase()))
      );
    }

    if (filters.rooms && filters.rooms !== "Любое") {
      if (filters.rooms === "4+") {
        result = result.filter(prop => prop.beds >= 4);
      } else {
        const roomsNum = parseInt(filters.rooms);
        result = result.filter(prop => prop.beds === roomsNum);
      }
    }

    if (filters.rentType) {
      result = result.filter(prop => prop.rentType === filters.rentType);
    }

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

    if (filters.features.length > 0) {
      result = result.filter(prop =>
        filters.features.every(feature => prop.features.includes(feature))
      );
    }

    result.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/\D/g, '')) || 0;
      const priceB = parseInt(b.price.replace(/\D/g, '')) || 0;

      switch (sortBy) {
        case "price-asc": return priceA - priceB;
        case "price-desc": return priceB - priceA;
        case "area-desc": return (b.area || 0) - (a.area || 0);
        case "newest": {
          const dateA = a.announcementData ? new Date(a.announcementData).getTime() : 0;
          const dateB = b.announcementData ? new Date(b.announcementData).getTime() : 0;
          return dateB - dateA;
        }
        case "popular": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

    return result;
  }, [properties, filters, sortBy]);

  const totalProperties = filteredProperties.length;
  const totalPages = Math.ceil(totalProperties / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
    setCurrentPage(1);
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
      features: [],
      rentType: ''
    });
    setCurrentPage(1);
  };

  const quickFilterByType = (type: string) => {
    handleFilterChange('propertyType', type);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.propertyType) params.set('type', filters.propertyType);
    navigate({ search: params.toString() }, { replace: true });
  }, [filters.city, filters.propertyType, navigate]);

  const retryFetch = () => {
    fetchProperties();
  };

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
      
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-icon">
              {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
              {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
              {toast.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
              {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
            </div>
            <div className="toast-content">
              <div className="toast-message">{toast.text}</div>
            </div>
            <button 
              className="toast-close" 
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
      
      <main className="catalog-page">
        <section className="catalog-hero-premium">
          <div className="catalog-hero-premium-bg"></div>
          <div className="catalog-hero-premium-overlay"></div>
          <div className="catalog-hero-premium-content">
            <h1>Каталог жилья для аренды</h1>
            <div className="catalog-hero-premium-divider"></div>
            <p>
              {totalProperties} предложений {filters.city && `в ${filters.city}`}
            </p>
            
            {propertyTypes.length > 1 && (
              <div className="quick-filters-premium">
                {propertyTypes.slice(1, 5).map(type => (
                  <button 
                    key={type}
                    className={`quick-filter-premium ${filters.propertyType === type ? 'active' : ''}`}
                    onClick={() => quickFilterByType(type)}
                  >
                    {type}
                  </button>
                ))}
                <button 
                  className="quick-filter-premium reset"
                  onClick={resetFilters}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}

            {apiError && (
              <div className="error-message-premium">
                <FontAwesomeIcon icon={faExclamationTriangle} /> {apiError}
                <button onClick={retryFetch} style={{ marginLeft: '1rem' }}>Повторить</button>
              </div>
            )}
          </div>
        </section>

        <div className="catalog-container">
          <div className="catalog-layout">
            <aside className={`catalog-filters ${showFilters ? "show" : ""}`}>
              <div className="filters-header">
                <h3><FontAwesomeIcon icon={faFilter} /> Фильтры</h3>
                <button className="close-filters" onClick={() => setShowFilters(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="filter-group">
                <label className="filter-label"><FontAwesomeIcon icon={faMapMarkerAlt} /> Город</label>
                <div className="catalog-select-wrapper">
                  <select className="filter-select" value={filters.city} onChange={(e) => handleFilterChange("city", e.target.value)}>
                    {cities.map(city => (
                      <option key={city} value={city === "Все города" ? "" : city}>{city}</option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="catalog-select-arrow" />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label"><FontAwesomeIcon icon={faHome} /> Тип</label>
                <div className="catalog-select-wrapper">
                  <select className="filter-select" value={filters.propertyType} onChange={(e) => handleFilterChange("propertyType", e.target.value)}>
                    {propertyTypes.map(type => (
                      <option key={type} value={type === "Все типы" ? "" : type}>{type}</option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="catalog-select-arrow" />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label"><FontAwesomeIcon icon={faBed} /> Комнаты</label>
                <div className="catalog-select-wrapper">
                  <select className="filter-select" value={filters.rooms} onChange={(e) => handleFilterChange("rooms", e.target.value)}>
                    {roomOptions.map(room => (
                      <option key={room} value={room === "Любое" ? "" : room}>{room}</option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="catalog-select-arrow" />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Тип аренды</label>
                <div className="catalog-rent-type-group">
                  <label className={`catalog-rent-option ${filters.rentType === 'day' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="rentTypeFilter"
                      value="day"
                      checked={filters.rentType === 'day'}
                      onChange={(e) => handleFilterChange('rentType', e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSun} className="catalog-rent-icon" />
                    <div className="catalog-rent-text">
                      <strong>Посуточно</strong>
                      <small>Аренда на короткий срок</small>
                    </div>
                  </label>
                  <label className={`catalog-rent-option ${filters.rentType === 'month' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="rentTypeFilter"
                      value="month"
                      checked={filters.rentType === 'month'}
                      onChange={(e) => handleFilterChange('rentType', e.target.value)}
                    />
                    <FontAwesomeIcon icon={faCalendarAlt} className="catalog-rent-icon" />
                    <div className="catalog-rent-text">
                      <strong>Помесячно</strong>
                      <small>Долгосрочная аренда</small>
                    </div>
                  </label>
                  {filters.rentType && (
                    <button
                      className="catalog-rent-clear"
                      onClick={() => handleFilterChange('rentType', '')}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Сбросить
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Цена, <i className="nbrb-icon">&#xe901;</i></label>
                <div className="price-range">
                  <input type="number" className="filter-input" placeholder="от" value={filters.priceMin} onChange={(e) => handleFilterChange("priceMin", e.target.value)} />
                  <span className="price-separator">—</span>
                  <input type="number" className="filter-input" placeholder="до" value={filters.priceMax} onChange={(e) => handleFilterChange("priceMax", e.target.value)} />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label"><FontAwesomeIcon icon={faRulerCombined} /> Площадь, м²</label>
                <div className="area-range">
                  <input type="number" className="filter-input" placeholder="от" value={filters.areaMin} onChange={(e) => handleFilterChange("areaMin", e.target.value)} />
                  <span className="area-separator">—</span>
                  <input type="number" className="filter-input" placeholder="до" value={filters.areaMax} onChange={(e) => handleFilterChange("areaMax", e.target.value)} />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label"><FontAwesomeIcon icon={faCheckCircle} /> Особенности</label>
                <div className="features-grid">
                  {featuresOptions.map(feature => (
                    <label key={feature} className="feature-item">
                      <input type="checkbox" checked={filters.features.includes(feature)} onChange={() => handleFeatureToggle(feature)} />
                      <span className="feature-checkmark"></span>
                      <span><FontAwesomeIcon icon={getFeatureIcon(feature)} style={{ marginRight: '0.5rem' }} /> {feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="filter-reset-btn" onClick={resetFilters}>Сбросить фильтры</button>
            </aside>

            <main className="catalog-main">
              <div className="catalog-toolbar">
                <div className="toolbar-left">
                  <button className="toggle-filters" onClick={() => setShowFilters(!showFilters)}>
                    <FontAwesomeIcon icon={faSlidersH} /> Фильтры
                  </button>
                  <div className="sort-wrapper">
                    <FontAwesomeIcon icon={faSortAmountDown} style={{ color: 'var(--catalog-accent)' }} />
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className="sort-arrow" />
                  </div>
                </div>
                <div className="toolbar-right">
                  <div className="view-toggle">
                    <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>▦</button>
                    <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>☰</button>
                  </div>
                  <div className="results-count">
                    Найдено: <strong>{totalProperties}</strong> {totalPages > 1 && `(стр. ${currentPage} из ${totalPages})`}
                  </div>
                </div>
              </div>

              {currentProperties.length === 0 ? (
                <div className="no-results-premium">
                  <FontAwesomeIcon icon={faFilter} size="3x" />
                  <h3>Предложения не найдены</h3>
                  <p>Попробуйте изменить параметры фильтрации</p>
                  <button className="btn-premium-primary" onClick={resetFilters}>Сбросить фильтры</button>
                </div>
              ) : (
                <>
                  <div className={viewMode === "grid" ? "properties-grid-premium" : "properties-list-premium"}>
                    {currentProperties.map(property => {
                      const isAdminView = currentUser?.isAdmin === true;
                      return (
                        <div 
                          key={property.id} 
                          className={viewMode === "grid" ? "property-card-premium" : "property-card-list"}
                          onClick={() => isAdminView ? handleViewProperty(property.id) : navigate(`/house/${property.id}`)}
                        >
                          <div className="property-image">
                            <img src={property.imageUrl} alt={property.address} onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop")} />
                            <div className="property-badges">
                            </div>
                            {!isAdminView && (
                              <button className={`favorite-btn-premium ${favorites.has(property.id) ? "active" : ""}`} onClick={(e) => handleFavoriteClick(property.id, e)}>
                                <FontAwesomeIcon icon={favorites.has(property.id) ? faHeartSolid : faHeartOutline} />
                              </button>
                            )}
                          </div>
                          <div className="property-details">
                            <div className="property-header-row">
                              <div className="property-price">{formatPriceWithIcon(property.price)}</div>
                              <div className="property-rating">
                                <FontAwesomeIcon icon={faStar} />
                                <span>{property.rating || 0}</span>
                                {property.rating === 0 && <span style={{ fontSize: '0.7rem', color: '#666' }}> (нет отзывов)</span>}
                              </div>
                            </div>
                           <div className="property-address">
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> 
                            {property.city}, {property.street}
                            {property.houseNumber && `, ${property.houseNumber}`}
                          </div>
                            <div className="property-features">
                              <span><FontAwesomeIcon icon={faBed} /> {property.beds} комн.</span>
                              <span><FontAwesomeIcon icon={faBath} /> {property.baths}</span>
                              <span><FontAwesomeIcon icon={faRulerCombined} /> {property.area} м²</span>
                              <span><FontAwesomeIcon icon={faClock} /> {property.year}</span>
                            </div>
                            <p className="property-description">{property.description}</p>
                            <div className="property-tags">
                              {property.features.map((feat, idx) => (
                                <span key={idx} className="tag-premium">
                                  <FontAwesomeIcon icon={getFeatureIcon(feat)} /> {feat}
                                </span>
                              ))}
                            </div>
                            <div className="property-actions">
                              {isAdminView ? (
                                <>
                                  <button className="btn-premium-secondary-profile" onClick={(e) => { e.stopPropagation(); handleViewProperty(property.id); }}>
                                    <FontAwesomeIcon icon={faEye} /> Просмотр
                                  </button>
                                  <button className="btn-premium-danger-profile" onClick={(e) => handleDeleteProperty(property.id, e)} disabled={deletingProperty === property.id}>
                                    {deletingProperty === property.id ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faTrash} /> Удалить</>}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button className="btn-premium-primary" onClick={(e) => { e.stopPropagation(); navigate(`/house/${property.id}`); }}>
                                    Подробнее
                                  </button>
                                  <button className="btn-premium-outline" onClick={(e) => handleOpenChat(property.id, e)} disabled={creatingChatForProperty === property.id}>
                                    {creatingChatForProperty === property.id ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faComment} /> Чат</>}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-premium">
                      <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      {getPageNumbers().map((page, idx) => 
                        page === 'ellipsis' ? <span key={idx} className="ellipsis"><FontAwesomeIcon icon={faEllipsisH} /></span> :
                        <button key={idx} className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => paginate(page as number)}>{page}</button>
                      )}
                      <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </main>
    </>
  );
};

export default Catalog;