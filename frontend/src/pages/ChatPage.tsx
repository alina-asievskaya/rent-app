import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPaperPlane,
  faUser,
  faHome,
  faPhone,
  faEnvelope,
  faClock,
  faCheck,
  faCheckDouble,
  faSpinner,
  faEllipsisV,
  faTrash,
  faInfoCircle,
  faPaperclip,
  faSmile,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import './ChatPage.css';

interface ChatMessage {
  id: number;
  text: string;
  sender_id: number;
  sender_name: string;
  is_own: boolean;
  is_read: boolean;
  created_at: string;
  time: string;
  date: string;
}

interface OtherUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_agent: boolean;
}

interface HouseInfo {
  id: number;
  title: string;
  price: number;
  area: number;
  address: string;
  city: string;
  street: string;
  rooms: number;
  main_photo: string;
}

interface ChatData {
  id: number;
  other_user: OtherUser;
  house: HouseInfo;
  messages: ChatMessage[];
  created_at: string;
  total_messages: number;
  can_load_more: boolean;
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = decodeToken(token);
          
          if (payload) {
            const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
            setCurrentUserEmail(email);
            
            const roles = payload.role || payload.roles || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
            setIsCurrentUserAdmin(isAdmin);
            
            console.log('👤 Текущий пользователь:', { email, isAdmin });
          }
        }
      } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
      }
    };

    checkUserRole();
  }, []);

  const canSendMessageToUser = useCallback(() => {
    if (!chat?.other_user?.email) return true;
    
    if (isCurrentUserAdmin) {
      if (chat.other_user.email.toLowerCase() === 'admin@gmail.com') {
        alert('Администратор не может писать самому себе');
        return false;
      }
    }
    
    if (currentUserEmail && !isCurrentUserAdmin) {
      if (chat.other_user.email.toLowerCase() === 'admin@gmail.com') {
        alert('Вы не можете написать администратору. Пожалуйста, свяжитесь с поддержкой через форму обратной связи.');
        return false;
      }
    }
    
    return true;
  }, [chat?.other_user?.email, isCurrentUserAdmin, currentUserEmail]);

  const fetchChat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5213/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Чат не найден');
        } else if (response.status === 401) {
          navigate('/login');
        } else {
          setError('Ошибка загрузки чата');
        }
        return;
      }

      const result = await response.json();
      if (result.success) {
        setChat(result.data);
        setSkip(result.data.messages.length);
      } else {
        setError(result.message || 'Ошибка загрузки чата');
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }, [chatId, navigate]);

  const loadMoreMessages = async () => {
    if (!chatId || loadingMore || !chat?.can_load_more) return;

    try {
      setLoadingMore(true);
      const token = getToken();
      
      const response = await fetch(
        `http://localhost:5213/api/chats/${chatId}/messages?skip=${skip}&take=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const newMessages = [...result.data, ...chat.messages];
          setChat(prev => prev ? {
            ...prev,
            messages: newMessages,
            can_load_more: result.pagination.has_more
          } : null);
          
          setSkip(prev => prev + result.data.length);
        }
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId || sending) return;

    if (!canSendMessageToUser()) {
      setNewMessage('');
      return;
    }

    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setSending(true);
      
      const response = await fetch(`http://localhost:5213/api/chats/${chatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newMessage }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setNewMessage('');
        await fetchChat();
      } else {
        alert(result.message || 'Ошибка при отправке сообщения');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async () => {
    if (!chatId) return;

    try {
      const token = getToken();
      await fetch(`http://localhost:5213/api/chats/${chatId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatId || !window.confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут удалены.')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5213/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        navigate('/profile#chats');
      } else {
        alert(result.message || 'Ошибка при удалении чата');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Ошибка при удалении чата');
    }
  };

  const handleViewHouse = () => {
    if (chat?.house?.id) {
      navigate(`/house/${chat.house.id}`);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = () => {
    if (!chat?.messages) return {};

    const groups: { [key: string]: ChatMessage[] } = {};
    
    chat.messages.forEach(message => {
      const date = formatDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    alert('Загрузка файлов будет реализована в следующей версии');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (chatId) {
      fetchChat();
      markAsRead();
    }
  }, [chatId, fetchChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  useEffect(() => {
    if (chat?.other_user) {
      document.title = `Чат с ${chat.other_user.name} | RentApp`;
    }
    return () => {
      document.title = 'RentApp';
    };
  }, [chat?.other_user]);

  const handleBack = () => {
    navigate('/profile#chats');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="chat-loading">
          <div className="spinner-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          </div>
          <p>Загрузка чата...</p>
        </div>
      </>
    );
  }

  if (error || !chat) {
    return (
      <>
        <Header />
        <div className="chat-error">
          <div className="error-container">
            <h2>{error || 'Чат не найден'}</h2>
            <p>Возможно, у вас нет доступа к этому чату или он был удален.</p>
            <button onClick={handleBack} className="btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} />
              Вернуться к чатам
            </button>
          </div>
        </div>
      </>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <>
      <Header />
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-left">
              <button className="chat-back-btn" onClick={handleBack}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              
              <div className="chat-user-info">
                <div className="chat-user-avatar">
                  {chat.other_user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="chat-user-details">
                  <h3>{chat.other_user.name}</h3>
                  <p className="chat-user-status">
                    {chat.other_user.is_agent ? 'Агент недвижимости' : 'Пользователь'}
                    {chat.other_user.email === 'admin@gmail.com' && ' (Администратор)'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="chat-header-right">
              <div className="chat-house-info" onClick={handleViewHouse}>
                <FontAwesomeIcon icon={faHome} />
                <div>
                  <strong>{chat.house.title}</strong>
                  <p>{chat.house.price?.toLocaleString('ru-RU')} Br/мес</p>
                </div>
              </div>
              
              <div className="chat-header-actions">
                {chat.other_user.email !== 'admin@gmail.com' && (
                  <>
                    <button 
                      className="btn-icon"
                      onClick={() => window.location.href = `tel:${chat.other_user.phone}`}
                      title="Позвонить"
                    >
                      <FontAwesomeIcon icon={faPhone} />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => window.location.href = `mailto:${chat.other_user.email}`}
                      title="Написать на email"
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                    </button>
                  </>
                )}
                
                <div className="dropdown">
                  <button 
                    className="btn-icon"
                    onClick={() => setShowMenu(!showMenu)}
                    title="Дополнительно"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  
                  {showMenu && (
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={handleViewHouse}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>Информация о доме</span>
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={scrollToBottom}
                      >
                        <FontAwesomeIcon icon={faArrowUp} />
                        <span>Прокрутить вниз</span>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item dropdown-item-danger"
                        onClick={handleDeleteChat}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Удалить чат</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div 
            className="chat-messages" 
            ref={messagesContainerRef}
            onScroll={(e) => {
              const element = e.currentTarget;
              if (element.scrollTop === 0 && chat.can_load_more) {
                loadMoreMessages();
              }
            }}
          >
            {loadingMore && (
              <div className="loading-more">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Загрузка предыдущих сообщений...</span>
              </div>
            )}
            
            {Object.keys(groupedMessages).length === 0 ? (
              <div className="chat-empty">
                <div className="empty-illustration">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <h3>Начните общение</h3>
                <p>Напишите первое сообщение {chat.other_user.name}</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date} className="message-date-group">
                  <div className="date-divider">
                    <span>{date}</span>
                  </div>
                  
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const nextMessage = messages[index + 1];
                    
                    const isFirstInGroup = !prevMessage || 
                      prevMessage.sender_id !== message.sender_id ||
                      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000;
                    
                    const isLastInGroup = !nextMessage || 
                      nextMessage.sender_id !== message.sender_id;
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`message-wrapper ${message.is_own ? 'own' : 'other'}`}
                      >
                        {isFirstInGroup && !message.is_own && (
                          <div className="message-sender">
                            <span>{message.sender_name}</span>
                          </div>
                        )}
                        
                        <div className={`message-bubble ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}>
                          <div className="message-content">
                            <p>{message.text}</p>
                          </div>
                          <div className="message-meta">
                            <span className="message-time">
                              <FontAwesomeIcon icon={faClock} />
                              {formatTime(message.created_at)}
                            </span>
                            {message.is_own && (
                              <span className="message-status">
                                <FontAwesomeIcon 
                                  icon={message.is_read ? faCheckDouble : faCheck} 
                                  className={message.is_read ? 'read' : 'unread'}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            
            <div ref={messagesEndRef} />
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <div className="input-tools">
              <button 
                type="button"
                className="btn-tool"
                onClick={() => fileInputRef.current?.click()}
                title="Прикрепить файл"
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                multiple
              />
              
              <button 
                type="button"
                className="btn-tool"
                title="Эмодзи"
              >
                <FontAwesomeIcon icon={faSmile} />
              </button>
            </div>
            
            <div className="input-container">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Введите сообщение для ${chat.other_user.name}...`}
                maxLength={2000}
                disabled={sending || (isCurrentUserAdmin && chat.other_user.email === 'admin@gmail.com')}
                rows={1}
              />
              
              <div className="input-actions">
                {newMessage.length > 0 && (
                  <div className="char-counter">
                    {newMessage.length}/2000
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending || (isCurrentUserAdmin && chat.other_user.email === 'admin@gmail.com')}
                  className="btn-send"
                  title="Отправить"
                >
                  {sending ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatPage;