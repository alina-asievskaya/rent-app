import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faUpload } from '@fortawesome/free-solid-svg-icons';

interface ServiceFormData {
  title: string;
  description: string;
  price: number;
  grams?: number | null;
  photoUrl?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: string; 
  initialData?: {
    id: number;
    title: string;
    description: string;
    price: number;
    grams?: number | null;
    photoUrl?: string | null;
  } | null;
}

const ServiceFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, category, initialData }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    price: 0,
    grams: null,
    photoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        grams: initialData.grams || null,
        photoUrl: initialData.photoUrl || '',
      });
    } else {
      setFormData({ title: '', description: '', price: 0, grams: null, photoUrl: '' });
    }
  }, [initialData]);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rent_app');
    formData.append('cloud_name', 'dnblbt7wc');
    const response = await fetch('https://api.cloudinary.com/v1_1/dnblbt7wc/image/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.secure_url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingPhoto(true);
    const url = await uploadToCloudinary(e.target.files[0]);
    if (url) setFormData(prev => ({ ...prev, photoUrl: url }));
    setUploadingPhoto(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || formData.price <= 0) {
      alert('Заполните все обязательные поля');
      return;
    }
    if (category === 'catering' && (!formData.grams || formData.grams <= 0)) {
      alert('Укажите граммовку для кейтеринга');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = initialData
        ? `http://localhost:5213/api/Services/${initialData.id}`
        : 'http://localhost:5213/api/Services';
      const method = initialData ? 'PUT' : 'POST';
      const body = JSON.stringify({
        category,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        grams: formData.grams,
        photoUrl: formData.photoUrl,
      });
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
      });
      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Редактировать услугу' : 'Добавить услугу'}</h3>
          <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Описание *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Цена (BYN) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </div>
          {category === 'catering' && (
            <div className="form-group">
              <label>Граммовка (грамм) *</label>
              <input
                type="number"
                value={formData.grams || ''}
                onChange={e => setFormData({ ...formData, grams: parseInt(e.target.value) || null })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Фото</label>
            <div className="photo-upload-area">
              {formData.photoUrl ? (
                <div className="photo-preview">
                  <img src={formData.photoUrl} alt="Preview" />
                  <button type="button" onClick={() => setFormData({ ...formData, photoUrl: '' })}>Удалить</button>
                </div>
              ) : (
                <label className="upload-btn">
                  <FontAwesomeIcon icon={faUpload} /> Загрузить фото
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              )}
              {uploadingPhoto && <div className="spinner-small"></div>}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" disabled={loading}>{loading ? 'Сохранение...' : <><FontAwesomeIcon icon={faSave} /> Сохранить</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;