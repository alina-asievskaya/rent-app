import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { flushSync } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart as faHeartSolid,
  faUser,
  faTimes,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faEnvelope,
  faPhone,
  faLock,
  faUser as faUserIcon,
  faSignOutAlt,
  faShieldAlt,
  faComment,
  faBell,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import "./Header.css";

interface UserData {
  id: number;
  email: string;
  fio: string;
  phone_num: string;
  id_agent: boolean;
  token: string;
}

interface FavoriteItem {
  id: number;
  price: number;
  area: number;
  description: string;
  fullDescription: string;
  houseType: string;
  announcementData: string;
  photos: string[];
  city: string;
  street: string;
  rooms: number;
  bathrooms: number;
  floor: number;
  rating: number;
  isActive: boolean;
  year?: number;
  addedToFavorites?: string;
  rentType?: 'day' | 'month';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CountResponse {
  success: boolean;
  count: number;
  message?: string;
}

interface Notification {
  id: number;
  type: 'message' | 'booking' | 'bookingStatus';
  referenceId: number;
  text: string;
  createdAt: string;
}

interface RawChat {
  id: number;
  unread_count?: number;
  user_name?: string;
  ad_title?: string;
  last_message_time?: string;
}

interface RawBooking {
  id: number;
  userName?: string;
  createdAt?: string;
}

interface UserBookingStatus {
  id: number;
  approved: boolean;
  rejectedAt: string | null;
  bookingDate: string;
  houseAddress: string;
}

// Тип для сырого ответа от API /bookings/user-bookings
interface RawUserBooking {
  id: number;
  houseId: number;
  houseAddress: string;
  mainPhoto: string | null;
  bookingDate: string;
  approved: boolean;
  rejectedAt: string | null;
  createdAt: string;
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfilePage, setIsProfilePage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const [toasts, setToasts] = useState<Array<{
    id: number;
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>>([]);

  const [formData, setFormData] = useState({
    email: "",
    fio: "",
    password: "",
    confirmPassword: "",
    phone_num: ""
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userData, setUserData] = useState<UserData | null>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  const isAdmin = userData?.email?.toLowerCase() === 'admin@gmail.com';
  const shouldShowFavorites = isLoggedIn && !isAdmin;

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellBtnRef = useRef<HTMLButtonElement>(null);
  const isFetchingNotifications = useRef(false);
  const isFetchingBookings = useRef(false);

  // State for tracking user's own bookings (to detect status change)
  const [, setUserBookings] = useState<UserBookingStatus[]>([]);

  const favoritesDropdownRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLDivElement>(null);
  const favoritesBtnRef = useRef<HTMLButtonElement>(null);
  const isFetchingCount = useRef(false);
  const isFetchingList = useRef(false);

  // ---------- Helper functions ----------
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  // ---------- API calls ----------
  const fetchFavoritesCount = useCallback(async () => {
    if (isFetchingCount.current) return;
    try {
      isFetchingCount.current = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`http://localhost:5213/api/favorites/count?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return;
      const data: CountResponse = await response.json();
      if (data.success) {
        setFavoritesCount(data.count);
      }
    } catch (error) {
      console.error('Ошибка при получении количества избранного:', error);
    } finally {
      isFetchingCount.current = false;
    }
  }, []);

  const fetchFavoritesList = useCallback(async () => {
    if (isFetchingList.current) return;
    try {
      isFetchingList.current = true;
      setIsLoadingFavorites(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/favorites/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return;
      const data: ApiResponse<FavoriteItem[]> = await response.json();
      if (data.success) {
        setFavoritesList(data.data || []);
        setFavoritesCount(data.data?.length || 0);
      } else {
        setFavoritesList([]);
        setFavoritesCount(0);
      }
    } catch (error) {
      console.error('Ошибка при получении списка избранного:', error);
      setFavoritesList([]);
      setFavoritesCount(0);
    } finally {
      setIsLoadingFavorites(false);
      isFetchingList.current = false;
    }
  }, []);

  const markChatAsRead = useCallback(async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5213/api/chats/${chatId}/mark-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch user's own bookings to detect status changes
  const fetchUserBookingsStatus = useCallback(async () => {
    if (!isLoggedIn || isAdmin) return;
    if (isFetchingBookings.current) return;
    try {
      isFetchingBookings.current = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/bookings/user-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const newBookings: UserBookingStatus[] = (data.data as RawUserBooking[]).map(b => ({
          id: b.id,
          approved: b.approved,
          rejectedAt: b.rejectedAt,
          bookingDate: b.bookingDate,
          houseAddress: b.houseAddress,
        }));
        
        // Compare with previous state to generate notifications
        setUserBookings(prev => {
          const prevMap = new Map(prev.map(b => [b.id, b]));
          const newNotifications: Notification[] = [];

          for (const newB of newBookings) {
            const oldB = prevMap.get(newB.id);
            if (!oldB) continue; // new booking – no notification (it's already created by user)

            // Detect change from pending to approved
            if (oldB.approved === false && oldB.rejectedAt === null && newB.approved === true) {
              newNotifications.push({
                id: newB.id + 50000,
                type: 'bookingStatus',
                referenceId: newB.id,
                text: `Ваша заявка на бронирование "${newB.houseAddress}" подтверждена!`,
                createdAt: new Date().toISOString(),
              });
            }
            // Detect change from pending to rejected
            else if (oldB.approved === false && oldB.rejectedAt === null && newB.rejectedAt !== null) {
              newNotifications.push({
                id: newB.id + 50000,
                type: 'bookingStatus',
                referenceId: newB.id,
                text: `Ваша заявка на бронирование "${newB.houseAddress}" отклонена.`,
                createdAt: new Date().toISOString(),
              });
            }
          }

          if (newNotifications.length > 0) {
            setNotifications(prevNotifs => {
              const existingIds = new Set(prevNotifs.map(n => n.id));
              const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
              return [...uniqueNew, ...prevNotifs];
            });
          }

          return newBookings;
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса бронирований', error);
    } finally {
      isFetchingBookings.current = false;
    }
  }, [isLoggedIn, isAdmin]);

  // Main notification fetcher (messages and incoming requests for owner)
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn || isAdmin) return;
    if (isFetchingNotifications.current) return;
    try {
      isFetchingNotifications.current = true;
      const token = localStorage.getItem('token');
      if (!token) return;

      const [chatsRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5213/api/chats/my-chats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5213/api/bookings/incoming-requests', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const chatsJson = await chatsRes.json();
      const bookingsJson = await bookingsRes.json();

      const notifs: Notification[] = [];
      if (chatsJson.success && Array.isArray(chatsJson.data)) {
        (chatsJson.data as RawChat[]).filter(c => c.unread_count && c.unread_count > 0)
          .forEach(chat => {
            notifs.push({
              id: chat.id,
              type: 'message',
              referenceId: chat.id,
              text: `Новое сообщение от ${chat.user_name || 'пользователя'} по объявлению "${chat.ad_title || ''}"`,
              createdAt: chat.last_message_time || new Date().toISOString()
            });
          });
      }
      if (bookingsJson.success && Array.isArray(bookingsJson.data)) {
        (bookingsJson.data as RawBooking[]).forEach(booking => {
          notifs.push({
            id: booking.id + 10000,
            type: 'booking',
            referenceId: booking.id,
            text: `Новая заявка на бронирование от ${booking.userName || 'пользователя'}`,
            createdAt: booking.createdAt || new Date().toISOString()
          });
        });
      }

      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifs = notifs.filter(n => !existingIds.has(n.id));
        return [...newNotifs, ...prev];
      });
    } catch (error) {
      console.error('Ошибка загрузки уведомлений', error);
    } finally {
      isFetchingNotifications.current = false;
    }
  }, [isLoggedIn, isAdmin]);

  const resetUserData = useCallback(() => {
    setFavoritesCount(0);
    setFavoritesList([]);
    setNotifications([]);
    setUserBookings([]);
  }, []);

  // ---------- Effects ----------
  // Sync login state with localStorage changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const newIsLoggedIn = !!token;
    
    if (newIsLoggedIn !== isLoggedIn) {
      setIsLoggedIn(newIsLoggedIn);
      if (userStr) {
        setUserData(JSON.parse(userStr));
      } else {
        setUserData(null);
      }
    }
    setIsProfilePage(location.pathname === '/profile');
  }, [location.pathname, isLoggedIn]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      setIsLoggedIn(!!token);
      if (userStr) setUserData(JSON.parse(userStr));
      else setUserData(null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleUserLoggedIn = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUserData(JSON.parse(userStr));
      }
    };
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, []);

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchFavoritesCount();
      fetchNotifications();
      fetchUserBookingsStatus();
    } else {
      resetUserData();
    }
  }, [isLoggedIn, isAdmin, fetchFavoritesCount, fetchNotifications, fetchUserBookingsStatus, resetUserData]);

  // Periodic refresh
  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUserBookingsStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin, fetchNotifications, fetchUserBookingsStatus]);

  // Listen for explicit events from ProfilePage
  useEffect(() => {
    const handleNotificationsUpdate = () => {
      if (isLoggedIn && !isAdmin) {
        fetchNotifications();
      }
    };
    const handleBookingsStatusChange = () => {
      if (isLoggedIn && !isAdmin) {
        fetchUserBookingsStatus();
        fetchNotifications();
      }
    };
    window.addEventListener('notificationsUpdate', handleNotificationsUpdate);
    window.addEventListener('bookingsStatusChanged', handleBookingsStatusChange);
    return () => {
      window.removeEventListener('notificationsUpdate', handleNotificationsUpdate);
      window.removeEventListener('bookingsStatusChanged', handleBookingsStatusChange);
    };
  }, [isLoggedIn, isAdmin, fetchNotifications, fetchUserBookingsStatus]);

  // Load favorites list when dropdown opens
  useEffect(() => {
    if (showFavorites && isLoggedIn && !isAdmin && favoritesList.length === 0) {
      fetchFavoritesList();
    }
  }, [showFavorites, isLoggedIn, isAdmin, favoritesList.length, fetchFavoritesList]);

  useEffect(() => {
    const handleFavoritesUpdate = () => {
      if (isLoggedIn && !isAdmin) fetchFavoritesCount();
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [isLoggedIn, isAdmin, fetchFavoritesCount]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFavorites && 
          favoritesDropdownRef.current && 
          !favoritesDropdownRef.current.contains(event.target as Node) &&
          favoritesBtnRef.current &&
          !favoritesBtnRef.current.contains(event.target as Node)) {
        setShowFavorites(false);
      }
      if (showNotifications &&
          notificationRef.current &&
          !notificationRef.current.contains(event.target as Node) &&
          bellBtnRef.current &&
          !bellBtnRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userBtnRef.current && !userBtnRef.current.contains(event.target as Node)) {
        const dropdown = userBtnRef.current.querySelector('.user-dropdown');
        if (dropdown && dropdown.classList.contains('show')) dropdown.classList.remove('show');
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFavorites) setShowFavorites(false);
        if (showNotifications) setShowNotifications(false);
        if (userBtnRef.current) {
          const dropdown = userBtnRef.current.querySelector('.user-dropdown');
          if (dropdown && dropdown.classList.contains('show')) dropdown.classList.remove('show');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showFavorites, showNotifications]);

  // ---------- UI action handlers ----------
  const openAuthModal = useCallback((isLogin: boolean) => {
    setIsLoginForm(isLogin);
    setShowAuthModal(true);
    setFormData({
      email: "",
      fio: "",
      password: "",
      confirmPassword: "",
      phone_num: ""
    });
    setShowFavorites(false);
  }, []);

  const toggleFavorites = useCallback(() => {
    if (!isLoggedIn) {
      openAuthModal(true);
      return;
    }
    if (isAdmin) {
      showToast('Администраторы не могут использовать избранное', 'info');
      return;
    }
    setShowFavorites(prev => !prev);
  }, [isLoggedIn, isAdmin, showToast, openAuthModal]);

  const removeFromFavorites = useCallback(async (houseId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`http://localhost:5213/api/favorites/remove/${houseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data: ApiResponse<{ message: string }> = await response.json();
        if (data.success) {
          setFavoritesList(prev => prev.filter(item => item.id !== houseId));
          setFavoritesCount(prev => prev - 1);
          if (favoritesCount - 1 === 0) setShowFavorites(false);
          showToast('Удалено из избранного', 'success');
          window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        }
      } else {
        showToast('Ошибка при удалении из избранного', 'error');
      }
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      showToast('Ошибка при удалении из избранного', 'error');
    }
  }, [favoritesCount, showToast]);

  const clearFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/favorites/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data: ApiResponse<{ message: string; removedCount: number }> = await response.json();
        if (data.success) {
          setFavoritesList([]);
          setFavoritesCount(0);
          setShowFavorites(false);
          showToast('Избранное очищено', 'success');
          window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке избранного:', error);
      showToast('Ошибка при очистке избранного', 'error');
    }
  }, [showToast]);

  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5213/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data: ApiResponse<UserData> = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        setIsLoggedIn(true);
        setUserData(data.data);
        setShowAuthModal(false);
        setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
        
        if (data.data.email.toLowerCase() !== 'admin@gmail.com') {
          await fetchFavoritesCount();
          await fetchNotifications();
          await fetchUserBookingsStatus();
        }
        
        flushSync(() => {});
        
        if (data.data.email.toLowerCase() === 'admin@gmail.com') {
          navigate('/admin');
          showToast('Вход выполнен успешно. Добро пожаловать в административную панель!', 'success');
        } else {
          navigate('/profile');
          showToast('Вход выполнен успешно!', 'success');
        }
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
      } else {
        if (data.message?.toLowerCase().includes('неверный email или пароль')) {
          showToast('Неверный email или пароль', 'error');
        } else {
          showToast(data.message || 'Ошибка входа', 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      showToast('Ошибка соединения с сервером', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, formData.password, fetchFavoritesCount, fetchNotifications, fetchUserBookingsStatus, navigate, showToast]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.fio.trim()) {
      showToast("Введите имя и фамилию!", "warning");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Пароли не совпадают!", "error");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      showToast("Пароль должен содержать минимум 6 символов!", "warning");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5213/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fio: formData.fio,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone_num: formData.phone_num
        })
      });
      const data: ApiResponse<{ message: string; userId: number }> = await response.json();
      if (data.success) {
        const loginResponse = await fetch('http://localhost:5213/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const loginData: ApiResponse<UserData> = await loginResponse.json();
        if (loginData.success) {
          localStorage.setItem('token', loginData.data.token);
          localStorage.setItem('user', JSON.stringify(loginData.data));
          setIsLoggedIn(true);
          setUserData(loginData.data);
          setShowAuthModal(false);
          setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
          
          await fetchFavoritesCount();
          await fetchNotifications();
          await fetchUserBookingsStatus();
          flushSync(() => {});
          
          navigate('/profile');
          showToast('Регистрация прошла успешно! Добро пожаловать!', 'success');
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
        } else {
          showToast("Регистрация прошла успешно, но не удалось автоматически войти.", "info");
        }
      } else {
        if (data.message?.toLowerCase().includes('уже существует')) {
          showToast('Пользователь с таким email уже существует', 'error');
        } else {
          showToast(data.message || 'Ошибка регистрации', 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      showToast('Ошибка соединения с сервером', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, fetchFavoritesCount, fetchNotifications, fetchUserBookingsStatus, navigate, showToast]);

  const switchToRegister = useCallback(() => {
    setIsLoginForm(false);
    setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
  }, []);

  const switchToLogin = useCallback(() => {
    setIsLoginForm(true);
    setFormData({ email: "", fio: "", password: "", confirmPassword: "", phone_num: "" });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    resetUserData();
    setShowFavorites(false);
    setShowNotifications(false);
    navigate('/');
    showToast('Вы вышли из системы', 'info');
    window.dispatchEvent(new CustomEvent('userLoggedIn'));
  }, [navigate, showToast, resetUserData]);

  const toggleUserDropdown = useCallback(() => {
    if (userBtnRef.current) {
      const dropdown = userBtnRef.current.querySelector('.user-dropdown');
      if (dropdown) dropdown.classList.toggle('show');
    }
  }, []);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    setShowNotifications(false);
    if (notification.type === 'message') {
      await markChatAsRead(notification.referenceId);
      navigate(`/chat/${notification.referenceId}`);
      fetchNotifications();
    } else if (notification.type === 'booking') {
      navigate('/profile?tab=requests');
    } else if (notification.type === 'bookingStatus') {
      navigate('/profile?tab=bookings');
    }
  }, [navigate, markChatAsRead, fetchNotifications]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const headerClass = `header ${isProfilePage ? 'header-profile' : ''}`;

  const formatPriceWithIcon = useCallback((price: number, rentType?: 'day' | 'month'): React.ReactNode => {
    const numberStr = price.toLocaleString('ru-RU');
    const suffix = rentType === 'month' ? '/мес' : '/сутки';
    return (
      <>
        {numberStr} <i className="nbrb-icon">&#xe901;</i>{suffix}
      </>
    );
  }, []);

  const getMainImage = useCallback((photos: string[]): string => {
    return photos && photos.length > 0 
      ? photos[0] 
      : "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop";
  }, []);

  const truncateDescription = useCallback((description: string, maxLength: number = 30): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }, []);

  // ---------- Render ----------
  return (
    <>
      <header className={headerClass}>
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/photo/logo.png" alt="PrimeHouse logo" style={{ height: '32px', width: 'auto' }} />
              <h2>Prime<span>House</span></h2>
            </Link>
          </div>
          <ul className="nav-links">
            <li><Link to="/" className={isActive("/") ? "active" : ""}>Главная</Link></li>
            <li><Link to="/catalog" className={isActive("/catalog") ? "active" : ""}>Каталог</Link></li>
            <li><Link to="/agents" className={isActive("/agents") ? "active" : ""}>Организаторы</Link></li>
            <li><Link to="/about" className={isActive("/about") ? "active" : ""}>О нас</Link></li>
          </ul>
          <div className="nav-auth">
            {/* Notifications bell */}
            {isLoggedIn && !isAdmin && (
              <div className="nav-notifications">
                <button
                  ref={bellBtnRef}
                  className="nav-notifications-btn"
                  onClick={() => setShowNotifications(prev => !prev)}
                  aria-label="Уведомления"
                >
                  <FontAwesomeIcon icon={faBell} />
                  {notifications.length > 0 && (
                    <span className="notifications-badge">
                      {notifications.length > 99 ? '99+' : notifications.length}
                    </span>
                  )}
                </button>
                <div
                  ref={notificationRef}
                  className={`notifications-dropdown ${showNotifications ? 'show' : ''}`}
                >
                  <div className="notifications-dropdown-header">
                    <h4>Уведомления ({notifications.length})</h4>
                  </div>
                  <div className="notifications-items">
                    {notifications.length === 0 ? (
                      <div className="notifications-empty">
                        <FontAwesomeIcon icon={faBell} />
                        <p>Новых уведомлений нет</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className="notification-item"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon">
                            {notification.type === 'message' ? (
                              <FontAwesomeIcon icon={faComment} />
                            ) : (
                              <FontAwesomeIcon icon={faCalendarAlt} />
                            )}
                          </div>
                          <div className="notification-content">
                            <p>{notification.text}</p>
                            <span className="notification-time">
                              {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Favorites */}
            {shouldShowFavorites && (
              <div className="nav-favorites">
                <button 
                  ref={favoritesBtnRef}
                  className="nav-favorites-btn" 
                  onClick={toggleFavorites} 
                  aria-label="Избранное" 
                  disabled={isLoadingFavorites}
                >
                  {isLoadingFavorites ? (
                    <span className="loading-spinner-small"></span>
                  ) : (
                    <FontAwesomeIcon icon={faHeartSolid} />
                  )}
                  {favoritesCount > 0 && <span className="favorites-badge">{favoritesCount}</span>}
                </button>
                <div ref={favoritesDropdownRef} className={`favorites-dropdown ${showFavorites ? 'show' : ''}`}>
                  <div className="favorites-dropdown-header">
                    <h4>Избранное ({favoritesCount})</h4>
                    {favoritesCount > 0 && (
                      <button className="clear-favorites" onClick={clearFavorites} disabled={isLoadingFavorites}>
                        {isLoadingFavorites ? 'Очистка...' : 'Очистить'}
                      </button>
                    )}
                  </div>
                  <div className="favorites-items">
                    {isLoadingFavorites ? (
                      <div className="favorites-loading">
                        <span className="loading-spinner"></span>
                        <p>Загрузка избранного...</p>
                      </div>
                    ) : favoritesCount === 0 ? (
                      <div className="favorites-empty">
                        <FontAwesomeIcon icon={faHeartOutline} />
                        <p>В избранном пока ничего нет</p>
                        <p className="favorites-empty-hint">Нажмите на ♡ в каталоге, чтобы добавить дом в избранное</p>
                      </div>
                    ) : (
                      favoritesList.slice(0, 5).map(item => (
                        <div key={item.id} className="favorites-item">
                          <div className="favorites-item-image">
                            <img 
                              src={getMainImage(item.photos)} 
                              alt={truncateDescription(item.description)} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop";
                              }}
                            />
                          </div>
                          <div className="favorites-item-content">
                            <div className="favorites-item-title">{item.houseType} - {item.rooms} комн.</div>
                            <div className="favorites-item-price">
                              {formatPriceWithIcon(item.price, item.rentType || 'day')}
                            </div>
                            <div className="favorites-item-address">{item.city}, {item.street}</div>
                          </div>
                          <button className="favorites-item-remove" onClick={() => removeFromFavorites(item.id)} aria-label="Удалить из избранного" disabled={isLoadingFavorites}>
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ))
                    )}
                    {favoritesCount > 5 && !isLoadingFavorites && (
                      <div className="favorites-more"><span>... и еще {favoritesCount - 5} домов</span></div>
                    )}
                  </div>
                  {favoritesCount > 0 && !isLoadingFavorites && (
                    <div className="favorites-dropdown-footer">
                      <Link to="/favorites" className="view-all-favorites" onClick={() => setShowFavorites(false)}>
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        Перейти в избранное
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="nav-favorites">
                <button className="nav-favorites-btn" onClick={() => openAuthModal(true)} aria-label="Избранное">
                  <FontAwesomeIcon icon={faHeartSolid} />
                </button>
              </div>
            )}

            {/* User menu */}
            {isLoggedIn ? (
              <div className="user-profile-menu" ref={userBtnRef}>
                <button className="user-profile-link" onClick={toggleUserDropdown}>
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                    {isAdmin && <div className="admin-badge" title="Администратор"><FontAwesomeIcon icon={faShieldAlt} /></div>}
                  </div>
                </button>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowFavorites(false)}>
                    <FontAwesomeIcon icon={faUser} /><span>Профиль</span>
                  </Link>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /><span>Выйти</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button className="header-btn-secondary" onClick={() => openAuthModal(true)} disabled={isLoading}>
                  {isLoading ? 'Загрузка...' : 'Войти'}
                </button>
                <button className="header-btn-primary" onClick={() => openAuthModal(false)} disabled={isLoading}>
                  {isLoading ? 'Загрузка...' : 'Регистрация'}
                </button>
              </>
            )}
            <button className="mobile-menu-btn" aria-label="Меню" onClick={() => {}}>☰</button>
          </div>
        </nav>
      </header>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
            <div className="toast-icon">
              {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
              {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
              {toast.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
              {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
            </div>
            <div className="toast-content"><div className="toast-message">{toast.text}</div></div>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}><i className="fas fa-times"></i></button>
          </div>
        ))}
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={closeAuthModal}><FontAwesomeIcon icon={faTimes} /></button>
            <div className="auth-modal-header">
              <h2>{isLoginForm ? "Вход в аккаунт" : "Регистрация"}</h2>
              <p className="auth-modal-subtitle">{isLoginForm ? "Введите ваши данные для входа" : "Создайте новый аккаунт"}</p>
            </div>
            {isLoginForm ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@mail.ru" required className="auth-input" disabled={isLoading} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Введите пароль" required className="auth-input" disabled={isLoading} />
                    <button type="button" className="password-toggle-right" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>{isLoading ? "Загрузка..." : "Войти"}</button>
                <div className="auth-form-footer">
                  <p className="auth-switch-text">Нет аккаунта? <button type="button" className="auth-switch-btn" onClick={switchToRegister} disabled={isLoading}>Зарегистрироваться</button></p>
                </div>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@mail.ru" required className="auth-input" disabled={isLoading} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faUserIcon} className="input-icon" />
                    <input type="text" name="fio" value={formData.fio} onChange={handleInputChange} placeholder="Иванов Иван" required className="auth-input" disabled={isLoading} />
                  </div>
                  <small className="input-hint">Введите имя и фамилию</small>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faPhone} className="input-icon" />
                    <input type="tel" name="phone_num" value={formData.phone_num} onChange={handleInputChange} placeholder="+375 (XX) XXX-XX-XX" required className="auth-input" disabled={isLoading} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Придумайте пароль" required className="auth-input" disabled={isLoading} />
                    <button type="button" className="password-toggle-right" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Повторите пароль" required className="auth-input" disabled={isLoading} />
                    <button type="button" className="password-toggle-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>{isLoading ? "Загрузка..." : "Зарегистрироваться"}</button>
                <div className="auth-form-footer">
                  <p className="auth-switch-text">Уже есть аккаунт? <button type="button" className="auth-switch-btn" onClick={switchToLogin} disabled={isLoading}>Войти</button></p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;