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
    id?: number;
    Id?: number;
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
    id?: number;
    Id?: number;
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
    id?: number;
    fio?: string;
    email?: string;
    phone_num?: string;
    avatar?: string;
  };
}

interface FavoriteCheckResponse {
  success: boolean;
  isFavorite: boolean;
  message?: string;
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

type IconType = typeof faCheck;

const HouseInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [house, setHouse] = useState<HouseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{
    id?: number;
    fio?: string;
    email?: string;
    phone_num?: string;
    avatar?: string;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);

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
      console.log('🔑 Проверка авторизации, токен:', token ? 'есть' : 'нет');
      
      if (token) {
        try {
          const payload = decodeToken(token);
          
          if (payload) {
            console.log('📋 Payload токена:', payload);
            
            const userId = payload.userId || payload.sub || payload.nameid || payload.unique_name;
            
            if (userId) {
              console.log('✅ Найден User ID:', userId);
              setCurrentUserId(parseInt(userId));
              localStorage.setItem('currentUserId', userId.toString());
            } else {
              console.log('❌ User ID не найден в токене');
            }
            
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

  const checkIfFavorite = useCallback(async () => {
    if (!id || !currentUserId) {
      setIsFavorite(false);
      setCheckingFavorite(false);
      return;
    }

    try {
      setCheckingFavorite(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsFavorite(false);
        setCheckingFavorite(false);
        return;
      }

      const response = await fetch(`http://localhost:5213/api/favorites/check/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: FavoriteCheckResponse = await response.json();
        if (data.success) {
          setIsFavorite(data.isFavorite);
          console.log(`✅ Проверка избранного: ${data.isFavorite ? 'В избранном' : 'Не в избранном'}`);
        } else {
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке избранного:', error);
      setIsFavorite(false);
    } finally {
      setCheckingFavorite(false);
    }
  }, [id, currentUserId]);

  useEffect(() => {
    if (id && currentUserId) {
      checkIfFavorite();
    }
  }, [id, currentUserId, checkIfFavorite]);

  const canLeaveReview = (): boolean => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔐 Нет токена - нельзя оставить отзыв');
      return false;
    }
    
    if (isAdmin) {
      console.log('🚫 Пользователь - администратор, нельзя оставить отзыв');
      return false;
    }
    
    if (isOwner) {
      console.log('🚫 Пользователь - владелец, нельзя оставить отзыв на свое объявление');
      return false;
    }
    
    if (!currentUserId) {
      console.log('❌ Нет User ID - нельзя оставить отзыв');
      return false;
    }
    
    console.log('✅ Пользователь может оставить отзыв');
    return true;
  };

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

  const fetchAlternativeOwnerInfo = useCallback(async () => {
    if (!id) return null;
    
    try {
      console.log('🔄 Пробуем альтернативный путь получения owner info...');
      const API_URL = 'http://localhost:5213/api';
      
      const response = await fetch(`${API_URL}/houses/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (result.success && result.data) {
          if (result.data.owner?.id || result.data.owner?.Id) {
            const ownerIdValue = result.data.owner.id || result.data.owner.Id;
            console.log('✅ Найден ID владельца в данных дома:', ownerIdValue);
            setOwnerId(ownerIdValue || null);
            setOwnerInfo({
              id: ownerIdValue,
              fio: result.data.owner.fio,
              email: result.data.owner.email,
              phone_num: result.data.owner.phone_num
            });
            return {
              id: ownerIdValue || 0,
              fio: result.data.owner.fio || '',
              email: result.data.owner.email || '',
              phone_num: result.data.owner.phone_num || '',
              id_agent: false
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Ошибка в альтернативном методе:', error);
      return null;
    }
  }, [id]);

  const fetchOwnerInfo = useCallback(async (owner: { email?: string; fio?: string; phone_num?: string; avatar?: string; id?: number; Id?: number }) => {
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
            if (result.data.id) {
              setOwnerId(result.data.id);
            }
          }
        }
      } else {
        const idToSet = owner.id || owner.Id;
        setOwnerInfo({
          id: idToSet,
          fio: owner.fio,
          email: owner.email,
          phone_num: owner.phone_num,
          avatar: owner.avatar
        });
        if (idToSet) {
          setOwnerId(idToSet);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке информации о владельце:', error);
      const idToSet = owner.id || owner.Id;
      setOwnerInfo({
        id: idToSet,
        fio: owner.fio,
        email: owner.email,
        phone_num: owner.phone_num,
        avatar: owner.avatar
      });
      if (idToSet) {
        setOwnerId(idToSet);
      }
    }
  }, []);

  const fetchHouseOwnerInfo = useCallback(async () => {
    if (!id) return null;
    
    try {
      console.log('🔍 Запрос информации о владельце дома...');
      const API_URL = 'http://localhost:5213/api';
      
      const response = await fetch(`${API_URL}/houses/${id}/owner-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Статус ответа owner-info:', response.status);
      
      if (response.ok) {
        const result: OwnerInfoResponse = await response.json();
        if (result.success && result.data) {
          console.log('✅ Информация о владельце получена:', result.data);
          setOwnerId(result.data.id);
          setOwnerInfo({
            id: result.data.id,
            fio: result.data.fio,
            email: result.data.email,
            phone_num: result.data.phone_num
          });
          return result.data;
        }
      } else {
        console.log('❌ Ошибка при получении owner-info:', response.status);
        return await fetchAlternativeOwnerInfo();
      }
      return null;
    } catch (error) {
      console.error('❌ Ошибка при получении информации о владельце:', error);
      return null;
    }
  }, [id, fetchAlternativeOwnerInfo]);

  const checkExistingChat = async (ownerId: number): Promise<number | null> => {
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
            chat.user_id === ownerId && chat.ad_id === parseInt(id!)
          );
          
          if (existingChat) {
            console.log('✅ Найден существующий чат:', existingChat.id);
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

  const handleStartChat = async () => {
    if (!id) {
      alert('Невозможно начать чат: ID дома не найден');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для начала чата необходимо авторизоваться');
      navigate('/login');
      return;
    }

    if (isOwner) {
      alert('Вы не можете написать себе по своему объявлению');
      return;
    }

    if (isAdmin) {
      alert('Администратор может писать только в ответ на сообщения пользователей');
      return;
    }

    setCheckingOwner(true);
    try {
      console.log('💬 Начало создания чата:', {
        houseId: id,
        currentUserId,
        isOwner,
        isAdmin,
        ownerId,
        ownerInfo
      });

      let finalOwnerId = ownerId;
      
      if (!finalOwnerId) {
        console.log('🔄 Получаем ID владельца с сервера...');
        const ownerInfoFromServer = await fetchHouseOwnerInfo();
        if (ownerInfoFromServer) {
          finalOwnerId = ownerInfoFromServer.id;
          console.log('✅ Получен ID владельца с сервера:', finalOwnerId);
          
          if (ownerInfoFromServer.email?.toLowerCase() === 'admin@gmail.com') {
            alert('Вы не можете написать администратору. Пожалуйста, свяжитесь с поддержкой через форму обратной связи.');
            setCheckingOwner(false);
            return;
          }
        }
      }

      if (!finalOwnerId) {
        console.error('❌ Не удалось определить ID владельца после всех попыток');
        alert('Не удалось определить владельца объявления. Пожалуйста, попробуйте позже.');
        return;
      }

      if (finalOwnerId === currentUserId) {
        alert('Вы не можете написать себе');
        return;
      }

      console.log('🔍 Проверяем существующий чат с владельцем:', finalOwnerId);
      const existingChatId = await checkExistingChat(finalOwnerId);
      
      if (existingChatId) {
        console.log('🚀 Переходим в существующий чат:', existingChatId);
        navigate(`/chat/${existingChatId}`);
        return;
      }

      console.log('➕ Создаем новый чат с владельцем:', finalOwnerId);
      const response = await fetch('http://localhost:5213/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          otherUserId: finalOwnerId,
          houseId: parseInt(id)
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('🎉 Чат создан:', result);
        navigate(`/chat/${result.data.chat_id}`);
      } else {
        console.error('❌ Ошибка создания чата:', result);
        alert(result.message || 'Ошибка при создании чата');
      }
    } catch (error) {
      console.error('❌ Ошибка при создании чата:', error);
      alert('Не удалось создать чат. Попробуйте позже.');
    } finally {
      setCheckingOwner(false);
    }
  };

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
          const transformedData = transformApiDataToHouseInfo(result.data);
          setHouse(transformedData);
          
          fetchReviews();
          
          if (result.data.owner) {
            fetchOwnerInfo(result.data.owner);
          }
          
          if (currentUserId) {
            try {
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
            } catch (error) {
              console.error('Ошибка при проверке владельца:', error);
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

  const handleStarClickUnauthorized = () => {
    alert('Для оценки необходимо авторизоваться');
    navigate('/login');
  };

  const handleTextareaClickUnauthorized = () => {
    alert('Для оставления отзыва необходимо авторизоваться');
    navigate('/login');
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для добавления в избранное необходимо авторизоваться');
      navigate('/login');
      return;
    }

    if (!id) {
      alert('Ошибка: ID дома не найден');
      return;
    }

    if (isAdmin) {
      alert('Администраторы не могут добавлять в избранное');
      return;
    }

    setTogglingFavorite(true);
    try {
      if (isFavorite) {
        const response = await fetch(`http://localhost:5213/api/favorites/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsFavorite(false);
            console.log('✅ Удалено из избранного:', id);
          } else {
            alert(data.message || 'Ошибка при удалении из избранного');
          }
        } else {
          alert('Ошибка при удалении из избранного');
        }
      } else {
        const response = await fetch(`http://localhost:5213/api/favorites/add/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsFavorite(true);
            console.log('✅ Добавлено в избранное:', id);
          } else {
            alert(data.message || 'Ошибка при добавлении в избранное');
          }
        } else {
          alert('Ошибка при добавлении в избранное');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при изменении избранного:', error);
      alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleSubmitReview = async () => {
    console.log('🔄 handleSubmitReview called');
    console.log('📊 Current state:', {
      id, 
      currentUserId, 
      isAdmin,
      isOwner,
      textLength: newReview.text.length,
      text: newReview.text
    });
    
    if (!id) {
      alert('Ошибка: ID дома не найден');
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

    if (isOwner) {
      alert('Владелец не может оставлять отзыв на свое объявление');
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

    if (newReview.text.length > 1000) {
      alert('Текст отзыва не должен превышать 1000 символов');
      return;
    }

    try {
      setSubmittingReview(true);
      const API_URL = 'http://localhost:5213/api';
      
      console.log('📤 Sending review with data:', {
        rating: newReview.rating,
        text: newReview.text.trim(),
      });

      const response = await fetch(`${API_URL}/houses/${id}/reviews`, {
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
        fetchReviews();
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

  const formatAnnouncementDate = (dateString: string) => {
    try {
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

  const formatReviewDate = (dateString: string) => {
    try {
      if (!dateString) return 'Дата не указана';
      
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

  const handleCall = () => {
    if (ownerInfo?.phone_num) {
      window.location.href = `tel:${ownerInfo.phone_num}`;
    } else {
      alert('Телефон владельца не указан');
    }
  };

  const canLeaveReviewResult = canLeaveReview();
  
  console.log('🔐 canLeaveReview check:', {
    hasToken: !!localStorage.getItem('token'),
    currentUserId,
    isAdmin,
    isOwner,
    canLeaveReview: canLeaveReviewResult
  });

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
          <button className="back-button-house" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} />
            Назад
          </button>

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

          <section className="property-info-section-house">
            <div className="property-layout-house">
              <div className="main-content-house">
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

                <div className="description-section-house">
                  <h3>Описание дома</h3>
                  {house.description ? (
                    <p>{house.description}</p>
                  ) : (
                    <p>Описание отсутствует</p>
                  )}
                </div>

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

                <div className="reviews-section-house">
                  <h3>Отзывы о доме</h3>
                  
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
                            onClick={canLeaveReviewResult ? 
                              () => setNewReview({ ...newReview, rating: star }) : 
                              handleStarClickUnauthorized}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="review-text-house">
                      <textarea
                        value={newReview.text}
                        onChange={canLeaveReviewResult ? 
                          (e) => setNewReview({ ...newReview, text: e.target.value }) : 
                          undefined}
                        onClick={!canLeaveReviewResult ? handleTextareaClickUnauthorized : undefined}
                        placeholder={canLeaveReviewResult ? 
                          "Расскажите о вашем опыте (минимум 10 символов)..." :
                          "Для оставления отзыва необходимо авторизоваться"}
                        rows={4}
                        maxLength={1000}
                        readOnly={!canLeaveReviewResult}
                      />
                      <div className="char-count">
                        {newReview.text.length}/1000 символов
                        {newReview.text.length < 10 && (
                          <span className="char-warning"> (минимум 10 символов)</span>
                        )}
                      </div>
                    </div>
                    {canLeaveReviewResult ? (
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
                    ) : (
                      <button 
                        className="btn-primary-house"
                        onClick={() => navigate('/login')}
                      >
                        {isAdmin ? 'Администраторы не могут оставлять отзывы' : 
                         isOwner ? 'Владельцы не могут оставлять отзывы на свое объявление' : 
                         'Войти для отправки отзыва'}
                      </button>
                    )}
                    
                  </div>

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
                          
                          {review.owner_reply && (
                            <div className="owner-reply-house">
                              <div className="owner-reply-header">
                                <FontAwesomeIcon icon={faReply} />
                                <strong>Ответ владельца:</strong>
                              </div>
                              <p className="owner-reply-text">{review.owner_reply}</p>
                            </div>
                          )}
                          
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

              <div className="sidebar-house">
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
                      {ownerInfo?.email === 'admin@gmail.com' && (
                        <p className="admin-badge-house">(Администратор)</p>
                      )}
                    </div>
                  </div>
                  <div className="contact-actions-house">
                    {ownerInfo?.phone_num && (
                      <button className="btn-primary-house full-width-house" onClick={handleCall}>
                        <FontAwesomeIcon icon={faPhone} />
                        Позвонить владельцу
                      </button>
                    )}
                    
                    {!isOwner && ownerInfo?.email !== 'admin@gmail.com' && (
                      <button 
                        className="btn-primary-house full-width-house chat-button"
                        onClick={handleStartChat}
                        style={{ marginTop: '10px' }}
                        disabled={checkingOwner}
                      >
                        <FontAwesomeIcon icon={faComment} />
                        {checkingOwner ? ' Загрузка...' : ' Написать владельцу'}
                      </button>
                    )}
                    
                    {ownerInfo?.email === 'admin@gmail.com' && (
                      <div className="admin-chat-notice">
                        <p><strong>Это объявление администратора.</strong></p>
                        <p>Для связи используйте форму обратной связи в профиле.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="contact-meta-house">
                    <div className="meta-item-house">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{announcementDate}</span>
                    </div>
                  </div>
                </div>

                <div className="action-buttons-house">
                  {checkingFavorite ? (
                    <button 
                      className="btn-outline-house full-width-house"
                      disabled
                    >
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Проверка...
                    </button>
                  ) : (
                    <button 
                      className={`btn-outline-house full-width-house ${isFavorite ? 'active-favorite' : ''}`}
                      onClick={toggleFavorite}
                      disabled={togglingFavorite || isAdmin}
                    >
                      {togglingFavorite ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={isFavorite ? faHeart : faHeartRegular} />
                          {isFavorite ? 'В избранном' : 'В избранное'}
                        </>
                      )}
                    </button>
                  )}
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