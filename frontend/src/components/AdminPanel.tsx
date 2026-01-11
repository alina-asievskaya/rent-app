import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import './AdminPanel.css';

interface User {
  id: number;
  email: string;
  fio: string;
  phone_num: string;
  id_agent: boolean;
}

interface Agent {
  id: number;
  userId: number;
  specialization: string;
  experience: number;
  photo: string;
  rating: number;
  user: {
    id: number;
    email: string;
    fio: string;
    phone_num: string;
  };
}

interface Feedback {
  id: number;
  topic: string;
  text: string;
  createdAt: string;
  user: {
    id: number;
    fio: string;
    email: string;
    phone_num: string;
  };
}

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  activeUsers: number;
  totalFeedback: number;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'agents' | 'feedback'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    activeUsers: 0,
    totalFeedback: 0
  });
  
  // Состояния для всплывающих сообщений
  const [toasts, setToasts] = useState<Array<{
    id: number;
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>>([]);

  const [agentForm, setAgentForm] = useState({
    email: '',
    fio: '',
    password: '',
    phone_num: '',
    specialization: '',
    experience: 0,
    photo: '',
    rating: 0,
    photoFile: null as File | null
  });

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const API_BASE_URL = 'http://localhost:5213';

  // Функция для показа всплывающего сообщения
  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  // Функция для удаления всплывающего сообщения
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Функция для показа модального окна подтверждения
  const showConfirmation = (title: string, message: string, type: 'danger' | 'warning' | 'info', onConfirm: () => void) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Функция для закрытия модального окна
  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Функция для загрузки фото в Cloudinary
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

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error('Ошибка загрузки в Cloudinary:', error);
      showToast('Ошибка загрузки фото в облако', 'error');
      return null;
    }
  };

  // Функция для получения статистики
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogoutConfirmation();
          return;
        }
        throw new Error(`Stats fetch failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAdminStats(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      showToast('Ошибка загрузки статистики', 'error');
    }
  }, [token, API_BASE_URL]);

  // Функция для получения данных
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints: Record<string, string> = {
        users: `${API_BASE_URL}/api/admin/users`,
        agents: `${API_BASE_URL}/api/admin/agents`,
        feedback: `${API_BASE_URL}/api/admin/feedback`
      };

      // Для вкладки статистики не делаем запрос к API
      if (activeTab === 'stats') {
        await fetchStats();
        setLoading(false);
        return;
      }

      const endpoint = endpoints[activeTab];
      if (!endpoint) {
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogoutConfirmation();
          return;
        }
        throw new Error(`Data fetch failed: ${response.status}`);
      }

      const data = await response.json();
      if (activeTab === 'users') setUsers(data.data);
      if (activeTab === 'agents') setAgents(data.data);
      if (activeTab === 'feedback') setFeedback(data.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, API_BASE_URL, fetchStats]);

  // Проверка на админа при загрузке
  useEffect(() => {
    if (!token || user?.email !== 'admin@gmail.com') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [token, user?.email, navigate, fetchData]);

  useEffect(() => {
    if (token && user?.email === 'admin@gmail.com') {
      fetchData();
    }
  }, [activeTab, fetchData, token, user?.email]);

  // Функция для подтверждения выхода
  const handleLogoutConfirmation = () => {
    showConfirmation(
      'Выход из системы',
      'Вы уверены, что хотите выйти из административной панели?',
      'warning',
      () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    );
  };

  const handleDeleteUser = (userId: number, userEmail: string, userFio: string) => {
    showConfirmation(
      'Удаление пользователя',
      `Вы собираетесь удалить пользователя:\n\n${userFio}\n${userEmail}\n\nВы уверены что хотите удалить пользователя?`,
      'danger',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Delete user failed: ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          if (data.success) {
            setUsers(users.filter(user => user.id !== userId));
            showToast('Пользователь успешно удален', 'success');
            fetchStats();
          } else {
            showToast(data.message || 'Ошибка при удалении пользователя', 'error');
          }
        } catch (error) {
          console.error('Ошибка удаления пользователя:', error);
          showToast('Ошибка при удалении пользователя', 'error');
        }
      }
    );
  };

  const handleDeleteAgent = (agentId: number, agentName: string) => {
    showConfirmation(
      'Удаление агента',
      `Вы собираетесь удалить агента:\n\n${agentName}\n\nВы уверены что хотите удалить агента?`,
      'danger',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/agents/${agentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Delete agent failed: ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          if (data.success) {
            setAgents(agents.filter(agent => agent.id !== agentId));
            showToast('Агент успешно удален', 'success');
            fetchStats();
          } else {
            showToast(data.message || 'Ошибка при удалении агента', 'error');
          }
        } catch (error) {
          console.error('Ошибка удаления агента:', error);
          showToast('Ошибка при удалении агента', 'error');
        }
      }
    );
  };

  const handleDeleteFeedback = (feedbackId: number, feedbackTopic: string) => {
    showConfirmation(
      'Удаление обращения',
      `Вы собираетесь удалить обращение:\n\n${feedbackTopic}\n\nВы уверены что хотите удалить обращение?`,
      'danger',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/feedback/${feedbackId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Delete feedback failed: ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          if (data.success) {
            setFeedback(feedback.filter(f => f.id !== feedbackId));
            showToast('Обращение успешно удалено', 'success');
            fetchStats();
          } else {
            showToast(data.message || 'Ошибка при удалении обращения', 'error');
          }
        } catch (error) {
          console.error('Ошибка удаления обращения:', error);
          showToast('Ошибка при удалении обращения', 'error');
        }
      }
    );
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadToCloudinary(file);
      if (photoUrl) {
        setAgentForm(prev => ({ ...prev, photo: photoUrl }));
        showToast('Фото успешно загружено', 'success');
      } else {
        showToast('Ошибка загрузки фото', 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      showToast('Ошибка загрузки фото', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    if (!agentForm.email || !agentForm.fio || !agentForm.password || !agentForm.phone_num || !agentForm.specialization) {
      showToast('Заполните все обязательные поля', 'warning');
      return;
    }

    if (agentForm.password.length < 6) {
      showToast('Пароль должен содержать минимум 6 символов', 'warning');
      return;
    }

    // Если есть файл для загрузки, сначала загружаем его
    let finalPhotoUrl = agentForm.photo;
    if (agentForm.photoFile) {
      setUploadingPhoto(true);
      try {
        const photoUrl = await uploadToCloudinary(agentForm.photoFile);
        if (!photoUrl) {
          showToast('Ошибка загрузки фото', 'error');
          setUploadingPhoto(false);
          return;
        }
        finalPhotoUrl = photoUrl;
      } catch {
        showToast('Ошибка загрузки фото', 'error');
        setUploadingPhoto(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/agents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: agentForm.email,
          fio: agentForm.fio,
          password: agentForm.password,
          phone_num: agentForm.phone_num,
          specialization: agentForm.specialization,
          experience: agentForm.experience,
          photo: finalPhotoUrl,
          rating: agentForm.rating
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Агент успешно создан', 'success');
        setAgentForm({
          email: '',
          fio: '',
          password: '',
          phone_num: '',
          specialization: '',
          experience: 0,
          photo: '',
          rating: 0,
          photoFile: null
        });
        fetchData();
      } else {
        // Обработка различных ошибок
        if (data.message?.includes('already exists') || data.message?.includes('уже существует')) {
          showToast('Пользователь с таким email уже существует', 'error');
        } else if (data.message?.includes('password') || data.message?.includes('пароль')) {
          showToast('Ошибка в пароле: ' + data.message, 'error');
        } else {
          showToast(`Ошибка: ${data.message || 'Неизвестная ошибка'}`, 'error');
        }
      }
    } catch (error) {
      console.error('Ошибка создания агента:', error);
      showToast('Ошибка при создании агента', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          showToast('Файл слишком большой (максимум 5MB)', 'error');
          return;
        }
        setAgentForm(prev => ({ ...prev, photoFile: file }));
        handlePhotoUpload(file);
      } else {
        showToast('Пожалуйста, выберите изображение', 'error');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          showToast('Файл слишком большой (максимум 5MB)', 'error');
          return;
        }
        setAgentForm(prev => ({ ...prev, photoFile: file }));
        handlePhotoUpload(file);
      } else {
        showToast('Пожалуйста, выберите изображение', 'error');
      }
    }
  };

  if (loading && activeTab === 'stats') {
    return (
      <div className="adminpage-loading-full">
        <Header />
        <div className="adminpage-loading-content">
          <div className="adminpage-spinner"></div>
          <p>Загрузка административной панели...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminpage-wrapper">
      <Header />
      
      {/* Всплывающие сообщения */}
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

      {/* Модальное окно подтверждения */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        onConfirm={() => {
          confirmationModal.onConfirm();
          closeConfirmation();
        }}
        onCancel={closeConfirmation}
        confirmText={confirmationModal.type === 'danger' ? 'Удалить' : 'Подтвердить'}
        cancelText="Отмена"
      />

      <div className="adminpage-container">
        <div className="adminpage-sidebar">
          <div className="adminpage-avatar">
            <div className="adminpage-avatar-circle">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Администратор</h3>
            <p className="adminpage-email">{user?.email}</p>
            <div className="adminpage-role adminpage-admin">
              <span className="adminpage-role-dot"></span>
              Системный администратор
            </div>
          </div>

          <nav className="adminpage-nav">
            <button 
              className={`adminpage-nav-item ${activeTab === 'stats' ? 'adminpage-nav-active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <i className="adminpage-nav-icon adminpage-stats-icon"></i>
              <span>Статистика</span>
            </button>
            <button 
              className={`adminpage-nav-item ${activeTab === 'users' ? 'adminpage-nav-active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="adminpage-nav-icon adminpage-users-icon"></i>
              <span>Пользователи</span>
              <span className="adminpage-nav-badge">{adminStats.totalUsers}</span>
            </button>
            <button 
              className={`adminpage-nav-item ${activeTab === 'agents' ? 'adminpage-nav-active' : ''}`}
              onClick={() => setActiveTab('agents')}
            >
              <i className="adminpage-nav-icon adminpage-agents-icon"></i>
              <span>Агенты</span>
              <span className="adminpage-nav-badge">{adminStats.totalAgents}</span>
            </button>
            <button 
              className={`adminpage-nav-item ${activeTab === 'feedback' ? 'adminpage-nav-active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              <i className="adminpage-nav-icon adminpage-feedback-icon"></i>
              <span>Обращения</span>
              <span className="adminpage-nav-badge">{adminStats.totalFeedback}</span>
            </button>
            
            <div className="adminpage-nav-divider"></div>
            
            <button 
              className="adminpage-nav-item adminpage-nav-back"
              onClick={() => navigate('/')}
            >
              <i className="adminpage-nav-icon adminpage-back-icon"></i>
              <span>На главную</span>
            </button>
            
            <button 
              className="adminpage-nav-item adminpage-nav-logout"
              onClick={handleLogoutConfirmation}
            >
              <i className="adminpage-nav-icon adminpage-logout-icon"></i>
              <span>Выйти</span>
            </button>
          </nav>
        </div>

        <div className="adminpage-content">
          {activeTab === 'stats' && (
            <div className="adminpage-tab">
              <div className="adminpage-header">
                <div className="adminpage-header-title">
                  <h2>Административная панель</h2>
                  <p>Статистика и управление системой</p>
                </div>
                <div className="adminpage-header-time">
                  {new Date().toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="adminpage-stats-grid">
                <div className="adminpage-stat-card adminpage-stat-primary">
                  <div className="adminpage-stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="adminpage-stat-content">
                    <div className="adminpage-stat-number">{adminStats.totalUsers}</div>
                    <div className="adminpage-stat-label">Всего пользователей</div>
                    <div className="adminpage-stat-sub">{adminStats.activeUsers} активных</div>
                  </div>
                </div>

                <div className="adminpage-stat-card adminpage-stat-success">
                  <div className="adminpage-stat-icon">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className="adminpage-stat-content">
                    <div className="adminpage-stat-number">{adminStats.totalAgents}</div>
                    <div className="adminpage-stat-label">Агентов</div>
                    <div className="adminpage-stat-sub">в системе</div>
                  </div>
                </div>

                <div className="adminpage-stat-card adminpage-stat-warning">
                  <div className="adminpage-stat-icon">
                    <i className="fas fa-comments"></i>
                  </div>
                  <div className="adminpage-stat-content">
                    <div className="adminpage-stat-number">{adminStats.totalFeedback}</div>
                    <div className="adminpage-stat-label">Обращений</div>
                    <div className="adminpage-stat-sub">в поддержку</div>
                  </div>
                </div>

                <div className="adminpage-stat-card adminpage-stat-info">
                  <div className="adminpage-stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="adminpage-stat-content">
                    <div className="adminpage-stat-number">24/7</div>
                    <div className="adminpage-stat-label">Доступность</div>
                    <div className="adminpage-stat-sub">системы</div>
                  </div>
                </div>
              </div>

              <div className="adminpage-quick-actions">
                <h3 className="adminpage-section-title">Быстрые действия</h3>
                <div className="adminpage-actions-grid">
                  <button 
                    className="adminpage-action-card"
                    onClick={() => setActiveTab('users')}
                  >
                    <div className="adminpage-action-icon">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <div className="adminpage-action-text">Добавить пользователя</div>
                  </button>

                  <button 
                    className="adminpage-action-card"
                    onClick={() => setActiveTab('agents')}
                  >
                    <div className="adminpage-action-icon">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="adminpage-action-text">Создать агента</div>
                  </button>

                  <button 
                    className="adminpage-action-card"
                    onClick={() => setActiveTab('feedback')}
                  >
                    <div className="adminpage-action-icon">
                      <i className="fas fa-eye"></i>
                    </div>
                    <div className="adminpage-action-text">Просмотреть обращения</div>
                  </button>

                  <button 
                    className="adminpage-action-card"
                    onClick={() => window.print()}
                  >
                    <div className="adminpage-action-icon">
                      <i className="fas fa-print"></i>
                    </div>
                    <div className="adminpage-action-text">Отчеты</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="adminpage-tab">
              <div className="adminpage-header">
                <div className="adminpage-header-title">
                  <h2>Управление пользователями</h2>
                  <p>Просмотр и управление учетными записями пользователей</p>
                </div>
              </div>

              <div className="adminpage-table-container">
                {loading ? (
                  <div className="adminpage-loading-inner">
                    <div className="adminpage-loading-spinner adminpage-small"></div>
                    <p>Загрузка пользователей...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="adminpage-table-wrapper">
                    <table className="adminpage-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Email</th>
                          <th>ФИО</th>
                          <th>Телефон</th>
                          <th>Статус</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td className="adminpage-table-id">#{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.fio}</td>
                            <td>{user.phone_num}</td>
                            <td>
                              <span className={`adminpage-status-badge ${user.id_agent ? 'adminpage-status-agent' : 'adminpage-status-user'}`}>
                                {user.id_agent ? 'Агент' : 'Пользователь'}
                              </span>
                            </td>
                            <td>
                              <div className="adminpage-table-actions">
                                <button 
                                  className="adminpage-action-btn adminpage-action-danger"
                                  onClick={() => handleDeleteUser(user.id, user.email, user.fio)}
                                  title="Удалить пользователя"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                                {!user.id_agent && (
                                  <button 
                                    className="adminpage-action-btn adminpage-action-success"
                                    onClick={() => {
                                      setAgentForm({
                                        ...agentForm,
                                        email: user.email,
                                        fio: user.fio,
                                        phone_num: user.phone_num
                                      });
                                      setActiveTab('agents');
                                    }}
                                    title="Сделать агентом"
                                  >
                                    <i className="fas fa-user-tie"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="adminpage-empty">
                    <div className="adminpage-empty-illustration">
                      <i className="fas fa-users fa-3x"></i>
                    </div>
                    <h3>Нет пользователей</h3>
                    <p>В системе пока нет зарегистрированных пользователей</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="adminpage-tab">
              <div className="adminpage-header">
                <div className="adminpage-header-title">
                  <h2>Управление агентами</h2>
                  <p>Создание и управление агентами недвижимости</p>
                </div>
              </div>

              <div className="adminpage-agents-section">
                <div className="adminpage-agents-form">
                  <h3 className="adminpage-section-title">Создать нового агента</h3>
                  <form onSubmit={handleCreateAgent}>
                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={agentForm.email}
                          onChange={(e) => setAgentForm({...agentForm, email: e.target.value})}
                          required
                          placeholder="Email агента"
                        />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Пароль *</label>
                        <input
                          type="password"
                          value={agentForm.password}
                          onChange={(e) => setAgentForm({...agentForm, password: e.target.value})}
                          required
                          minLength={6}
                          placeholder="Минимум 6 символов"
                        />
                      </div>
                    </div>

                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>ФИО *</label>
                        <input
                          type="text"
                          value={agentForm.fio}
                          onChange={(e) => setAgentForm({...agentForm, fio: e.target.value})}
                          required
                          placeholder="Фамилия и имя агента"
                        />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Телефон *</label>
                        <input
                          type="tel"
                          value={agentForm.phone_num}
                          onChange={(e) => setAgentForm({...agentForm, phone_num: e.target.value})}
                          required
                          placeholder="+375 (XX) XXX-XX-XX"
                        />
                      </div>
                    </div>

                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>Специализация *</label>
                        <input
                          type="text"
                          value={agentForm.specialization}
                          onChange={(e) => setAgentForm({...agentForm, specialization: e.target.value})}
                          required
                          placeholder="Специализация"
                        />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Опыт работы (лет) *</label>
                        <input
                          type="number"
                          value={agentForm.experience}
                          onChange={(e) => setAgentForm({...agentForm, experience: parseInt(e.target.value) || 0})}
                          required
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>

                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>Рейтинг</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={agentForm.rating}
                          onChange={(e) => setAgentForm({...agentForm, rating: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Фото агента</label>
                        <div 
                          className="adminpage-photo-upload"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleFileDrop}
                        >
                          {agentForm.photo ? (
                            <div className="adminpage-photo-preview">
                              <img src={agentForm.photo} alt="Предпросмотр" />
                              <div className="adminpage-photo-overlay">
                                <button 
                                  type="button"
                                  className="adminpage-photo-change"
                                  onClick={() => document.getElementById('photo-upload-input')?.click()}
                                >
                                  <i className="fas fa-sync-alt"></i> Заменить
                                </button>
                                <button 
                                  type="button"
                                  className="adminpage-photo-remove"
                                  onClick={() => setAgentForm({...agentForm, photo: '', photoFile: null})}
                                >
                                  <i className="fas fa-trash"></i> Удалить
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="adminpage-photo-placeholder">
                              <i className="fas fa-cloud-upload-alt"></i>
                              <p>Перетащите фото сюда или нажмите для выбора</p>
                              <p className="adminpage-photo-hint">JPG, PNG до 5MB</p>
                              <input
                                type="file"
                                id="photo-upload-input"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                              />
                              <button 
                                type="button"
                                className="adminpage-photo-select-btn"
                                onClick={() => document.getElementById('photo-upload-input')?.click()}
                              >
                                Выбрать файл
                              </button>
                            </div>
                          )}
                          {uploadingPhoto && (
                            <div className="adminpage-photo-loading">
                              <div className="adminpage-spinner-small"></div>
                              <p>Загрузка фото...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary adminpage-submit-btn"
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="adminpage-spinner-small"></div>
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i> Создать агента
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="adminpage-agents-list">
                  <h3 className="adminpage-section-title">Список агентов ({agents.length})</h3>
                  
                  {loading ? (
                    <div className="adminpage-loading-inner">
                      <div className="adminpage-loading-spinner adminpage-small"></div>
                      <p>Загрузка агентов...</p>
                    </div>
                  ) : agents.length > 0 ? (
                    <div className="adminpage-agents-grid">
                      {agents.map(agent => (
                        <div key={agent.id} className="adminpage-agent-card">
                          <div className="adminpage-agent-header">
                            <div className="adminpage-agent-avatar">
                              {agent.photo ? (
                                <img src={agent.photo} alt={agent.user.fio} />
                              ) : (
                                <div className="adminpage-avatar-placeholder">
                                  {agent.user.fio.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="adminpage-agent-info">
                              <h4>{agent.user.fio}</h4>
                              <p className="adminpage-agent-email">{agent.user.email}</p>
                              <p className="adminpage-agent-phone">{agent.user.phone_num}</p>
                            </div>
                            <span className="adminpage-agent-rating">
                              <i className="fas fa-star"></i> {agent.rating.toFixed(1)}
                            </span>
                          </div>
                          
                          <div className="adminpage-agent-details">
                            <div className="adminpage-agent-detail">
                              <span className="adminpage-detail-label">Специализация:</span>
                              <span className="adminpage-detail-value">{agent.specialization}</span>
                            </div>
                            <div className="adminpage-agent-detail">
                              <span className="adminpage-detail-label">Опыт:</span>
                              <span className="adminpage-detail-value">{agent.experience} лет</span>
                            </div>
                          </div>
                          
                          <div className="adminpage-agent-actions">
                            <button 
                              className="adminpage-action-btn adminpage-action-danger"
                              onClick={() => handleDeleteAgent(agent.id, agent.user.fio)}
                            >
                              <i className="fas fa-trash"></i> Удалить
                            </button>
                            <button 
                              className="adminpage-action-btn adminpage-action-secondary"
                              onClick={() => {
                                setAgentForm({
                                  email: agent.user.email,
                                  fio: agent.user.fio,
                                  password: '',
                                  phone_num: agent.user.phone_num,
                                  specialization: agent.specialization,
                                  experience: agent.experience,
                                  photo: agent.photo,
                                  rating: agent.rating,
                                  photoFile: null
                                });
                              }}
                            >
                              <i className="fas fa-edit"></i> Редактировать
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="adminpage-empty">
                      <div className="adminpage-empty-illustration">
                        <i className="fas fa-user-tie fa-3x"></i>
                      </div>
                      <h3>Нет агентов</h3>
                      <p>В системе пока нет зарегистрированных агентов</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="adminpage-tab">
              <div className="adminpage-header">
                <div className="adminpage-header-title">
                  <h2>Обращения в поддержку</h2>
                  <p>Просмотр обращений пользователей</p>
                </div>
              </div>

              <div className="adminpage-feedback-container">
                {loading ? (
                  <div className="adminpage-loading-inner">
                    <div className="adminpage-loading-spinner adminpage-small"></div>
                    <p>Загрузка обращений...</p>
                  </div>
                ) : feedback.length > 0 ? (
                  <div className="adminpage-feedback-list">
                    {feedback.map(item => (
                      <div key={item.id} className="adminpage-feedback-card">
                        <div className="adminpage-feedback-header">
                          <div className="adminpage-feedback-user">
                            <div className="adminpage-feedback-avatar">
                              {item.user.fio.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="adminpage-feedback-user-info">
                              <strong>{item.user.fio}</strong>
                              <div className="adminpage-feedback-user-contacts">
                                <span>{item.user.email}</span>
                                {item.user.phone_num && <span>• {item.user.phone_num}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="adminpage-feedback-meta">
                            <span className="adminpage-feedback-topic">{item.topic}</span>
                            <span className="adminpage-feedback-date">{formatDate(item.createdAt)}</span>
                            <button 
                              className="adminpage-action-btn adminpage-action-danger"
                              onClick={() => handleDeleteFeedback(item.id, item.topic)}
                              title="Удалить обращение"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div className="adminpage-feedback-content">
                          <p>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="adminpage-empty">
                    <div className="adminpage-empty-illustration">
                      <i className="fas fa-comments fa-3x"></i>
                    </div>
                    <h3>Нет обращений</h3>
                    <p>Пользователи еще не отправляли обращения в поддержку</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;