// frontend/src/components/CateringMenu.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSave, faTimes, faUtensils } from '@fortawesome/free-solid-svg-icons';
import '../pages/ProfilePage.css';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price?: number | null;
  weightGrams?: number | null;
  photoUrl: string;
  createdAt: string;
}

const CateringMenu: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [editingCompany, setEditingCompany] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    weightGrams: '',
    photoUrl: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE = 'http://localhost:5213';

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/catering/my-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.companyName) {
          setCompanyName(data.companyName);
          setTempCompanyName(data.companyName);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки информации компании:', error);
    }
  }, [token]);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cateringmenu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data || []);
      } else {
        setError(data.message || 'Ошибка загрузки меню');
      }
    } catch (error) {
      console.error(error);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompanyInfo();
    fetchMenu();
  }, [fetchCompanyInfo, fetchMenu]);

  const handleUpdateCompany = async () => {
    if (!tempCompanyName.trim()) {
      setError('Название компании не может быть пустым');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/catering/update-company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ companyName: tempCompanyName })
      });
      const data = await response.json();
      if (data.success) {
        setCompanyName(tempCompanyName);
        setEditingCompany(false);
        setError(null);
      } else {
        setError(data.message || 'Ошибка обновления');
      }
    } catch (error) {
      console.error(error);
      setError('Ошибка соединения');
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
      setError('Ошибка загрузки фото');
      return null;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, photoUrl: url }));
    }
    setUploadingPhoto(false);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Название блюда обязательно');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        weightGrams: formData.weightGrams ? parseInt(formData.weightGrams) : null,
        photoUrl: formData.photoUrl
      };
      let url = `${API_BASE}/api/cateringmenu`;
      let method = 'POST';
      if (editingItem) {
        url += `/${editingItem.id}`;
        method = 'PUT';
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({ name: '', description: '', price: '', weightGrams: '', photoUrl: '' });
        fetchMenu();
      } else {
        setError(data.message || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error(error);
      setError('Ошибка соединения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Удалить блюдо?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/cateringmenu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
      } else {
        setError(data.message || 'Ошибка удаления');
      }
    } catch (error) {
      console.error(error);
      setError('Ошибка соединения');
    }
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      weightGrams: item.weightGrams?.toString() || '',
      photoUrl: item.photoUrl || ''
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', weightGrams: '', photoUrl: '' });
  };

  return (
    <div className="profilepage-tab">
      <div className="profilepage-header">
        <div className="profilepage-header-title">
          <h2>Управление меню кейтеринга</h2>
          <p>Ваши блюда и информация о компании</p>
        </div>
      </div>

      {error && (
        <div className="profilepage-message error">
          <div className="profilepage-message-content">{error}</div>
          <button className="profilepage-message-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Информация о компании */}
      <div className="profilepage-info" style={{ marginBottom: '30px' }}>
        <h3 className="profilepage-section-title">Информация о компании</h3>
        <div className="profilepage-info-stack">
          <div className="profilepage-info-stack-item">
            <div className="profilepage-stack-header">
              <label className="profilepage-stack-label">Название ИП / Компании</label>
              {editingCompany ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    className="profilepage-stack-input"
                    style={{ flex: 1 }}
                  />
                  <button className="profilepage-btn-primary" onClick={handleUpdateCompany}>
                    <FontAwesomeIcon icon={faSave} /> Сохранить
                  </button>
                  <button className="profilepage-btn-secondary" onClick={() => setEditingCompany(false)}>
                    <FontAwesomeIcon icon={faTimes} /> Отмена
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="profilepage-stack-value">{companyName || 'Не указано'}</div>
                  <button className="profilepage-btn-secondary" onClick={() => setEditingCompany(true)}>
                    <FontAwesomeIcon icon={faEdit} /> Редактировать
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Список блюд */}
      <div className="profilepage-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="profilepage-section-title" style={{ margin: 0 }}>Меню блюд</h3>
          <button className="profilepage-btn-primary" onClick={() => { setEditingItem(null); setFormData({ name: '', description: '', price: '', weightGrams: '', photoUrl: '' }); setShowForm(true); }}>
            <FontAwesomeIcon icon={faPlus} /> Добавить блюдо
          </button>
        </div>

        {loading ? (
          <div className="profilepage-loading-inner"><div className="profilepage-spinner-small"></div><p>Загрузка меню...</p></div>
        ) : menuItems.length === 0 ? (
          <div className="profilepage-empty">
            <FontAwesomeIcon icon={faUtensils} size="3x" style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
            <p>У вас пока нет блюд в меню. Нажмите "Добавить блюдо", чтобы начать.</p>
          </div>
        ) : (
          <div className="profilepage-ads-list">
            {menuItems.map(item => (
              <div key={item.id} className="profilepage-ad-item">
                {item.photoUrl && (
                  <div className="profilepage-ad-item-image" style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                    <img src={item.photoUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="profilepage-ad-item-content">
                  <div className="profilepage-ad-item-header">
                    <h3>{item.name}</h3>
                    {item.price != null && item.price > 0 && (
                      <div className="profilepage-ad-type">{item.price} BYN</div>
                    )}
                  </div>
                  {item.weightGrams && (
                    <div className="profilepage-ad-item-info">
                      <span>Вес: {item.weightGrams} г</span>
                    </div>
                  )}
                  {item.description && (
                    <p className="profilepage-ad-item-description">{item.description}</p>
                  )}
                  <div className="profilepage-ad-item-actions">
                    <button className="profilepage-btn-primary" onClick={() => startEditItem(item)}>
                      <FontAwesomeIcon icon={faEdit} /> Редактировать
                    </button>
                    <button className="profilepage-btn-danger" onClick={() => handleDeleteItem(item.id)}>
                      <FontAwesomeIcon icon={faTrash} /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальная форма добавления/редактирования блюда */}
      {showForm && (
        <div className="modal-overlay" onClick={cancelForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Редактировать блюдо' : 'Добавить блюдо'}</h3>
              <button className="modal-close" onClick={cancelForm}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmitItem}>
              <div className="form-group">
                <label>Название блюда *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Цена (BYN)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Вес (граммы)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.weightGrams}
                  onChange={e => setFormData({ ...formData, weightGrams: e.target.value })}
                  placeholder="200"
                />
              </div>
              <div className="form-group">
                <label>Фото блюда</label>
                <div className="profilepage-photo-upload" style={{ marginTop: '8px' }}>
                  {formData.photoUrl ? (
                    <div className="profilepage-photo-preview">
                      <img src={formData.photoUrl} alt="Предпросмотр" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button type="button" className="profilepage-photo-remove" onClick={() => setFormData({ ...formData, photoUrl: '' })}>
                        <FontAwesomeIcon icon={faTrash} /> Удалить
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto && <div className="profilepage-spinner-small"></div>}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="profilepage-btn-secondary" onClick={cancelForm}>Отмена</button>
                <button type="submit" className="profilepage-btn-primary" disabled={submitting || uploadingPhoto}>
                  {submitting ? 'Сохранение...' : <><FontAwesomeIcon icon={faSave} /> Сохранить</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CateringMenu;