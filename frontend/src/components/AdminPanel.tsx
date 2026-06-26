import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faConciergeBell, faCheck, faTimes, faTrash,
  faMapMarkerAlt, faPhone, faEnvelope, faCalendarAlt, faUser, faReply
} from '@fortawesome/free-solid-svg-icons';
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

interface SupportReply {
  id: number;
  feedbackId: number;
  adminName: string;
  message: string;
  createdAt: string;
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
  replies?: SupportReply[];
  showReplyForm?: boolean;
  replyText?: string;
}

interface ServiceRequest {
  id: number;
  userId: number;
  userFio: string;
  userEmail: string;
  phone: string;
  serviceType: string;
  companyName: string;
  city: string;
  description: string;
  status: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  activeUsers: number;
  totalFeedback: number;
}

const formatDateOnly = (dateStr: string): string => {
  if (!dateStr) return '—';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const localDate = new Date(year, month - 1, day);
    if (!isNaN(localDate.getTime())) {
      return localDate.toLocaleDateString('ru-RU');
    }
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU');
};

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'agents' | 'feedback' | 'services'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    activeUsers: 0,
    totalFeedback: 0
  });

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

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showConfirmation = (title: string, message: string, type: 'danger' | 'warning' | 'info', onConfirm: () => void) => {
    setConfirmationModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogoutConfirmation = useCallback(() => {
    showConfirmation('Выход из системы', 'Вы уверены, что хотите выйти из административной панели?', 'warning', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    });
  }, [navigate]);

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
      if (!response.ok) throw new Error(`Cloudinary upload failed: ${response.status}`);
      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error('Ошибка загрузки в Cloudinary:', error);
      showToast('Ошибка загрузки фото в облако', 'error');
      return null;
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) handleLogoutConfirmation();
        throw new Error(`Stats fetch failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) setAdminStats(data.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      showToast('Ошибка загрузки статистики', 'error');
    }
  }, [token, API_BASE_URL, handleLogoutConfirmation, showToast]);

  const fetchServiceRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/service-requests`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) handleLogoutConfirmation();
        throw new Error(`Service requests fetch failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) setServiceRequests(data.data);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      showToast('Ошибка загрузки заявок', 'error');
    }
  }, [token, API_BASE_URL, handleLogoutConfirmation, showToast]);

  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/feedback`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Feedback fetch failed: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        console.log('API /admin/feedback вернул данные:', data.data);
        (data.data as Feedback[]).forEach((fb: Feedback) => {
          console.log(`Обращение ${fb.id} имеет replies:`, fb.replies);
        });
        const feedbackWithUI = (data.data as Feedback[]).map((fb) => ({
          ...fb,
          showReplyForm: false,
          replyText: ''
        }));
        setFeedback(feedbackWithUI);
      }
    } catch (error) {
      console.error('Ошибка загрузки обращений:', error);
      showToast('Ошибка загрузки обращений', 'error');
    }
  }, [token, API_BASE_URL, showToast]);

  const handleReplySubmit = useCallback(async (feedbackId: number, message: string) => {
    if (!message.trim()) {
      showToast('Введите текст ответа', 'warning');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/${feedbackId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Ответ отправлен', 'success');
        setFeedback(prev => prev.map(fb =>
          fb.id === feedbackId ? { ...fb, showReplyForm: false, replyText: '' } : fb
        ));
        await fetchFeedback();
      } else {
        showToast(data.message || 'Ошибка отправки', 'error');
      }
    } catch (error) {
      console.error('Ошибка отправки ответа:', error);
      showToast('Ошибка соединения', 'error');
    }
  }, [API_BASE_URL, token, showToast, fetchFeedback]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        await fetchStats();
        setLoading(false);
        return;
      }
      const endpoints: Record<string, string> = {
        users: `${API_BASE_URL}/api/admin/users`,
        agents: `${API_BASE_URL}/api/admin/agents`,
        feedback: `${API_BASE_URL}/api/admin/feedback`,
        services: `${API_BASE_URL}/api/admin/service-requests`
      };
      const endpoint = endpoints[activeTab];
      if (!endpoint) {
        setLoading(false);
        return;
      }
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) handleLogoutConfirmation();
        throw new Error(`Data fetch failed: ${response.status}`);
      }
      const data = await response.json();
      if (activeTab === 'users') setUsers(data.data);
      if (activeTab === 'agents') setAgents(data.data);
      if (activeTab === 'feedback') {
        const feedbackWithUI = (data.data as Feedback[]).map((fb) => ({
          ...fb,
          showReplyForm: false,
          replyText: ''
        }));
        setFeedback(feedbackWithUI);
      }
      if (activeTab === 'services') setServiceRequests(data.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, API_BASE_URL, fetchStats, handleLogoutConfirmation, showToast]);

  useEffect(() => {
    if (!token || user?.email !== 'admin@gmail.com') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [token, user?.email, navigate, fetchData]);

  useEffect(() => {
    if (token && user?.email === 'admin@gmail.com') fetchData();
  }, [activeTab, fetchData, token, user?.email]);

  const handleDeleteUser = (userId: number, userEmail: string, userFio: string) => {
    showConfirmation(
      'Удаление пользователя',
      `Вы собираетесь удалить пользователя:\n\n${userFio}\n${userEmail}\n\nВы уверены что хотите удалить пользователя?`,
      'danger',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (!response.ok) throw new Error(`Delete user failed: ${response.status}`);
          const data = await response.json();
          if (data.success) {
            setUsers(users.filter(u => u.id !== userId));
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
      'Удаление организатора',
      `Вы собираетесь удалить организатора:\n\n${agentName}\n\nВы уверены что хотите удалить организатора?`,
      'danger',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/agents/${agentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (!response.ok) throw new Error(`Delete agent failed: ${response.status}`);
          const data = await response.json();
          if (data.success) {
            setAgents(agents.filter(a => a.id !== agentId));
            showToast('Организатор успешно удален', 'success');
            fetchStats();
          } else {
            showToast(data.message || 'Ошибка при удалении организатора', 'error');
          }
        } catch (error) {
          console.error('Ошибка удаления организатора:', error);
          showToast('Ошибка при удалении организатора', 'error');
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
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (!response.ok) throw new Error(`Delete feedback failed: ${response.status}`);
          const data = await response.json();
          if (data.success) {
            setFeedback(prev => prev.filter(f => f.id !== feedbackId));
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

  const handleUpdateServiceStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/service-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Статус изменён на ${newStatus === 'approved' ? 'одобрено' : 'отклонено'}`, 'success');
        fetchServiceRequests();
      } else {
        showToast(data.message || 'Ошибка обновления статуса', 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      showToast('Ошибка соединения', 'error');
    }
  };

  const handleDeleteServiceRequest = (id: number) => {
    showConfirmation('Удаление заявки', 'Вы уверены, что хотите удалить эту заявку?', 'danger', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/service-requests/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          showToast('Заявка удалена', 'success');
          setServiceRequests(prev => prev.filter(req => req.id !== id));
        } else {
          showToast(data.message || 'Ошибка удаления', 'error');
        }
      } catch (error) {
        console.error('Ошибка удаления заявки:', error);
        showToast('Ошибка соединения', 'error');
      }
    });
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
    if (!agentForm.email || !agentForm.fio || !agentForm.password || !agentForm.phone_num || !agentForm.specialization) {
      showToast('Заполните все обязательные поля', 'warning');
      return;
    }
    if (agentForm.password.length < 6) {
      showToast('Пароль должен содержать минимум 6 символов', 'warning');
      return;
    }
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        showToast('Организатор успешно создан', 'success');
        setAgentForm({
          email: '', fio: '', password: '', phone_num: '', specialization: '',
          experience: 0, photo: '', rating: 0, photoFile: null
        });
        fetchData();
      } else {
        showToast(`Ошибка: ${data.message || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Ошибка создания организатора:', error);
      showToast('Ошибка при создании организатора', 'error');
    } finally {
      setUploadingPhoto(false);
    }
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

  const renderStatsTab = () => (
    <div className="adminpage-tab">
      <div className="adminpage-header">
        <div className="adminpage-header-title">
          <h2>Административная панель</h2>
          <p>Статистика и управление системой</p>
        </div>
        <div className="adminpage-header-time">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <div className="adminpage-stats-grid">
        <div className="adminpage-stat-card adminpage-stat-primary">
          <div className="adminpage-stat-icon"><i className="fas fa-users"></i></div>
          <div className="adminpage-stat-content">
            <div className="adminpage-stat-number">{adminStats.totalUsers}</div>
            <div className="adminpage-stat-label">Всего пользователей</div>
            <div className="adminpage-stat-sub">{adminStats.activeUsers} активных</div>
          </div>
        </div>
        <div className="adminpage-stat-card adminpage-stat-success">
          <div className="adminpage-stat-icon"><i className="fas fa-user-tie"></i></div>
          <div className="adminpage-stat-content">
            <div className="adminpage-stat-number">{adminStats.totalAgents}</div>
            <div className="adminpage-stat-label">Организаторов</div>
            <div className="adminpage-stat-sub">в системе</div>
          </div>
        </div>
        <div className="adminpage-stat-card adminpage-stat-warning">
          <div className="adminpage-stat-icon"><i className="fas fa-comments"></i></div>
          <div className="adminpage-stat-content">
            <div className="adminpage-stat-number">{adminStats.totalFeedback}</div>
            <div className="adminpage-stat-label">Обращений</div>
            <div className="adminpage-stat-sub">в поддержку</div>
          </div>
        </div>
      </div>
      <div className="adminpage-quick-actions">
        <h3 className="adminpage-section-title">Быстрые действия</h3>
        <div className="adminpage-actions-grid">
          <button className="adminpage-action-card" onClick={() => setActiveTab('users')}>
            <div className="adminpage-action-icon"><i className="fas fa-user-plus"></i></div>
            <div className="adminpage-action-text">Просмотреть пользователей</div>
          </button>
          <button className="adminpage-action-card" onClick={() => setActiveTab('agents')}>
            <div className="adminpage-action-icon"><i className="fas fa-user-tie"></i></div>
            <div className="adminpage-action-text">Создать организатора</div>
          </button>
          <button className="adminpage-action-card" onClick={() => setActiveTab('feedback')}>
            <div className="adminpage-action-icon"><i className="fas fa-eye"></i></div>
            <div className="adminpage-action-text">Просмотреть обращения</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
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
                    <td>{user.email}</td>
                    <td>{user.fio}</td>
                    <td>{user.phone_num}</td>
                    <td>
                      <span className={`adminpage-status-badge ${user.id_agent ? 'adminpage-status-agent' : 'adminpage-status-user'}`}>
                        {user.id_agent ? 'Организатор' : 'Пользователь'}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="adminpage-empty">
            <div className="adminpage-empty-illustration"><i className="fas fa-users fa-3x"></i></div>
            <h3>Нет пользователей</h3>
            <p>В системе пока нет зарегистрированных пользователей</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedbackTab = () => (
    <div className="adminpage-tab">
      <div className="adminpage-header">
        <div className="adminpage-header-title">
          <h2>Обращения в поддержку</h2>
          <p>Просмотр и ответ на обращения пользователей</p>
        </div>
      </div>
      <div className="adminpage-feedback-container">
        {loading ? (
          <div className="adminpage-loading-inner"><div className="adminpage-loading-spinner adminpage-small"></div><p>Загрузка обращений...</p></div>
        ) : feedback.length > 0 ? (
          <div className="adminpage-feedback-list">
            {feedback.map(item => (
              <div key={item.id} className="adminpage-feedback-card">
                <div className="adminpage-feedback-header">
                  <div className="adminpage-feedback-user">
                    <div className="adminpage-feedback-avatar">{item.user.fio.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
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
                    <span className="adminpage-feedback-date">{formatDateOnly(item.createdAt)}</span>
                    <button className="adminpage-action-btn adminpage-action-danger" onClick={() => handleDeleteFeedback(item.id, item.topic)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="adminpage-feedback-content">
                  <p>{item.text}</p>
                </div>

                {item.replies && item.replies.length > 0 && (
                  <div className="adminpage-replies-list">
                    <h4>Ответы администратора:</h4>
                    {item.replies.map(reply => (
                      <div key={reply.id} className="adminpage-reply-item">
                        <div className="adminpage-reply-header">
                          <strong>{reply.adminName}</strong>
                          <span>{formatDateOnly(reply.createdAt)}</span>
                        </div>
                        <div className="adminpage-reply-message">{reply.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="adminpage-feedback-actions">
                  <button
                    className="adminpage-reply-btn"
                    onClick={() => {
                      setFeedback(prev => prev.map(fb =>
                        fb.id === item.id ? { ...fb, showReplyForm: !fb.showReplyForm } : fb
                      ));
                    }}
                  >
                    <FontAwesomeIcon icon={faReply} /> Ответить
                  </button>
                </div>

                {item.showReplyForm && (
                  <div className="adminpage-reply-form">
                    <textarea
                      placeholder="Введите ответ..."
                      value={item.replyText || ''}
                      onChange={(e) => {
                        setFeedback(prev => prev.map(fb =>
                          fb.id === item.id ? { ...fb, replyText: e.target.value } : fb
                        ));
                      }}
                      rows={3}
                    />
                    <div className="adminpage-reply-form-actions">
                      <button
                        className="adminpage-submit-reply"
                        onClick={() => handleReplySubmit(item.id, item.replyText || '')}
                      >
                        Отправить ответ
                      </button>
                      <button
                        className="adminpage-cancel-reply"
                        onClick={() => {
                          setFeedback(prev => prev.map(fb =>
                            fb.id === item.id ? { ...fb, showReplyForm: false, replyText: '' } : fb
                          ));
                        }}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="adminpage-empty">
            <div className="adminpage-empty-illustration"><i className="fas fa-comments fa-3x"></i></div>
            <h3>Нет обращений</h3>
            <p>Пользователи еще не отправляли обращения в поддержку</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="adminpage-tab">
      <div className="adminpage-header">
        <div className="adminpage-header-title">
          <h2>Заявки на кейтеринг</h2>
          <p>Предложения от пользователей (кейтеринг)</p>
        </div>
      </div>
      <div className="adminpage-services-container">
        {loading ? (
          <div className="adminpage-loading-inner">
            <div className="adminpage-loading-spinner adminpage-small"></div>
            <p>Загрузка заявок...</p>
          </div>
        ) : serviceRequests.length === 0 ? (
          <div className="adminpage-empty">
            <div className="adminpage-empty-illustration"><FontAwesomeIcon icon={faConciergeBell} size="3x" /></div>
            <h3>Нет заявок</h3>
            <p>Пользователи пока не отправляли предложения по кейтерингу</p>
          </div>
        ) : (
          <div className="adminpage-services-grid">
            {serviceRequests.map(req => (
              <div key={req.id} className="adminpage-service-card">
                <div className="adminpage-service-card__image">
                  <FontAwesomeIcon icon={faConciergeBell} size="3x" />
                </div>
                <div className="adminpage-service-card__content">
                  <div className="adminpage-service-card__header">
                    <h3>{req.companyName || 'Компания не указана'}</h3>
                    <span className={`adminpage-status-badge ${
                      req.status === 'approved' ? 'adminpage-status-approved' :
                      req.status === 'rejected' ? 'adminpage-status-rejected' :
                      'adminpage-status-pending'
                    }`}>
                      {req.status === 'approved' ? 'Одобрено' : req.status === 'rejected' ? 'Отклонено' : 'На рассмотрении'}
                    </span>
                  </div>
                  <div className="adminpage-service-card__details">
                    <p><FontAwesomeIcon icon={faUser} /> {req.userFio}</p>
                    <p><FontAwesomeIcon icon={faEnvelope} /> {req.userEmail}</p>
                    <p><FontAwesomeIcon icon={faPhone} /> {req.phone}</p>
                    <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {req.city}</p>
                    <p className="adminpage-service-card__desc">{req.description}</p>
                    <p><FontAwesomeIcon icon={faCalendarAlt} /> {formatDateOnly(req.createdAt)}</p>
                  </div>
                  <div className="adminpage-service-card__actions">
                    {req.status === 'pending' && (
                      <>
                        <button
                          className="adminpage-action-btn adminpage-action-success"
                          onClick={() => handleUpdateServiceStatus(req.id, 'approved')}
                          title="Одобрить"
                        >
                          <FontAwesomeIcon icon={faCheck} /> Одобрить
                        </button>
                        <button
                          className="adminpage-action-btn adminpage-action-warning"
                          onClick={() => handleUpdateServiceStatus(req.id, 'rejected')}
                          title="Отклонить"
                        >
                          <FontAwesomeIcon icon={faTimes} /> Отклонить
                        </button>
                      </>
                    )}
                    <button
                      className="adminpage-action-btn adminpage-action-danger"
                      onClick={() => handleDeleteServiceRequest(req.id)}
                      title="Удалить заявку"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading && activeTab === 'stats') {
    return (
      <div className="adminpage-loading-full">
        <div className="adminpage-loading-content">
          <div className="adminpage-spinner"></div>
          <p>Загрузка административной панели...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminpage-wrapper">
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
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        onConfirm={() => { confirmationModal.onConfirm(); closeConfirmation(); }}
        onCancel={closeConfirmation}
        confirmText={confirmationModal.type === 'danger' ? 'Удалить' : 'Подтвердить'}
        cancelText="Отмена"
      />

      <div className="adminpage-container">
        <div className="adminpage-sidebar">
          <div className="adminpage-avatar">
            <div className="adminpage-avatar-circle"><i className="fas fa-shield-alt"></i></div>
            <h3>Администратор</h3>
            <p className="adminpage-email">{user?.email}</p>
            <div className="adminpage-role adminpage-admin">
              <span className="adminpage-role-dot"></span> Системный администратор
            </div>
          </div>
          <nav className="adminpage-nav">
            <button className={`adminpage-nav-item ${activeTab === 'stats' ? 'adminpage-nav-active' : ''}`} onClick={() => setActiveTab('stats')}>
              <i className="adminpage-nav-icon adminpage-stats-icon"></i><span>Статистика</span>
            </button>
            <button className={`adminpage-nav-item ${activeTab === 'users' ? 'adminpage-nav-active' : ''}`} onClick={() => setActiveTab('users')}>
              <i className="adminpage-nav-icon adminpage-users-icon"></i><span>Пользователи</span>
              <span className="adminpage-nav-badge">{adminStats.totalUsers}</span>
            </button>
            <button className={`adminpage-nav-item ${activeTab === 'agents' ? 'adminpage-nav-active' : ''}`} onClick={() => setActiveTab('agents')}>
              <i className="adminpage-nav-icon adminpage-agents-icon"></i><span>Организаторы</span>
              <span className="adminpage-nav-badge">{adminStats.totalAgents}</span>
            </button>
            <button className={`adminpage-nav-item ${activeTab === 'feedback' ? 'adminpage-nav-active' : ''}`} onClick={() => setActiveTab('feedback')}>
              <i className="adminpage-nav-icon adminpage-feedback-icon"></i><span>Обращения</span>
              <span className="adminpage-nav-badge">{adminStats.totalFeedback}</span>
            </button>
            <button className={`adminpage-nav-item ${activeTab === 'services' ? 'adminpage-nav-active' : ''}`} onClick={() => setActiveTab('services')}>
              <FontAwesomeIcon icon={faConciergeBell} className="adminpage-nav-icon" /><span>Кейтеринг</span>
              <span className="adminpage-nav-badge">{serviceRequests.length}</span>
            </button>
            <div className="adminpage-nav-divider"></div>
            <button className="adminpage-nav-item adminpage-nav-back" onClick={() => navigate('/')}>
              <i className="adminpage-nav-icon adminpage-back-icon"></i><span>На главную</span>
            </button>
            <button className="adminpage-nav-item adminpage-nav-logout" onClick={handleLogoutConfirmation}>
              <i className="adminpage-nav-icon adminpage-logout-icon"></i><span>Выйти</span>
            </button>
          </nav>
        </div>

        <div className="adminpage-content">
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'agents' && (
            <div className="adminpage-tab">
              <div className="adminpage-header">
                <div className="adminpage-header-title">
                  <h2>Управление организаторами</h2>
                  <p>Создание и управление организаторами праздников</p>
                </div>
              </div>
              <div className="adminpage-agents-section">
                <div className="adminpage-agents-form">
                  <h3 className="adminpage-section-title">Создать нового организатора</h3>
                  <form onSubmit={handleCreateAgent}>
                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>Email *</label>
                        <input type="email" value={agentForm.email} onChange={(e) => setAgentForm({...agentForm, email: e.target.value})} required />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Пароль *</label>
                        <input type="password" value={agentForm.password} onChange={(e) => setAgentForm({...agentForm, password: e.target.value})} required minLength={6} />
                      </div>
                    </div>
                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>ФИО *</label>
                        <input type="text" value={agentForm.fio} onChange={(e) => setAgentForm({...agentForm, fio: e.target.value})} required />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Телефон *</label>
                        <input type="tel" value={agentForm.phone_num} onChange={(e) => setAgentForm({...agentForm, phone_num: e.target.value})} required />
                      </div>
                    </div>
                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>Специализация *</label>
                        <input type="text" value={agentForm.specialization} onChange={(e) => setAgentForm({...agentForm, specialization: e.target.value})} required />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Опыт работы (лет) *</label>
                        <input type="number" value={agentForm.experience} onChange={(e) => setAgentForm({...agentForm, experience: parseInt(e.target.value) || 0})} required min="0" max="50" />
                      </div>
                    </div>
                    <div className="adminpage-form-row">
                      <div className="adminpage-form-group">
                        <label>Рейтинг</label>
                        <input type="number" step="0.1" min="0" max="5" value={agentForm.rating} onChange={(e) => setAgentForm({...agentForm, rating: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="adminpage-form-group">
                        <label>Фото организатора</label>
                        <div className="adminpage-photo-upload" onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}>
                          {agentForm.photo ? (
                            <div className="adminpage-photo-preview">
                              <img src={agentForm.photo} alt="Предпросмотр" />
                              <div className="adminpage-photo-overlay">
                                <button type="button" className="adminpage-photo-change" onClick={() => document.getElementById('photo-upload-input')?.click()}>Заменить</button>
                                <button type="button" className="adminpage-photo-remove" onClick={() => setAgentForm({...agentForm, photo: '', photoFile: null})}>Удалить</button>
                              </div>
                            </div>
                          ) : (
                            <div className="adminpage-photo-placeholder">
                              <i className="fas fa-cloud-upload-alt"></i>
                              <p>Перетащите фото сюда или нажмите для выбора</p>
                              <p className="adminpage-photo-hint">JPG, PNG до 5MB</p>
                              <input type="file" id="photo-upload-input" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                              <button type="button" className="adminpage-photo-select-btn" onClick={() => document.getElementById('photo-upload-input')?.click()}>Выбрать файл</button>
                            </div>
                          )}
                          {uploadingPhoto && (
                            <div className="adminpage-photo-loading">
                              <div className="adminpage-spinner-small"></div><p>Загрузка фото...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary adminpage-submit-btn" disabled={uploadingPhoto}>
                      {uploadingPhoto ? <> <div className="adminpage-spinner-small"></div> Загрузка... </> : <> <i className="fas fa-plus"></i> Создать организатора </>}
                    </button>
                  </form>
                </div>
                <div className="adminpage-agents-list">
                  <h3 className="adminpage-section-title">Список организаторов ({agents.length})</h3>
                  {loading ? (
                    <div className="adminpage-loading-inner"><div className="adminpage-loading-spinner adminpage-small"></div><p>Загрузка организаторов...</p></div>
                  ) : agents.length > 0 ? (
                    <div className="adminpage-agents-grid">
                      {agents.map(agent => (
                        <div key={agent.id} className="adminpage-agent-card">
                          <div className="adminpage-agent-header">
                            <div className="adminpage-agent-avatar">
                              {agent.photo ? <img src={agent.photo} alt={agent.user.fio} /> : <div className="adminpage-avatar-placeholder">{agent.user.fio.split(' ').map(n => n[0]).join('').toUpperCase()}</div>}
                            </div>
                            <div className="adminpage-agent-info">
                              <h4>{agent.user.fio}</h4>
                              <p className="adminpage-agent-email">{agent.user.email}</p>
                              <p className="adminpage-agent-phone">{agent.user.phone_num}</p>
                            </div>
                            <span className="adminpage-agent-rating"><i className="fas fa-star"></i> {agent.rating.toFixed(1)}</span>
                          </div>
                          <div className="adminpage-agent-details">
                            <div className="adminpage-agent-detail"><span className="adminpage-detail-label">Специализация:</span><span className="adminpage-detail-value">{agent.specialization}</span></div>
                            <div className="adminpage-agent-detail"><span className="adminpage-detail-label">Опыт:</span><span className="adminpage-detail-value">{agent.experience} лет</span></div>
                          </div>
                          <div className="adminpage-agent-actions">
                            <button className="adminpage-action-btn adminpage-action-danger" onClick={() => handleDeleteAgent(agent.id, agent.user.fio)}><i className="fas fa-trash"></i> Удалить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="adminpage-empty"><div className="adminpage-empty-illustration"><i className="fas fa-user-tie fa-3x"></i></div><h3>Нет организаторов</h3><p>В системе пока нет зарегистрированных организаторов</p></div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'feedback' && renderFeedbackTab()}
          {activeTab === 'services' && renderServicesTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;