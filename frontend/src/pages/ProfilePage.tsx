import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import Header from '../components/Header';

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
    Rooms?: number;
    rooms?: number;
  };
  HouseInfo?: {
    City?: string;
    city?: string;
    Street?: string;
    street?: string;
    Rooms?: number;
    rooms?: number;
  };
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
    Rooms: number;
  };
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

interface ApiResponse {
  success: boolean;
  data?: ApiHouse[];
  message?: string;
}

interface ChatApiResponse {
  success: boolean;
  data?: ChatData[];
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'}>({text: '', type: 'success'});
  const [activeTab, setActiveTab] = useState<'profile' | 'ads' | 'chats' | 'support'>('profile');
  const [userAds, setUserAds] = useState<AdData[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState<FeedbackData[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [userChats, setUserChats] = useState<ChatData[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [deletingFeedback, setDeletingFeedback] = useState<number | null>(null);
  const navigate = useNavigate();

  // Маппинг тем на русский язык
  const topicTranslations: Record<string, string> = {
    'technical': 'Технические проблемы',
    'account': 'Вопросы по аккаунту',
    'ad': 'Проблемы с объявлениями',
    'other': 'Другое'
  };

  useEffect(() => {
    fetchUserData();
  }, []);


  useEffect(() => {
    if (activeTab === 'ads' && userData) {
      fetchUserAds();
    }
  }, [activeTab, userData]);

  
  useEffect(() => {
    if (activeTab === 'support' && userData) {
      fetchUserFeedback();
    }
  }, [activeTab, userData]);

  
  useEffect(() => {
    if (activeTab === 'chats' && userData) {
      fetchUserChats();
    }
  }, [activeTab, userData]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('http://localhost:5213/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setEditedData(data);
      } else {
        console.error('Failed to fetch user data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAds = async () => {
    try {
      setAdsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({text: 'Требуется авторизация', type: 'error'});
        return;
      }

      const response = await fetch('http://localhost:5213/api/houses/my-houses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
              Rooms: house.houseInfo?.Rooms || house.HouseInfo?.rooms || house.houseInfo?.rooms || house.HouseInfo?.Rooms || 1
            }
          }));
          
          setUserAds(formattedAds);
        } else {
          setMessage({text: result.message || 'Ошибка загрузки объявлений', type: 'error'});
        }
      } else {
        setMessage({text: 'Ошибка сервера при загрузке объявлений', type: 'error'});
      }
    } catch (error) {
      console.error('Error fetching user ads:', error);
      setMessage({text: 'Ошибка соединения с сервером', type: 'error'});
    } finally {
      setAdsLoading(false);
    }
  };

  const fetchUserFeedback = async () => {
    try {
      setFeedbackLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/support/my-feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserFeedback(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching user feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchUserChats = async () => {
    try {
      setChatsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/chats/my-chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: ChatApiResponse = await response.json();
        if (result.success) {
          setUserChats(result.data || []);
          
          const unread = (result.data || []).reduce((sum: number, chat: ChatData) => sum + (chat.unread_count || 0), 0);
          setTotalUnread(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching user chats:', error);
    } finally {
      setChatsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditedData(userData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editedData) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fio: editedData.fio,
          phone_num: editedData.phone_num,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setIsEditing(false);
        setMessage({text: 'Профиль успешно обновлен!', type: 'success'});
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.fio = data.fio;
          user.phone_num = data.phone_num;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setTimeout(() => setMessage({text: '', type: 'success'}), 3000);
      } else {
        const error = await response.json();
        setMessage({text: error.message || 'Ошибка при обновлении профиля', type: 'error'});
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({text: 'Ошибка соединения с сервером', type: 'error'});
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
   
    const formData = new FormData(e.currentTarget);
    const messageText = formData.get('message') as string;
    const topic = formData.get('topic') as string;


    if (!topic || !messageText.trim()) {
      setMessage({text: 'Пожалуйста, заполните все обязательные поля', type: 'error'});
      return;
    }

    if (messageText.length > 2000) {
      setMessage({text: 'Сообщение не должно превышать 2000 символов', type: 'error'});
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          topic, 
          text: messageText
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage({text: result.message || 'Обращение успешно отправлено в поддержку!', type: 'success'});
        (e.target as HTMLFormElement).reset();
       
        fetchUserFeedback();
        setTimeout(() => setMessage({text: '', type: 'success'}), 3000);
      } else {
        setMessage({text: result.message || 'Ошибка при отправке сообщения', type: 'error'});
      }
    } catch (error) {
      console.error('Error sending support message:', error);
      setMessage({text: 'Ошибка соединения с сервером', type: 'error'});
    }
  };

  const handleDeleteAd = async (adId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/houses/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserAds(userAds.filter(ad => ad.Id !== adId));
        setMessage({text: result.message || 'Объявление успешно удалено', type: 'success'});
        setTimeout(() => setMessage({text: '', type: 'success'}), 3000);
      } else {
        setMessage({text: result.message || 'Ошибка при удалении объявления', type: 'error'});
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      setMessage({text: 'Ошибка соединения с сервером', type: 'error'});
    }
  };

  const handleToggleActive = async (adId: number, currentActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/houses/${adId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentActive })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        
        setUserAds(prev => prev.map(ad => 
          ad.Id === adId ? { ...ad, Active: !currentActive } : ad
        ));
        
        setMessage({text: result.message || `Объявление ${!currentActive ? 'активировано' : 'деактивировано'}`, type: 'success'});
        setTimeout(() => setMessage({text: '', type: 'success'}), 3000);
      } else {
        setMessage({text: result.message || 'Ошибка изменения статуса', type: 'error'});
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      setMessage({text: 'Ошибка соединения с сервером', type: 'error'});
    }
  };

  const handleViewAndEditAd = (adId: number) => {
  
    navigate(`/edit-house/${adId}`);
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это обращение в поддержку?')) return;

    try {
      setDeletingFeedback(feedbackId);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/support/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserFeedback(userFeedback.filter(feedback => feedback.id !== feedbackId));
        setMessage({text: 'Обращение успешно удалено', type: 'success'});
        setTimeout(() => setMessage({text: '', type: 'success'}), 3000);
      } else {
        setMessage({text: result.message || 'Ошибка при удалении обращения', type: 'error'});
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setMessage({text: 'Ошибка соединения с сервером', type: 'error'});
    } finally {
      setDeletingFeedback(null);
    }
  };

  const handleChatClick = (chatId: number) => {
 
    navigate(`/chat/${chatId}`);
  };

  const handleMarkAsRead = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5213/api/chats/${chatId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
      
        fetchUserChats();
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  
  const translateTopic = (topic: string): string => {
    return topicTranslations[topic] || topic;
  };

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
          <Link to="/" className="btn-primary">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profilepage-container">
      <div className="profilepage-sidebar">
        <div className="profilepage-avatar">
          <div className="profilepage-avatar-circle">
            {userData.fio.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <h3>{userData.fio}</h3>
          <p className="profilepage-email">{userData.email}</p>
          <div className={`profilepage-role ${userData.id_agent ? 'profilepage-agent' : 'profilepage-user'}`}>
            <span className="profilepage-role-dot"></span>
            {userData.id_agent ? 'Агент недвижимости' : 'Пользователь'}
          </div>
        </div>
         <Header />

        <nav className="profilepage-nav">
          <button 
            className={`profilepage-nav-item ${activeTab === 'profile' ? 'profilepage-nav-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="profilepage-nav-icon profilepage-user-icon"></i>
            <span>Мой профиль</span>
          </button>
          <button 
            className={`profilepage-nav-item ${activeTab === 'ads' ? 'profilepage-nav-active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            <i className="profilepage-nav-icon profilepage-ads-icon"></i>
            <span>Мои объявления</span>
            {userAds.length > 0 && <span className="profilepage-nav-badge">{userAds.length}</span>}
          </button>
          <button 
            className={`profilepage-nav-item ${activeTab === 'chats' ? 'profilepage-nav-active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <i className="profilepage-nav-icon profilepage-chat-icon"></i>
            <span>Мои чаты</span>
            {totalUnread > 0 && <span className="profilepage-nav-badge profilepage-nav-badge-unread">{totalUnread}</span>}
          </button>
          <button 
            className={`profilepage-nav-item ${activeTab === 'support' ? 'profilepage-nav-active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <i className="profilepage-nav-icon profilepage-support-icon"></i>
            <span>Поддержка</span>
          </button>
          <div className="profilepage-nav-divider"></div>
          <button 
            className="profilepage-nav-item profilepage-nav-logout"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
          >
            <i className="profilepage-nav-icon profilepage-logout-icon"></i>
            <span>Выйти</span>
          </button>
        </nav>
      </div>

      <div className="profilepage-content">
        {message.text && (
          <div className={`profilepage-message ${message.type}`}>
            <div className="profilepage-message-content">
              <i className={`profilepage-message-icon ${message.type === 'success' ? 'profilepage-success-icon' : 'profilepage-error-icon'}`}></i>
              {message.text}
            </div>
            <button className="profilepage-message-close" onClick={() => setMessage({text: '', type: 'success'})}>
              &times;
            </button>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мой профиль</h2>
                <p>Управление личной информацией</p>
              </div>
              <button 
                className={`btn-${isEditing ? 'secondary' : 'primary'}`}
                onClick={handleEditToggle}
              >
                {isEditing ? (
                  <>
                    <i className="profilepage-btn-icon profilepage-cancel-icon"></i>
                    Отменить
                  </>
                ) : (
                  <>
                    <i className="profilepage-btn-icon profilepage-edit-icon"></i>
                    Редактировать
                  </>
                )}
              </button>
            </div>

            <div className="profilepage-info">
              <div className="profilepage-info-section">
                <h3 className="profilepage-section-title">Личная информация</h3>
                
                <div className="profilepage-info-stack">
                  
                  <div className="profilepage-info-stack-item">
                    <div className="profilepage-stack-header">
                      <label className="profilepage-stack-label">Email</label>
                      <div className="profilepage-stack-value">{userData.email}</div>
                    </div>
                    <div className="profilepage-stack-hint">Email нельзя изменить</div>
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
                          placeholder="Введите ФИО"
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
                        {userData.id_agent ? 'Агент недвижимости' : 'Обычный пользователь'}
                      </div>
                    </div>
                    <div className="profilepage-stack-hint">
                      {userData.id_agent 
                        ? 'Вы можете публиковать объявления от имени агентства' 
                        : 'Вы можете публиковать объявления как частное лицо'}
                    </div>
                  </div>

                  <div className="profilepage-stack-divider"></div>

                </div>
              </div>

              {isEditing && (
                <div className="profilepage-actions">
                  <button 
                    className="btn-primary profilepage-save-btn"
                    onClick={handleSaveChanges}
                  >
                    <i className="profilepage-btn-icon profilepage-save-icon"></i>
                    Сохранить изменения
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мои объявления</h2>
                <p>Управление вашими объявлениями о недвижимости</p>
              </div>
              <Link to="/create-ad" className="btn-primary">
                <i className="fas fa-plus"></i> Добавить объявление
              </Link>
            </div>

            <div className="profilepage-ads-stats">
              <div className="profilepage-stat-card">
                <div className="profilepage-stat-number">{userAds.length}</div>
                <div className="profilepage-stat-label">Всего объявлений</div>
              </div>
              <div className="profilepage-stat-card">
                <div className="profilepage-stat-number">
                  {userAds.filter(ad => ad.Active).length}
                </div>
                <div className="profilepage-stat-label">Активных</div>
              </div>
              <div className="profilepage-stat-card">
                <div className="profilepage-stat-number">
                  {userAds.filter(ad => !ad.Active).length}
                </div>
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
                        <img 
                          src={ad.MainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'} 
                          alt={ad.Description}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop';
                          }}
                        />
                        <div className={`profilepage-ad-status ${ad.Active ? 'profilepage-active' : 'profilepage-inactive'}`}>
                          {ad.Active ? 'Активно' : 'Неактивно'}
                        </div>
                      </div>
                      
                      <div className="profilepage-ad-item-content">
                        <div className="profilepage-ad-item-header">
                          <h3>{ad.Price?.toLocaleString('ru-RU')} Br/мес</h3>
                          <div className="profilepage-ad-type">{ad.HouseType}</div>
                        </div>
                        
                        <div className="profilepage-ad-item-address">
                          <i className="fas fa-map-marker-alt"></i> 
                          {ad.HouseInfo?.City}, {ad.HouseInfo?.Street}
                        </div>
                        
                        <div className="profilepage-ad-item-info">
                          <span><i className="fas fa-bed"></i> {ad.HouseInfo?.Rooms} комн.</span>
                          <span><i className="fas fa-ruler-combined"></i> {ad.Area} м²</span>
                          <span><i className="fas fa-calendar"></i> {new Date(ad.AnnouncementData).toLocaleDateString('ru-RU')}</span>
                        </div>
                        
                        <p className="profilepage-ad-item-description">
                          {ad.Description?.length > 150 
                            ? ad.Description.substring(0, 150) + '...' 
                            : ad.Description}
                        </p>
                        
                        <div className="profilepage-ad-item-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => handleViewAndEditAd(ad.Id)}
                          >
                            <i className="fas fa-edit"></i> Редактировать
                          </button>
                          <button 
                            className={`btn-status ${ad.Active ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleActive(ad.Id, ad.Active)}
                          >
                            <i className={`fas fa-${ad.Active ? 'pause' : 'play'}`}></i>
                            {ad.Active ? ' Деактивировать' : ' Активировать'}
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleDeleteAd(ad.Id)}
                          >
                            <i className="fas fa-trash"></i> Удалить
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
                  <Link to="/create-ad" className="btn-primary">
                    <i className="fas fa-plus"></i> Создать объявление
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="profilepage-tab">
            <div className="profilepage-header">
              <div className="profilepage-header-title">
                <h2>Мои чаты</h2>
                <p>Общение с пользователями по вашим объявлениям</p>
              </div>
              {totalUnread > 0 && (
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    // Логика для пометки всех чатов как прочитанных
                    userChats.forEach(chat => {
                      if (chat.unread_count > 0) {
                        handleMarkAsRead(chat.id);
                      }
                    });
                  }}
                >
                  <i className="fas fa-check-double"></i>
                  Прочитать все
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
                    <div 
                      key={chat.id} 
                      className={`profilepage-chat-item ${chat.unread_count > 0 ? 'profilepage-unread' : ''}`}
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <div className="profilepage-chat-avatar">
                        {chat.user_avatar ? (
                          <img src={chat.user_avatar} alt={chat.user_name} />
                        ) : (
                          <div className="profilepage-avatar-placeholder">
                            {chat.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        {chat.unread_count > 0 && (
                          <span className="profilepage-chat-unread-badge">{chat.unread_count}</span>
                        )}
                      </div>
                      <div className="profilepage-chat-info">
                        <div className="profilepage-chat-header">
                          <h4 className="profilepage-chat-user">{chat.user_name}</h4>
                          <span className="profilepage-chat-time">
                            {new Date(chat.last_message_time).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <div className="profilepage-chat-ad-title">{chat.ad_title}</div>
                        <p className="profilepage-chat-last-message">{chat.last_message}</p>
                      </div>
                      <div className="profilepage-chat-actions">
                        <button 
                          className="btn-small btn-mark-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(chat.id);
                          }}
                          title="Пометить как прочитанное"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profilepage-chats-empty">
                  <div className="profilepage-empty-illustration profilepage-chat-illustration">
                    <i className="fas fa-comments fa-3x"></i>
                  </div>
                  <h3>У вас пока нет чатов</h3>
                  <p>Когда пользователи начнут писать вам по объявлениям, здесь появятся чаты</p>
                </div>
              )}
            </div>
          </div>
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
                    <label htmlFor="topic" className="profilepage-form-label">
                      Тема обращения
                      <span className="profilepage-required">*</span>
                    </label>
                    <select 
                      id="topic" 
                      name="topic" 
                      className="profilepage-support-select"
                      required
                    >
                      <option value="">Выберите тему</option>
                      <option value="technical">Технические проблемы</option>
                      <option value="account">Вопросы по аккаунту</option>
                      <option value="ad">Проблемы с объявлениями</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>

                  <div className="profilepage-form-group">
                    <label htmlFor="message" className="profilepage-form-label">
                      Сообщение
                      <span className="profilepage-required">*</span>
                    </label>
                    <textarea 
                      id="message" 
                      name="message" 
                      className="profilepage-support-textarea"
                      placeholder="Опишите вашу проблему или вопрос подробно..."
                      rows={6}
                      required
                      maxLength={2000}
                    />
                    <div className="profilepage-textarea-counter">
                      Максимум 2000 символов
                    </div>
                  </div>

                  <div className="profilepage-form-actions">
                    <button type="submit" className="btn-primary">
                      <i className="fas fa-paper-plane"></i>
                      Отправить обращение
                    </button>
                    <button type="reset" className="btn-secondary">
                      <i className="fas fa-eraser"></i>
                      Очистить форму
                    </button>
                  </div>
                </form>

                <div className="profilepage-feedback-history">
                  <h4 className="profilepage-section-title">История обращений</h4>
                  
                  {feedbackLoading ? (
                    <div className="profilepage-loading-placeholder">
                      <div className="profilepage-loading-spinner profilepage-small"></div>
                      <p>Загрузка истории...</p>
                    </div>
                  ) : userFeedback.length > 0 ? (
                    <div className="profilepage-feedback-list">
                      {userFeedback.map((feedback) => (
                        <div key={feedback.id} className="profilepage-feedback-item">
                          <div className="profilepage-feedback-header">
                            <div className="profilepage-feedback-topic">{translateTopic(feedback.topic)}</div>
                            <div className="profilepage-feedback-date">
                              {new Date(feedback.created_at).toLocaleDateString('ru-RU')}
                              <button 
                                className="btn-small btn-danger profilepage-feedback-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFeedback(feedback.id);
                                }}
                                disabled={deletingFeedback === feedback.id}
                                title="Удалить обращение"
                              >
                                {deletingFeedback === feedback.id ? (
                                  <div className="profilepage-spinner-small"></div>
                                ) : (
                                  <i className="fas fa-trash"></i>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="profilepage-feedback-text">{feedback.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profilepage-empty-feedback">
                      <p>У вас пока нет обращений в поддержку</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="profilepage-support-info">
                <h3 className="profilepage-section-title">Контакты поддержки</h3>
                <div className="profilepage-contact-cards">
                  <div className="profilepage-contact-card">
                    <div className="profilepage-contact-icon profilepage-email-icon"></div>
                    <h4>Электронная почта</h4>
                    <p>primehouse@gmail.com</p>
                  </div>
                  <div className="profilepage-contact-card">
                    <div className="profilepage-contact-icon profilepage-phone-icon"></div>
                    <h4>Телефон</h4>
                    <p>+375 (29) 584-99-96</p>
                    <small>Бесплатно по Беларуси</small>
                  </div>
                  <div className="profilepage-contact-card">
                    <div className="profilepage-contact-icon profilepage-hours-icon"></div>
                    <h4>Часы работы</h4>
                    <p>Пн-Пт: 9:00-18:00</p>
                    <small>Минское время</small>
                  </div>
                </div>

                <div className="profilepage-faq-section">
                  <h4 className="profilepage-section-title">Частые вопросы</h4>
                  <div className="profilepage-faq-list">
                    <details className="profilepage-faq-item">
                      <summary>Как добавить объявление?</summary>
                      <p>Перейдите на вкладку "Мои объявления" и нажмите кнопку "Добавить объявление". Заполните все необходимые поля формы: заголовок, описание, фотографии и контактные данные.</p>
                    </details>
                    <details className="profilepage-faq-item">
                      <summary>Как редактировать профиль?</summary>
                      <p>Для редактирования профиля зайдите в раздел "Мой профиль" и нажмите кнопку "Редактировать". Вы сможете изменить ФИО, телефон и другую личную информацию.</p>
                    </details>
                    <details className="profilepage-faq-item">
                      <summary>Как отвечать на сообщения в чатах?</summary>
                      <p>Перейдите во вкладку "Мои чаты", выберите интересующий вас диалог и напишите ответ. Вы также можете получать уведомления о новых сообщениях.</p>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;