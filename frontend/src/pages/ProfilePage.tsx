import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faHome, faComment, faEnvelope, faCalendarAlt,
  faHistory, faHeadset, faSignOutAlt, faEdit, faTimes,
  faSave, faPlus, faPaperPlane, faEraser, faCheckDouble,
  faCheck, faTrash, faBed, faRulerCombined, faMapMarkerAlt,
  faPause, faPlay, faClock, faCheckCircle, faTag, faUpload,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';
import './ProfilePage.css';
import OfferServiceModal from '../components/OfferServiceModal';
import CateringMenu from '../components/CateringMenu';

// ==================== Интерфейсы ====================
interface UserData {
  id: number;
  email: string;
  fio: string;
  phone_num: string;
  id_agent: boolean;
}

interface ApiHouse {
  id?: number;
  Id?: number;
  price?: number;
  Price?: number;
  area?: number;
  Area?: number;
  description?: string;
  Description?: string;
  active?: boolean;
  Active?: boolean;
  houseType?: string;
  HouseType?: string;
  announcementData?: string;
  AnnouncementData?: string;
  mainPhoto?: string | null;
  MainPhoto?: string | null;
  houseInfo?: {
    City?: string;
    city?: string;
    Street?: string;
    street?: string;
    HouseNumber?: string;
    houseNumber?: string;
    Rooms?: number;
    rooms?: number;
  };
  HouseInfo?: {
    City?: string;
    city?: string;
    Street?: string;
    street?: string;
    HouseNumber?: string;
    houseNumber?: string;
    Rooms?: number;
    rooms?: number;
  };
  rentType?: string;
  RentType?: string;
}

interface AdData {
  Id: number;
  Price: number;
  Area: number;
  Description: string;
  Active: boolean;
  HouseType: string;
  AnnouncementData: string;
  MainPhoto: string | null;
  HouseInfo: {
    City: string;
    Street: string;
    HouseNumber: string;
    Rooms: number;
  };
  RentType?: string;
}

interface FeedbackData {
  id: number;
  topic: string;
  text: string;
  created_at: string;
  user: {
    fio: string;
    email: string;
  };
}

interface ChatData {
  id: number;
  user_id: number;
  ad_id: number;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  ad_title: string;
  user_name: string;
  user_avatar: string;
}

interface BookingRequest {
  id: number;
  houseId: number;
  houseAddress: string;
  mainPhoto: string | null;
  bookingDate: string;
  createdAt: string;
  userName: string;
  userId: number;
}

interface UserBooking {
  id: number;
  houseId: number;
  houseAddress: string;
  mainPhoto: string | null;
  bookingDate: string;
  approved: boolean;
  rejectedAt: string | null;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: ApiHouse[];
  message?: string;
}

interface ChatApiResponse {
  success: boolean;
  data?: ChatData[];
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
  displayName: string;
  portfolioPhotos?: string[];
  price?: number | null;
}

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

type ProfileTab = 'profile' | 'ads' | 'chats' | 'support' | 'requests' | 'bookings' | 'history' | 'menu';

// ==================== Вспомогательные функции ====================
const safeFormatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU');
};

const isValidTab = (tab: string): tab is ProfileTab => {
  return ['profile', 'ads', 'chats', 'support', 'requests', 'bookings', 'history', 'menu'].includes(tab);
};

// ==================== Компонент ====================
const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' });
  
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    const saved = sessionStorage.getItem('profileLastTab');
    return isValidTab(saved || '') ? saved as ProfileTab : 'profile';
  });
  
  const [userAds, setUserAds] = useState<AdData[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState<FeedbackData[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [userChats, setUserChats] = useState<ChatData[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [deletingFeedback, setDeletingFeedback] = useState<number | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<BookingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingRequest[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);
  const [historyBookings, setHistoryBookings] = useState<UserBooking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [agentData, setAgentData] = useState<AgentProfileData | null>(null);
  const [editingAgent, setEditingAgent] = useState(false);
  const [editedAgent, setEditedAgent] = useState<Partial<AgentProfileData>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCateringOwner, setIsCateringOwner] = useState(false);

  const navigate = useNavigate();

  const topicTranslations: Record<string, string> = {
    technical: 'Технические проблемы',
    account: 'Вопросы по аккаунту',
    ad: 'Проблемы с объявлениями',
    other: 'Другое',
  };

  // ==================== API вызовы ====================
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }
      const response = await fetch('http://localhost:5213/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setEditedData(data);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCateringStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5213/api/catering/my-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const newStatus = data.isOwner;
        if (newStatus !== isCateringOwner) {
          setIsCateringOwner(newStatus);
          if (newStatus === true) {
            setMessage({ text: 'Поздравляем! Ваша заявка на кейтеринг одобрена. Теперь вам доступно управление меню.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: 'success' }), 5000);
            if (activeTab !== 'profile' && activeTab !== 'requests' && activeTab !== 'menu' && activeTab !== 'support') {
              setActiveTab('profile');
            }
          }
        }
      }
    } catch (error) {
      console.error('Ошибка обновления статуса кейтеринга:', error);
    }
  }, [isCateringOwner, activeTab]);

  const fetchAgentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/agents/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAgentData(result.data);
          setEditedAgent({ ...result.data, portfolioPhotos: result.data.portfolioPhotos || [] });
          setPortfolioPhotos(result.data.portfolioPhotos || []);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rent_app');
    formData.append('cloud_name', 'dnblbt7wc');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dnblbt7wc/image/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка загрузки фото', type: 'error' });
      return null;
    }
  };

  const handleAgentPhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setEditedAgent(prev => ({ ...prev, photo: url }));
    }
    setUploadingPhoto(false);
  };

  const handleUploadPortfolioPhoto = async (file: File) => {
    if (!agentData || !editingAgent) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Требуется авторизация', type: 'error' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingPortfolio(true);
    try {
      const response = await fetch(`http://localhost:5213/api/agents/${agentData.id}/upload-portfolio`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await response.json();
      if (response.ok && result.success && result.url) {
        const newPhotos = [...portfolioPhotos, result.url];
        setPortfolioPhotos(newPhotos);
        setEditedAgent(prev => ({ ...prev, portfolioPhotos: newPhotos }));
        setMessage({ text: 'Фото добавлено', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 2000);
      } else {
        setMessage({ text: result.message || 'Ошибка загрузки', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleRemovePortfolioPhoto = async (index: number) => {
    if (!agentData || !editingAgent) return;
    const newPhotos = portfolioPhotos.filter((_, i) => i !== index);
    setPortfolioPhotos(newPhotos);
    setEditedAgent(prev => ({ ...prev, portfolioPhotos: newPhotos }));
    setMessage({ text: 'Фото удалено из списка (сохраните изменения)', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 2000);
  };

  const handleAgentSave = async () => {
    if (!agentData) return;
    try {
      const token = localStorage.getItem('token');
      const payload = {
        Fio: editedAgent.fio,
        Phone: editedAgent.phone,
        Specialization: editedAgent.specialization,
        Experience: editedAgent.experience,
        Photo: editedAgent.photo,
        DisplayName: editedAgent.displayName,
        PortfolioPhotos: portfolioPhotos,
        Price: editedAgent.price
      };

      const response = await fetch(`http://localhost:5213/api/agents/${agentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ text: 'Данные организатора обновлены', type: 'success' });
        setEditingAgent(false);
        fetchAgentProfile();
        fetchUserData();
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
      } else {
        setMessage({ text: result.message || 'Ошибка обновления', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    }
  };

  const fetchUserAds = async () => {
    try {
      setAdsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: 'Требуется авторизация', type: 'error' });
        return;
      }
      const response = await fetch('http://localhost:5213/api/houses/my-houses', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (result.success && result.data) {
          const formattedAds: AdData[] = result.data.map((house: ApiHouse) => ({
            Id: house.id || house.Id || 0,
            Price: house.price || house.Price || 0,
            Area: house.area || house.Area || 0,
            Description: house.description || house.Description || '',
            Active: house.active || house.Active || false,
            HouseType: house.houseType || house.HouseType || '',
            AnnouncementData: house.announcementData || house.AnnouncementData || '',
            MainPhoto: house.mainPhoto || house.MainPhoto || null,
            HouseInfo: {
              City: house.houseInfo?.City || house.HouseInfo?.city || house.houseInfo?.city || house.HouseInfo?.City || '',
              Street: house.houseInfo?.Street || house.HouseInfo?.street || house.houseInfo?.street || house.HouseInfo?.Street || '',
              HouseNumber: house.houseInfo?.HouseNumber || house.HouseInfo?.houseNumber || house.houseInfo?.houseNumber || house.HouseInfo?.HouseNumber || '',
              Rooms: house.houseInfo?.Rooms || house.HouseInfo?.rooms || house.houseInfo?.rooms || house.HouseInfo?.Rooms || 1,
            },
            RentType: house.rentType || house.RentType || 'day',
          }));
          setUserAds(formattedAds);
        } else {
          setMessage({ text: result.message || 'Ошибка загрузки объявлений', type: 'error' });
        }
      } else {
        setMessage({ text: 'Ошибка сервера', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    } finally {
      setAdsLoading(false);
    }
  };

  const fetchUserFeedback = async () => {
    try {
      setFeedbackLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/support/my-feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) setUserFeedback(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchUserChats = async () => {
    try {
      setChatsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/chats/my-chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result: ChatApiResponse = await response.json();
        if (result.success) {
          setUserChats(result.data || []);
          const unread = (result.data || []).reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
          setTotalUnread(unread);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChatsLoading(false);
    }
  };

  const fetchIncomingRequests = async () => {
    setRequestsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5213/api/bookings/incoming-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setIncomingRequests(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUpcomingBookings = async () => {
    setUpcomingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5213/api/bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUpcomingBookings(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setUpcomingLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    setUserBookingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5213/api/bookings/user-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const bookings: UserBooking[] = (data.data as RawUserBooking[]).map(b => ({
          id: b.id,
          houseId: b.houseId,
          houseAddress: b.houseAddress,
          mainPhoto: b.mainPhoto,
          bookingDate: b.bookingDate,
          approved: b.approved,
          rejectedAt: b.rejectedAt,
          createdAt: b.createdAt
        }));
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUserBookingsLoading(false);
    }
  };

  const fetchHistoryBookings = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5213/api/bookings/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const bookings: UserBooking[] = (data.data as RawUserBooking[]).map(b => ({
          id: b.id,
          houseId: b.houseId,
          houseAddress: b.houseAddress,
          mainPhoto: b.mainPhoto,
          bookingDate: b.bookingDate,
          approved: b.approved,
          rejectedAt: b.rejectedAt,
          createdAt: b.createdAt
        }));
        setHistoryBookings(bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatPriceWithIcon = (price: number, rentType?: string): React.ReactNode => {
    const numberStr = price?.toLocaleString('ru-RU') || '0';
    const suffix = rentType === 'month' ? '/мес' : '/сутки';
    return (
      <>
        {numberStr} <i className="nbrb-icon">&#xe901;</i>{suffix}
      </>
    );
  };

  // ==================== Обработчики действий ====================
  const handleApproveRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5213/api/bookings/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
        fetchUpcomingBookings();
        setMessage({ text: 'Заявка подтверждена', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
        window.dispatchEvent(new CustomEvent('bookingsStatusChanged'));
        window.dispatchEvent(new CustomEvent('notificationsUpdate'));
        if (activeTab === 'bookings') fetchUserBookings();
        if (activeTab === 'history') fetchHistoryBookings();
      } else {
        alert('Ошибка подтверждения');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!window.confirm('Отклонить заявку?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5213/api/bookings/${requestId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
        setMessage({ text: 'Заявка отклонена', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
        window.dispatchEvent(new CustomEvent('bookingsStatusChanged'));
        window.dispatchEvent(new CustomEvent('notificationsUpdate'));
        if (activeTab === 'bookings') fetchUserBookings();
        if (activeTab === 'history') fetchHistoryBookings();
      } else {
        alert('Ошибка отклонения');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) setEditedData(userData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedData) setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (!editedData) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fio: editedData.fio,
          email: editedData.email,
          phone_num: editedData.phone_num,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setEditedData(data);
        setIsEditing(false);
        setMessage({ text: 'Профиль успешно обновлен!', type: 'success' });

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.fio = data.fio;
          user.email = data.email;
          user.phone_num = data.phone_num;
          localStorage.setItem('user', JSON.stringify(user));
        }
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ text: error.message || 'Ошибка обновления', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const messageText = formData.get('message') as string;
    const topic = formData.get('topic') as string;
    if (!topic || !messageText.trim()) {
      setMessage({ text: 'Заполните все поля', type: 'error' });
      return;
    }
    if (messageText.length > 2000) {
      setMessage({ text: 'Сообщение не более 2000 символов', type: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, text: messageText }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ text: 'Обращение отправлено!', type: 'success' });
        (e.target as HTMLFormElement).reset();
        fetchUserFeedback();
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
      } else {
        setMessage({ text: result.message || 'Ошибка отправки', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    }
  };

  const handleDeleteAd = async (adId: number) => {
    if (!window.confirm('Удалить объявление?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/houses/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUserAds(userAds.filter((ad) => ad.Id !== adId));
        setMessage({ text: 'Объявление удалено', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
      } else {
        setMessage({ text: result.message || 'Ошибка удаления', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    }
  };

  const handleToggleActive = async (adId: number, currentActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/houses/${adId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !currentActive }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUserAds((prev) => prev.map((ad) => (ad.Id === adId ? { ...ad, Active: !currentActive } : ad)));
        setMessage({ text: result.message || `Объявление ${!currentActive ? 'активировано' : 'деактивировано'}`, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
      } else {
        setMessage({ text: result.message || 'Ошибка изменения статуса', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    }
  };

  const handleViewAndEditAd = (adId: number) => {
    sessionStorage.setItem('profileLastTab', activeTab);
    navigate(`/edit-house/${adId}`);
  };
  
  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!window.confirm('Удалить обращение?')) return;
    try {
      setDeletingFeedback(feedbackId);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/support/${feedbackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUserFeedback(userFeedback.filter((f) => f.id !== feedbackId));
        setMessage({ text: 'Обращение удалено', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
      } else {
        setMessage({ text: result.message || 'Ошибка удаления', type: 'error' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingFeedback(null);
    }
  };

  const handleChatClick = (chatId: number) => {
    sessionStorage.setItem('profileLastTab', activeTab);
    navigate(`/chat/${chatId}`);
  };

  const handleMarkAsRead = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5213/api/chats/${chatId}/mark-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserChats();
      window.dispatchEvent(new CustomEvent('notificationsUpdate'));
    } catch (error) {
      console.error(error);
    }
  };

  const translateTopic = (topic: string) => topicTranslations[topic] || topic;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('profileLastTab');
    window.dispatchEvent(new CustomEvent('userLoggedIn'));
    window.location.href = '/';
  };

  // ==================== Эффекты ====================
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userData) return;
    const intervalId = setInterval(() => {
      refreshCateringStatus();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [userData, refreshCateringStatus]);

  useEffect(() => {
    const handleNotificationsUpdate = () => {
      refreshCateringStatus();
    };
    window.addEventListener('notificationsUpdate', handleNotificationsUpdate);
    return () => window.removeEventListener('notificationsUpdate', handleNotificationsUpdate);
  }, [refreshCateringStatus]);

  useEffect(() => {
    if (activeTab === 'profile') {
      refreshCateringStatus();
    }
  }, [activeTab, refreshCateringStatus]);

  useEffect(() => {
    if (userData) {
      refreshCateringStatus();
      if (userData.id_agent) fetchAgentProfile();
    }
  }, [userData, refreshCateringStatus]);

  useEffect(() => {
    sessionStorage.setItem('profileLastTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleUserLoggedIn = () => {
      fetchUserData();
      setActiveTab('profile');
      sessionStorage.removeItem('profileLastTab');
    };
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, []);

  useEffect(() => {
    if (activeTab === 'ads' && userData && !isCateringOwner) fetchUserAds();
  }, [activeTab, userData, isCateringOwner]);

  useEffect(() => {
    if (activeTab === 'support' && userData) fetchUserFeedback();
  }, [activeTab, userData]);

  useEffect(() => {
    if (activeTab === 'chats' && userData && !isCateringOwner) fetchUserChats();
  }, [activeTab, userData, isCateringOwner]);

  useEffect(() => {
    if (activeTab === 'requests' && userData) {
      fetchIncomingRequests();
      fetchUpcomingBookings();
    }
    if (activeTab === 'bookings' && userData && !isCateringOwner) fetchUserBookings();
    if (activeTab === 'history' && userData && !isCateringOwner) fetchHistoryBookings();
  }, [activeTab, userData, isCateringOwner]);

  // ==================== Рендер ====================
  if (loading) {
    return (
      <div className="profilepage-loading">
        <div className="profilepage-spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className="profilepage-error">
        <div className="profilepage-error-content">
          <h2>Ошибка загрузки профиля</h2>
          <p>Пожалуйста, войдите в систему</p>
          <Link to="/" className="profilepage-btn-primary">На главную</Link>
        </div>
      </div>
    );
  }

  const renderBookingStatus = (booking: UserBooking) => {
    const isExpired = !booking.approved && !booking.rejectedAt && new Date(booking.bookingDate) < new Date();
    if (booking.approved === true) {
      return { text: 'Подтверждено', class: 'confirmed', icon: faCheckCircle };
    }
    if (booking.rejectedAt !== null) {
      return { text: 'Отклонено', class: 'rejected', icon: faTimes };
    }
    if (isExpired) {
      return { text: 'Не состоялось', class: 'expired', icon: faClock };
    }
    return { text: 'Ожидает подтверждения', class: 'pending', icon: faClock };
  };

  return (
    <div className="profilepage-container">
      <div className="profilepage-sidebar">
        <div className="profilepage-avatar">
          <div className="profilepage-avatar-circle">
            {userData.fio.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </div>
          <h3>{userData.fio}</h3>
          <p className="profilepage-email">{userData.email}</p>
          <div className={`profilepage-role ${userData.id_agent ? 'profilepage-agent' : 'profilepage-user'}`}>
            <span className="profilepage-role-dot"></span>
            {isCateringOwner ? 'Владелец кейтеринга' : (userData.id_agent ? 'Организатор праздников' : 'Пользователь')}
          </div>
        </div>
        <nav className="profilepage-nav">
          <button className={`profilepage-nav-item ${activeTab === 'profile' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('profile')}>
            <FontAwesomeIcon icon={faUser} className="profilepage-nav-icon" />
            <span>Мой профиль</span>
          </button>

          {isCateringOwner ? (
            <>
              <button className={`profilepage-nav-item ${activeTab === 'requests' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('requests')}>
                <FontAwesomeIcon icon={faEnvelope} className="profilepage-nav-icon" />
                <span>Заявки</span>
              </button>
              <button className={`profilepage-nav-item ${activeTab === 'menu' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('menu')}>
                <FontAwesomeIcon icon={faUtensils} className="profilepage-nav-icon" />
                <span>Меню</span>
              </button>
            </>
          ) : (
            <>
              <button className={`profilepage-nav-item ${activeTab === 'ads' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('ads')}>
                <FontAwesomeIcon icon={faHome} className="profilepage-nav-icon" />
                <span>Мои объявления</span>
              </button>
              <button className={`profilepage-nav-item ${activeTab === 'chats' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('chats')}>
                <FontAwesomeIcon icon={faComment} className="profilepage-nav-icon" />
                <span>Мои чаты</span>
                {totalUnread > 0 && <span className="profilepage-nav-badge profilepage-nav-badge-unread">{totalUnread}</span>}
              </button>
              {userData && (
                <button className={`profilepage-nav-item ${activeTab === 'requests' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('requests')}>
                  <FontAwesomeIcon icon={faEnvelope} className="profilepage-nav-icon" />
                  <span>Заявки</span>
                </button>
              )}
              <button className={`profilepage-nav-item ${activeTab === 'bookings' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('bookings')}>
                <FontAwesomeIcon icon={faCalendarAlt} className="profilepage-nav-icon" />
                <span>Бронирования</span>
              </button>
              <button className={`profilepage-nav-item ${activeTab === 'history' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('history')}>
                <FontAwesomeIcon icon={faHistory} className="profilepage-nav-icon" />
                <span>История</span>
              </button>
            </>
          )}

          <button className={`profilepage-nav-item ${activeTab === 'support' ? 'profilepage-nav-active' : ''}`} onClick={() => setActiveTab('support')}>
            <FontAwesomeIcon icon={faHeadset} className="profilepage-nav-icon" />
            <span>Поддержка</span>
          </button>

          <div className="profilepage-nav-divider"></div>
          <button className="profilepage-nav-item profilepage-nav-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="profilepage-nav-icon" />
            <span>Выйти</span>
          </button>
        </nav>
      </div>

      <div className="profilepage-content">
        {message.text && (
          <div className={`profilepage-message ${message.type}`}>
            <div className="profilepage-message-content">{message.text}</div>
            <button className="profilepage-message-close" onClick={() => setMessage({ text: '', type: 'success' })}>&times;</button>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мой профиль</h2>
                <p>Управление личной информацией</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={`profilepage-btn-${isEditing ? 'secondary' : 'primary'}`} onClick={handleEditToggle}>
                  {isEditing ? <><FontAwesomeIcon icon={faTimes} /> Отменить</> : <><FontAwesomeIcon icon={faEdit} /> Редактировать</>}
                </button>
                {!isCateringOwner && (
                  <button className="profilepage-btn-secondary" onClick={() => setIsOfferModalOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} /> Предложить услугу
                  </button>
                )}
              </div>
            </div>
            <div className="profilepage-info">
              <div className="profilepage-info-section">
                <h3 className="profilepage-section-title">Личная информация</h3>
                <div className="profilepage-info-stack">
                  <div className="profilepage-info-stack-item">
                    <div className="profilepage-stack-header">
                      <label className="profilepage-stack-label">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedData?.email || ''}
                          onChange={handleInputChange}
                          className="profilepage-stack-input"
                          placeholder="example@mail.com"
                        />
                      ) : (
                        <div className="profilepage-stack-value">{userData.email}</div>
                      )}
                    </div>
                    <div className="profilepage-stack-hint">
                      {isEditing ? 'Введите новый email' : ''}
                    </div>
                  </div>
                  <div className="profilepage-stack-divider"></div>

                  <div className="profilepage-info-stack-item">
                    <div className="profilepage-stack-header">
                      <label className="profilepage-stack-label">Имя и фамилия</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="fio"
                          value={editedData?.fio || ''}
                          onChange={handleInputChange}
                          className="profilepage-stack-input"
                          placeholder="Иванов Иван"
                        />
                      ) : (
                        <div className="profilepage-stack-value">{userData.fio}</div>
                      )}
                    </div>
                  </div>
                  <div className="profilepage-stack-divider"></div>

                  <div className="profilepage-info-stack-item">
                    <div className="profilepage-stack-header">
                      <label className="profilepage-stack-label">Телефон</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone_num"
                          value={editedData?.phone_num || ''}
                          onChange={handleInputChange}
                          className="profilepage-stack-input"
                          placeholder="+375 (XX) XXX-XX-XX"
                        />
                      ) : (
                        <div className="profilepage-stack-value">{userData.phone_num || 'Не указан'}</div>
                      )}
                    </div>
                  </div>
                  <div className="profilepage-stack-divider"></div>

                  <div className="profilepage-info-stack-item">
                    <div className="profilepage-stack-header">
                      <label className="profilepage-stack-label">Статус аккаунта</label>
                      <div className={`profilepage-stack-value profilepage-role-badge ${userData.id_agent ? 'profilepage-agent' : 'profilepage-user'}`}>
                        <span className="profilepage-badge-dot"></span>
                        {isCateringOwner ? 'Владелец кейтеринга' : (userData.id_agent ? 'Организатор праздников' : 'Обычный пользователь')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isEditing && (
                <div className="profilepage-actions">
                  <button className="profilepage-btn-primary profilepage-save-btn" onClick={handleSaveChanges}>
                    <FontAwesomeIcon icon={faSave} /> Сохранить изменения
                  </button>
                </div>
              )}

              {userData.id_agent && agentData && !isCateringOwner && (
                <div className="profilepage-info-section" style={{ marginTop: '40px' }}>
                  <h3 className="profilepage-section-title">Профиль организатора</h3>
                  <div className="profilepage-info-stack">
                    <div className="profilepage-info-stack-item">
                      <div className="profilepage-stack-header">
                        <label className="profilepage-stack-label">О себе</label>
                        {editingAgent ? (
                          <textarea
                            value={editedAgent.displayName || ''}
                            onChange={(e) => setEditedAgent({ ...editedAgent, displayName: e.target.value })}
                            className="profilepage-stack-input profilepage-bio-textarea"
                            rows={10}
                            placeholder="Расскажите о себе, вашем опыте организации праздников, специализации..."
                          />
                        ) : (
                          <div className="profilepage-stack-value profilepage-bio-text" style={{ whiteSpace: 'pre-wrap' }}>
                            {agentData.displayName || 'Не указано'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="profilepage-stack-divider" />

                    <div className="profilepage-info-stack-item">
                      <div className="profilepage-stack-header">
                        <label className="profilepage-stack-label">Специализация</label>
                        {editingAgent ? (
                          <input
                            type="text"
                            value={editedAgent.specialization || ''}
                            onChange={(e) => setEditedAgent({ ...editedAgent, specialization: e.target.value })}
                            className="profilepage-stack-input"
                            placeholder="Например: Организация корпоративов, Свадьбы, Детские праздники"
                          />
                        ) : (
                          <div className="profilepage-stack-value">
                            <FontAwesomeIcon icon={faTag} style={{ marginRight: '8px', opacity: 0.7 }} />
                            {agentData.specialization || 'Не указана'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="profilepage-stack-divider" />

                    <div className="profilepage-info-stack-item">
                      <div className="profilepage-stack-header">
                        <label className="profilepage-stack-label">Опыт (лет)</label>
                        {editingAgent ? (
                          <input
                            type="number"
                            value={editedAgent.experience || 0}
                            onChange={(e) => setEditedAgent({ ...editedAgent, experience: parseInt(e.target.value) || 0 })}
                            className="profilepage-stack-input"
                          />
                        ) : (
                          <div className="profilepage-stack-value">{agentData.experience} лет</div>
                        )}
                      </div>
                    </div>
                    <div className="profilepage-stack-divider" />

                    <div className="profilepage-info-stack-item">
                      <div className="profilepage-stack-header">
                        <label className="profilepage-stack-label">Цена услуги (BYN)</label>
                        {editingAgent ? (
                          <input
                            type="number"
                            value={editedAgent.price ?? ''}
                            onChange={(e) => setEditedAgent({
                              ...editedAgent,
                              price: e.target.value ? parseFloat(e.target.value) : null
                            })}
                            className="profilepage-stack-input"
                            placeholder="Например: 500"
                            step="50"
                            min="0"
                          />
                        ) : (
                          <div className="profilepage-stack-value">
                            {agentData.price ? (
                              <>
                                {agentData.price.toLocaleString('ru-RU')} <i className="nbrb-icon">&#xe901;</i>
                              </>
                            ) : 'Не указана'}
                          </div>
                        )}
                      </div>
                      <div className="profilepage-stack-hint">
                        Стоимость организации мероприятия (свадьба, корпоратив, детский праздник)
                      </div>
                    </div>
                    <div className="profilepage-stack-divider" />

                    <div className="profilepage-info-stack-item">
                      <div className="profilepage-stack-header">
                        <label className="profilepage-stack-label">Фото</label>
                        {editingAgent ? (
                          <div className="profilepage-photo-edit">
                            {editedAgent.photo ? (
                              <div className="profilepage-photo-preview">
                                <img src={editedAgent.photo} alt="Фото организатора" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                <button
                                  type="button"
                                  className="profilepage-btn-delete-photo"
                                  onClick={() => setEditedAgent({ ...editedAgent, photo: '' })}
                                >
                                  <FontAwesomeIcon icon={faTrash} /> Удалить
                                </button>
                              </div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleAgentPhotoUpload(e.target.files[0]);
                                }}
                              />
                            )}
                            {uploadingPhoto && <div className="profilepage-spinner-small"></div>}
                          </div>
                        ) : (
                          <div className="profilepage-stack-value">
                            {agentData.photo ? (
                              <img src={agentData.photo} alt="Фото организатора" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : 'Нет фото'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="profilepage-info-stack-item">
                      <div className="profilepage-stack-header">
                        <label className="profilepage-stack-label">Фотографии работ (портфолио)</label>
                        {editingAgent && (
                          <div className="portfolio-upload-area">
                            <label htmlFor="portfolioUpload" className="profilepage-btn-secondary" style={{ display: 'inline-flex', gap: '8px', cursor: 'pointer' }}>
                              <FontAwesomeIcon icon={faUpload} /> Добавить фото
                            </label>
                            <input
                              type="file"
                              id="portfolioUpload"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleUploadPortfolioPhoto(e.target.files[0]);
                                e.target.value = '';
                              }}
                              disabled={uploadingPortfolio}
                            />
                            {uploadingPortfolio && <div className="profilepage-spinner-small"></div>}
                          </div>
                        )}
                      </div>
                      {portfolioPhotos.length === 0 ? (
                        <div className="profilepage-stack-value" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Нет добавленных работ</div>
                      ) : (
                        <div className="portfolio-grid-mini">
                          {portfolioPhotos.map((url, idx) => (
                            <div key={idx} className="portfolio-item-mini">
                              <img src={url} alt={`Работа ${idx + 1}`} />
                              {editingAgent && (
                                <button
                                  type="button"
                                  className="portfolio-remove-mini"
                                  onClick={() => handleRemovePortfolioPhoto(idx)}
                                  title="Удалить"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {editingAgent && (
                        <div className="profilepage-stack-hint">Добавьте фотографии ваших лучших работ (свадьбы, корпоративы и т.д.)</div>
                      )}
                    </div>
                  </div>
                  {editingAgent ? (
                    <div className="profilepage-actions" style={{ marginTop: '30px', textAlign: 'right' }}>
                      <button className="profilepage-btn-primary" onClick={handleAgentSave}>Сохранить</button>
                      <button className="profilepage-btn-secondary" onClick={() => { setEditingAgent(false); setEditedAgent(agentData); setPortfolioPhotos(agentData.portfolioPhotos || []); }} style={{ marginLeft: '12px' }}>Отмена</button>
                    </div>
                  ) : (
                    <div className="profilepage-organizer-edit-button">
                      <button className="profilepage-btn-secondary" onClick={() => setEditingAgent(true)}>
                        <FontAwesomeIcon icon={faEdit} /> Редактировать профиль организатора
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ads' && !isCateringOwner && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мои объявления</h2>
                <p>Управление вашими объявлениями о недвижимости</p>
              </div>
              <Link to="/create-ad" className="profilepage-btn-primary">
                <FontAwesomeIcon icon={faPlus} /> Добавить объявление
              </Link>
            </div>
            <div className="profilepage-ads-stats">
              <div className="profilepage-stat-card">
                <div className="profilepage-stat-number">{userAds.length}</div>
                <div className="profilepage-stat-label">Всего объявлений</div>
              </div>
              <div className="profilepage-stat-card">
                <div className="profilepage-stat-number">{userAds.filter((ad) => ad.Active).length}</div>
                <div className="profilepage-stat-label">Активных</div>
              </div>
              <div className="profilepage-stat-card">
                <div className="profilepage-stat-number">{userAds.filter((ad) => !ad.Active).length}</div>
                <div className="profilepage-stat-label">Неактивных</div>
              </div>
            </div>
            <div className="profilepage-ads-container">
              {adsLoading ? (
                <div className="profilepage-ads-loading">
                  <div className="profilepage-loading-spinner profilepage-small"></div>
                  <p>Загрузка объявлений...</p>
                </div>
              ) : userAds.length > 0 ? (
                <div className="profilepage-ads-list">
                  {userAds.map((ad) => (
                    <div key={ad.Id} className={`profilepage-ad-item ${!ad.Active ? 'profilepage-inactive' : ''}`}>
                      <div className="profilepage-ad-item-image">
                        <img src={ad.MainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'} alt={ad.Description} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'; }} />
                        <div className={`profilepage-ad-status ${ad.Active ? 'profilepage-active' : 'profilepage-inactive'}`}>
                          {ad.Active ? 'Активно' : 'Неактивно'}
                        </div>
                      </div>
                      <div className="profilepage-ad-item-content">
                        <div className="profilepage-ad-item-header">
                          <h3>{formatPriceWithIcon(ad.Price, ad.RentType)}</h3>
                          <div className="profilepage-ad-type">{ad.HouseType}</div>
                        </div>
                        <div className="profilepage-ad-item-address">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          {ad.HouseInfo?.City}, {ad.HouseInfo?.Street}
                          {ad.HouseInfo?.HouseNumber && `, ${ad.HouseInfo.HouseNumber}`}
                        </div>
                        <div className="profilepage-ad-item-info">
                          <span><FontAwesomeIcon icon={faBed} /> {ad.HouseInfo?.Rooms} комн.</span>
                          <span><FontAwesomeIcon icon={faRulerCombined} /> {ad.Area} м²</span>
                          <span><FontAwesomeIcon icon={faCalendarAlt} /> {safeFormatDate(ad.AnnouncementData)}</span>
                        </div>
                        <p className="profilepage-ad-item-description">
                          {ad.Description?.length > 150 ? ad.Description.substring(0, 150) + '...' : ad.Description}
                        </p>
                        <div className="profilepage-ad-item-actions">
                          <button className="profilepage-btn-primary" onClick={() => handleViewAndEditAd(ad.Id)}>
                            <FontAwesomeIcon icon={faEdit} /> Редактировать
                          </button>
                          <button className={`profilepage-btn-status ${ad.Active ? 'profilepage-btn-warning' : 'profilepage-btn-success'}`} onClick={() => handleToggleActive(ad.Id, ad.Active)}>
                            <FontAwesomeIcon icon={ad.Active ? faPause : faPlay} /> {ad.Active ? ' Деактивировать' : ' Активировать'}
                          </button>
                          <button className="profilepage-btn-danger" onClick={() => handleDeleteAd(ad.Id)}>
                            <FontAwesomeIcon icon={faTrash} /> Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profilepage-ads-empty">
                  <div className="profilepage-empty-illustration"></div>
                  <h3>У вас пока нет объявлений</h3>
                  <p>Разместите свое первое объявление о недвижимости</p>
                  <Link to="/create-ad" className="profilepage-btn-primary">
                    <FontAwesomeIcon icon={faPlus} /> Создать объявление
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chats' && !isCateringOwner && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мои чаты</h2>
                <p>Общение с пользователями по вашим объявлениям</p>
              </div>
              {totalUnread > 0 && (
                <button className="profilepage-btn-secondary" onClick={() => { userChats.forEach((chat) => { if (chat.unread_count > 0) handleMarkAsRead(chat.id); }); }}>
                  <FontAwesomeIcon icon={faCheckDouble} /> Прочитать все
                </button>
              )}
            </div>
            <div className="profilepage-chats-container">
              {chatsLoading ? (
                <div className="profilepage-chats-loading">
                  <div className="profilepage-loading-spinner profilepage-small"></div>
                  <p>Загрузка чатов...</p>
                </div>
              ) : userChats.length > 0 ? (
                <div className="profilepage-chats-list">
                  {userChats.map((chat) => (
                    <div key={chat.id} className={`profilepage-chat-item ${chat.unread_count > 0 ? 'profilepage-unread' : ''}`} onClick={() => handleChatClick(chat.id)}>
                      <div className="profilepage-chat-avatar">
                        {chat.user_avatar ? <img src={chat.user_avatar} alt={chat.user_name} /> : <div className="profilepage-avatar-placeholder">{chat.user_name?.split(' ').map((n) => n[0]).join('').toUpperCase()}</div>}
                        {chat.unread_count > 0 && <span className="profilepage-chat-unread-badge">{chat.unread_count}</span>}
                      </div>
                      <div className="profilepage-chat-info">
                        <div className="profilepage-chat-header">
                          <h4 className="profilepage-chat-user">{chat.user_name}</h4>
                          <span className="profilepage-chat-time">{safeFormatDate(chat.last_message_time)}</span>
                        </div>
                        <div className="profilepage-chat-ad-title">{chat.ad_title}</div>
                        <p className="profilepage-chat-last-message">{chat.last_message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profilepage-chats-empty">
                  <div className="profilepage-empty-illustration profilepage-chat-illustration">
                    <FontAwesomeIcon icon={faComment} size="3x" />
                  </div>
                  <h3>У вас пока нет чатов</h3>
                  <p>Когда пользователи начнут писать вам по объявлениям, здесь появятся чаты</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Заявки</h2>
                <p>{isCateringOwner ? 'Управление заказами на кейтеринг' : 'Управление заявками на бронирование'}</p>
              </div>
            </div>
            {isCateringOwner ? (
              <div className="profilepage-info">
                <p>Раздел в разработке. Здесь будут отображаться заказы на кейтеринг от клиентов.</p>
              </div>
            ) : (
              <>
                <div className="profilepage-section">
                  <h3 className="profilepage-section-title">Предстоящие бронирования</h3>
                  {upcomingLoading ? (
                    <div className="profilepage-loading-placeholder">
                      <div className="profilepage-loading-spinner profilepage-small"></div>
                      <p>Загрузка...</p>
                    </div>
                  ) : upcomingBookings.length === 0 ? (
                    <p className="profilepage-empty-text">Нет предстоящих бронирований</p>
                  ) : (
                    <div className="profilepage-bookings-list">
                      {upcomingBookings.map((b) => (
                        <div key={b.id} className="profilepage-booking-card">
                          <div className="booking-card-image">
                            <img src={b.mainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'} alt="House" />
                            <div className="booking-status-badge confirmed">Подтверждено</div>
                          </div>
                          <div className="booking-card-info">
                            <h4>{b.houseAddress}</h4>
                            <p>Гость: {b.userName}</p>
                            <p>Дата: {safeFormatDate(b.bookingDate)}</p>
                            <p>Дата заявки: {safeFormatDate(b.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="profilepage-section">
                  <h3 className="profilepage-section-title">Новые заявки</h3>
                  {requestsLoading ? (
                    <div className="profilepage-loading-placeholder">
                      <div className="profilepage-loading-spinner profilepage-small"></div>
                      <p>Загрузка...</p>
                    </div>
                  ) : incomingRequests.length === 0 ? (
                    <p className="profilepage-empty-text">Нет новых заявок</p>
                  ) : (
                    <div className="profilepage-requests-list">
                      {incomingRequests.map((req) => (
                        <div key={req.id} className="profilepage-request-card">
                          <div className="request-card-image">
                            <img src={req.mainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'} alt="House" />
                          </div>
                          <div className="request-card-info">
                            <h4>{req.houseAddress}</h4>
                            <p>От: {req.userName}</p>
                            <p>Дата бронирования: {safeFormatDate(req.bookingDate)}</p>
                            <p>Заявка создана: {safeFormatDate(req.createdAt)}</p>
                          </div>
                          <div className="request-card-actions">
                            <button className="profilepage-btn-approve" onClick={() => handleApproveRequest(req.id)}><FontAwesomeIcon icon={faCheck} /> Принять</button>
                            <button className="profilepage-btn-reject" onClick={() => handleRejectRequest(req.id)}><FontAwesomeIcon icon={faTimes} /> Отклонить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bookings' && !isCateringOwner && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мои бронирования</h2>
                <p>Статус ваших заявок на бронирование</p>
              </div>
            </div>
            {userBookingsLoading ? (
              <div className="profilepage-loading-placeholder">
                <div className="profilepage-loading-spinner profilepage-small"></div>
                <p>Загрузка...</p>
              </div>
            ) : userBookings.length === 0 ? (
              <p className="profilepage-empty-text">У вас пока нет бронирований</p>
            ) : (
              <div className="profilepage-bookings-list modern">
                {userBookings.map((b) => {
                  const status = renderBookingStatus(b);
                  return (
                    <div key={b.id} className="profilepage-booking-card">
                      <div className="booking-card-image">
                        <img src={b.mainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'} alt="House" />
                        <div className={`booking-status-badge ${status.class}`}>
                          <FontAwesomeIcon icon={status.icon} /> {status.text}
                        </div>
                      </div>
                      <div className="booking-card-info">
                        <h4>{b.houseAddress}</h4>
                        <p>Дата заезда: {safeFormatDate(b.bookingDate)}</p>
                        <p>Забронировано: {safeFormatDate(b.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && !isCateringOwner && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Моя история бронирований</h2>
                <p>Прошедшие бронирования</p>
              </div>
            </div>
            {historyLoading ? (
              <div className="profilepage-loading-placeholder">
                <div className="profilepage-loading-spinner profilepage-small"></div>
                <p>Загрузка...</p>
              </div>
            ) : historyBookings.length === 0 ? (
              <p className="profilepage-empty-text">Нет прошедших бронирований</p>
            ) : (
              <div className="profilepage-bookings-list history">
                {historyBookings.map((b) => {
                  const status = renderBookingStatus(b);
                  return (
                    <div key={b.id} className="profilepage-booking-card past">
                      <div className="booking-card-image">
                        <img src={b.mainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'} alt="House" />
                        <div className={`booking-status-badge ${status.class}`}>
                          <FontAwesomeIcon icon={status.icon} /> {status.text}
                        </div>
                      </div>
                      <div className="booking-card-info">
                        <h4>{b.houseAddress}</h4>
                        <p>Дата заезда: {safeFormatDate(b.bookingDate)}</p>
                        <p>Забронировано: {safeFormatDate(b.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && isCateringOwner && (
          <CateringMenu />
        )}

        {activeTab === 'support' && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Поддержка</h2>
                <p>Свяжитесь с нашей службой поддержки</p>
              </div>
            </div>
            <div className="profilepage-support-container">
              <div className="profilepage-support-form-container">
                <h3 className="profilepage-section-title">Форма обращения</h3>
                <form className="profilepage-support-form" onSubmit={handleSupportSubmit}>
                  <div className="profilepage-form-group">
                    <label htmlFor="topic" className="profilepage-form-label">Тема обращения <span className="profilepage-required">*</span></label>
                    <select id="topic" name="topic" className="profilepage-support-select" required>
                      <option value="">Выберите тему</option>
                      <option value="technical">Технические проблемы</option>
                      <option value="account">Вопросы по аккаунту</option>
                      <option value="ad">Проблемы с объявлениями</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="profilepage-form-group">
                    <label htmlFor="message" className="profilepage-form-label">Сообщение <span className="profilepage-required">*</span></label>
                    <textarea id="message" name="message" className="profilepage-support-textarea" placeholder="Опишите вашу проблему или вопрос подробно..." rows={6} required maxLength={2000} />
                    <div className="profilepage-textarea-counter">Максимум 2000 символов</div>
                  </div>
                  <div className="profilepage-form-actions">
                    <button type="submit" className="profilepage-btn-primary"><FontAwesomeIcon icon={faPaperPlane} /> Отправить обращение</button>
                    <button type="reset" className="profilepage-btn-secondary"><FontAwesomeIcon icon={faEraser} /> Очистить форму</button>
                  </div>
                </form>
                <div className="profilepage-feedback-history">
                  <h4 className="profilepage-section-title">История обращений</h4>
                  {feedbackLoading ? (
                    <div className="profilepage-loading-placeholder"><div className="profilepage-loading-spinner profilepage-small"></div><p>Загрузка истории...</p></div>
                  ) : userFeedback.length > 0 ? (
                    <div className="profilepage-feedback-list">
                      {userFeedback.map((feedback) => (
                        <div key={feedback.id} className="profilepage-feedback-item">
                          <div className="profilepage-feedback-header">
                            <div className="profilepage-feedback-topic">{translateTopic(feedback.topic)}</div>
                            <div className="profilepage-feedback-date">
                              {safeFormatDate(feedback.created_at)}
                              <button className="profilepage-btn-delete-feedback" onClick={(e) => { e.stopPropagation(); handleDeleteFeedback(feedback.id); }} disabled={deletingFeedback === feedback.id} title="Удалить обращение">
                                {deletingFeedback === feedback.id ? <div className="profilepage-spinner-small"></div> : <FontAwesomeIcon icon={faTrash} />}
                              </button>
                            </div>
                          </div>
                          <div className="profilepage-feedback-text">{feedback.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profilepage-empty-feedback"><p>У вас пока нет обращений в поддержку</p></div>
                  )}
                </div>
              </div>
              <div className="profilepage-support-info">
                <h3 className="profilepage-section-title">Контакты поддержки</h3>
                <div className="profilepage-contact-cards">
                  <div className="profilepage-contact-card"><div className="profilepage-contact-icon profilepage-email-icon"></div><h4>Электронная почта</h4><p>primehouse@gmail.com</p></div>
                  <div className="profilepage-contact-card"><div className="profilepage-contact-icon profilepage-phone-icon"></div><h4>Телефон</h4><p>+375 (29) 584-99-96</p><small>Бесплатно по Беларуси</small></div>
                  <div className="profilepage-contact-card"><div className="profilepage-contact-icon profilepage-hours-icon"></div><h4>Часы работы</h4><p>Пн-Пт: 9:00-18:00</p><small>Минское время</small></div>
                </div>
                <div className="profilepage-faq-section">
                  <h4 className="profilepage-section-title">Частые вопросы</h4>
                  <div className="profilepage-faq-list">
                    <details className="profilepage-faq-item"><summary>Как добавить объявление?</summary><p>Перейдите на вкладку "Мои объявления" и нажмите кнопку "Добавить объявление". Заполните все необходимые поля формы.</p></details>
                    <details className="profilepage-faq-item"><summary>Как редактировать профиль?</summary><p>Для редактирования профиля зайдите в раздел "Мой профиль" и нажмите кнопку "Редактировать".</p></details>
                    <details className="profilepage-faq-item"><summary>Как отвечать на сообщения в чатах?</summary><p>Перейдите во вкладку "Мои чаты", выберите диалог и напишите ответ.</p></details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <OfferServiceModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={() => {
          setMessage({ text: 'Заявка успешно отправлена администратору!', type: 'success' });
          setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
        }}
        onError={(errMsg) => setMessage({ text: errMsg, type: 'error' })}
      />
    </div>
  );
};

export default ProfilePage;