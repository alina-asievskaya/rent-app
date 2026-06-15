import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faPaperPlane, faUser, faHome,
  faClock, faCheck, faCheckDouble, faSpinner,
  faEllipsisV, faTrash, faInfoCircle, faPaperclip, faSmile, faArrowUp,
  faUtensils, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import './ChatPage.css';

interface ChatMessage {
  id: number;
  text: string | null;
  image_url?: string;
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
  chat_type: 'house' | 'agent' | 'catering';
  agent_price?: string | null;
  catering_name?: string | null;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getToken = () => localStorage.getItem('token');

  // ── Форматирование цены ──────────────────────────────────────────────────
  const formatPriceWithIcon = (price: number): React.ReactNode => {
    if (price == null || isNaN(price)) return null;
    return (
      <>
        {price.toLocaleString('ru-RU')} <i className="nbrb-icon">&#xe901;</i>
      </>
    );
  };

  // ── Лейбл статуса собеседника ────────────────────────────────────────────
  const getOtherUserStatus = (): string => {
    if (!chat) return '';
    if (chat.chat_type === 'catering') return 'Владелец кейтеринга';
    if (chat.chat_type === 'agent')    return 'Организатор праздников';
    return chat.other_user.is_agent ? 'Организатор' : 'Пользователь';
  };

  // ── Блок информации в шапке (справа) ────────────────────────────────────
  const renderHeaderInfo = (): React.ReactNode => {
    if (!chat) return null;

    if (chat.chat_type === 'catering') {
      return (
        <div className="chat-house-info">
          <FontAwesomeIcon icon={faUtensils} />
          <div>
            <strong>{chat.catering_name || 'Кейтеринг'}</strong>
            <p>Услуги кейтеринга</p>
          </div>
        </div>
      );
    }

    if (chat.chat_type === 'agent') {
      return (
        <div className="chat-house-info">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <div>
            <strong>Организатор праздников</strong>
            <p>
              {chat.agent_price
                ? <>от {Number(chat.agent_price).toLocaleString('ru-RU')} <i className="nbrb-icon">&#xe901;</i> за услугу</>
                : 'Стоимость по договорённости'}
            </p>
          </div>
        </div>
      );
    }

    // Обычный чат по дому
    return (
      <div className="chat-house-info" onClick={handleViewHouse} style={{ cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faHome} />
        <div>
          <strong>{chat.house.title}</strong>
          <p>
            {formatPriceWithIcon(chat.house.price)}{' '}
            {chat.house.price > 0 && '/мес'}
          </p>
        </div>
      </div>
    );
  };

  // ── Пункт меню "О доме" показываем только для house-чатов ───────────────
  const renderMenuHouseItem = (): React.ReactNode => {
    if (!chat || chat.chat_type !== 'house') return null;
    return (
      <button className="dropdown-item" onClick={handleViewHouse}>
        <FontAwesomeIcon icon={faInfoCircle} /><span>О доме</span>
      </button>
    );
  };

  // ── API ──────────────────────────────────────────────────────────────────
  const fetchChat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) { navigate('/login'); return; }
      const response = await fetch(`http://localhost:5213/api/chats/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 404) setError('Чат не найден');
        else if (response.status === 401) navigate('/login');
        else setError('Ошибка загрузки чата');
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
      console.error(error);
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
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const newMessages = [...result.data, ...chat.messages];
          setChat(prev =>
            prev ? { ...prev, messages: newMessages, can_load_more: result.pagination.has_more } : null
          );
          setSkip(prev => prev + result.data.length);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || sending) return;
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    try {
      setSending(true);
      const response = await fetch(`http://localhost:5213/api/chats/${chatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newMessage }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setNewMessage('');
        await fetchChat();
      } else {
        console.error(result.message || 'Ошибка при отправке');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!chatId) return;
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:5213/api/chats/${chatId}/messages/${messageId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        setChat(prev =>
          prev ? { ...prev, messages: prev.messages.filter(m => m.id !== messageId) } : null
        );
      } else {
        console.error(result.message || 'Ошибка удаления');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      console.error('Можно загружать только изображения');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setSending(true);
      const token = getToken();
      const response = await fetch(
        `http://localhost:5213/api/chats/${chatId}/upload-image`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        setChat(prev =>
          prev ? { ...prev, messages: [...prev.messages, result.data] } : null
        );
      } else {
        console.error(result.message || 'Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const markAsRead = useCallback(async () => {
    if (!chatId) return;
    try {
      const token = getToken();
      await fetch(`http://localhost:5213/api/chats/${chatId}/mark-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) { console.error(error); }
  }, [chatId]);

  const handleDeleteChat = async () => {
    if (!chatId) return;
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5213/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        navigate('/profile#chats');
      } else {
        console.error(result.message || 'Ошибка удаления');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewHouse = () => {
    if (chat?.house?.id) navigate(`/house/${chat.house.id}`);
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const groupMessagesByDate = () => {
    if (!chat?.messages) return {};
    const groups: { [key: string]: ChatMessage[] } = {};
    chat.messages.forEach(msg => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatId) { fetchChat(); markAsRead(); }
  }, [chatId, fetchChat, markAsRead]);

  useEffect(() => { scrollToBottom(); }, [chat?.messages]);

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header />
        <div className="chat-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
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
            <button onClick={() => navigate('/profile#chats')} className="btn-primary">
              Вернуться к чатам
            </button>
          </div>
        </div>
      </>
    );
  }

  const groupedMessages = groupMessagesByDate();

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <div className="chat-page">
        <div className="chat-container">

          {/* ── Шапка чата ── */}
          <div className="chat-header">
            <div className="chat-header-left">
              <button className="chat-back-btn" onClick={() => navigate('/profile#chats')}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className="chat-user-info">
                <div className="chat-user-avatar">
                  {chat.other_user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="chat-user-details">
                  <h3>{chat.other_user.name}</h3>
                  <p className="chat-user-status">{getOtherUserStatus()}</p>
                </div>
              </div>
            </div>

            <div className="chat-header-right">
              {renderHeaderInfo()}

              <div className="dropdown">
                <button className="btn-icon" onClick={() => setShowMenu(!showMenu)}>
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    {renderMenuHouseItem()}
                    <button className="dropdown-item" onClick={scrollToBottom}>
                      <FontAwesomeIcon icon={faArrowUp} /><span>Вниз</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleDeleteChat}
                    >
                      <FontAwesomeIcon icon={faTrash} /><span>Удалить чат</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Сообщения ── */}
          <div
            className="chat-messages"
            ref={messagesContainerRef}
            onScroll={(e) => {
              if (e.currentTarget.scrollTop === 0 && chat.can_load_more) loadMoreMessages();
            }}
          >
            {loadingMore && (
              <div className="loading-more">
                <FontAwesomeIcon icon={faSpinner} spin /><span>Загрузка...</span>
              </div>
            )}

            {Object.keys(groupedMessages).length === 0 ? (
              <div className="chat-empty">
                <FontAwesomeIcon icon={faUser} />
                <h3>Начните общение</h3>
                <p>Напишите первое сообщение {chat.other_user.name}</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date} className="message-date-group">
                  <div className="date-divider"><span>{date}</span></div>
                  {messages.map((message, idx) => {
                    const prev = messages[idx - 1];
                    const next = messages[idx + 1];
                    const isFirst =
                      !prev ||
                      prev.sender_id !== message.sender_id ||
                      new Date(message.created_at).getTime() - new Date(prev.created_at).getTime() > 300000;
                    const isLast = !next || next.sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={`message-wrapper ${message.is_own ? 'own' : 'other'}`}
                      >
                        {isFirst && !message.is_own && (
                          <div className="message-sender">
                            <span>{message.sender_name}</span>
                          </div>
                        )}
                        <div className={`message-bubble ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}>
                          <div className="message-content">
                            {message.image_url && (
                              <img
                                src={message.image_url}
                                alt="Изображение"
                                className="message-image"
                                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }}
                              />
                            )}
                            {message.text && <p>{message.text}</p>}
                          </div>
                          <div className="message-meta">
                            <span className="message-time">
                              <FontAwesomeIcon icon={faClock} />
                              {formatTime(message.created_at)}
                            </span>
                            {message.is_own && (
                              <>
                                <span className="message-status">
                                  <FontAwesomeIcon
                                    icon={message.is_read ? faCheckDouble : faCheck}
                                    className={message.is_read ? 'read' : 'unread'}
                                  />
                                </span>
                                <button
                                  className="message-delete-btn"
                                  onClick={() => handleDeleteMessage(message.id)}
                                  title="Удалить"
                                >
                                  <FontAwesomeIcon icon={faTrash} size="xs" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Форма отправки ── */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <div className="input-tools">
              <button type="button" className="btn-tool" onClick={() => fileInputRef.current?.click()}>
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*"
              />
              <button
                type="button"
                className="btn-tool"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FontAwesomeIcon icon={faSmile} />
              </button>
            </div>
            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
            <div className="input-container">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Сообщение для ${chat.other_user.name}...`}
                maxLength={2000}
                disabled={sending}
                rows={1}
              />
              <div className="input-actions">
                {newMessage.length > 0 && (
                  <div className="char-counter">{newMessage.length}/2000</div>
                )}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-send"
                >
                  {sending
                    ? <FontAwesomeIcon icon={faSpinner} spin />
                    : <FontAwesomeIcon icon={faPaperPlane} />}
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