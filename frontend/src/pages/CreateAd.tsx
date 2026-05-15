import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './CreateAd.css';

const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }> = ({ 
  message, type, onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle'
  };

  return (
    <div className={`createad-notification createad-${type}`}>
      <div className="createad-notification-content">
        <i className={`createad-notification-icon ${icons[type]}`}></i>
        <span className="createad-notification-text">{message}</span>
      </div>
      <button className="createad-notification-close" onClick={onClose}>&times;</button>
    </div>
  );
};

const CreateAd: React.FC = () => {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const [formData, setFormData] = useState({
    price: '',
    area: '',
    rooms: '1',
    bathrooms: '1',
    floor: '1',
    houseType: 'Коттедж',
    rentType: 'month', // 'day' или 'month'
    region: 'Минская область',
    city: 'Минск',
    district: '',
    street: '',
    description: '',
    conditioner: false,
    furniture: false,
    internet: false,
    security: false,
    videoSurveillance: false,
    fireAlarm: false,
    parking: false,
    garage: false,
    garden: false,
    swimmingPool: false,
    sauna: false,
    balcony: false,
    transport: '',
    education: '',
    shops: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    hidePhone: false,
    photos: [] as File[],
    photoUrls: [] as string[],
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => setNotification({ message, type });
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.fio || user.username || '',
        contactEmail: user.email || '',
        contactPhone: user.phone_num || '',
      }));
    }
    const draft = localStorage.getItem('propertyDraft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setFormData(parsedDraft.formData);
      setFormStep(parsedDraft.formStep);
    }
  }, [navigate]);

  const houseTypes = [
    { value: 'Коттедж', label: 'Коттедж', description: 'Отдельный дом с участком' },
    { value: 'Вилла', label: 'Вилла', description: 'Комфортабельный загородный дом' },
    { value: 'Особняк', label: 'Особняк', description: 'Просторный дом высшего класса' },
    { value: 'Таунхаус', label: 'Таунхаус', description: 'Дом на несколько семей' },
    { value: 'Усадьба', label: 'Усадьба', description: 'Большой дом с обширной территорией' },
    { value: 'Резиденция', label: 'Резиденция', description: 'Элитный дом премиум-класса' }
  ];

  const belarusianRegions = [
    'Минская область', 'Гомельская область', 'Гродненская область',
    'Могилёвская область', 'Брестская область', 'Витебская область'
  ];

  const citiesByRegion: Record<string, string[]> = {
    'Минская область': ['Минск', 'Борисов', 'Солигорск', 'Молодечно', 'Жодино', 'Слуцк', 'Вилейка', 'Дзержинск', 'Марьина Горка', 'Столбцы', 'Несвиж', 'Клецк', 'Любань', 'Старые Дороги', 'Узда', 'Червень', 'Березино', 'Крупки', 'Смолевичи', 'Логойск', 'Воложин', 'Мядель'],
    'Гомельская область': ['Гомель', 'Мозырь', 'Жлобин', 'Светлогорск', 'Речица', 'Калинковичи', 'Рогачёв', 'Добруш', 'Петриков', 'Ельск', 'Наровля', 'Хойники', 'Брагин', 'Лельчицы', 'Октябрьский', 'Ветка', 'Чечерск', 'Буда-Кошелёво', 'Корма'],
    'Гродненская область': ['Гродно', 'Лида', 'Слоним', 'Волковыск', 'Сморгонь', 'Новогрудок', 'Ошмяны', 'Щучин', 'Мосты', 'Берёзовка', 'Ивье', 'Дятлово', 'Зельва', 'Свислочь', 'Островец'],
    'Могилёвская область': ['Могилёв', 'Бобруйск', 'Горки', 'Осиповичи', 'Кричев', 'Быхов', 'Климовичи', 'Шклов', 'Чаусы', 'Костюковичи', 'Мстиславль', 'Чериков', 'Славгород', 'Кировск', 'Краснополье', 'Дрибин'],
    'Брестская область': ['Брест', 'Барановичи', 'Пинск', 'Кобрин', 'Берёза', 'Лунинец', 'Ивацевичи', 'Пружаны', 'Дрогичин', 'Ганцевичи', 'Жабинка', 'Столин', 'Каменец', 'Малорита', 'Антополь', 'Микашевичи', 'Высокое'],
    'Витебская область': ['Витебск', 'Орша', 'Новополоцк', 'Полоцк', 'Глубокое', 'Лепель', 'Поставы', 'Миоры', 'Верхнедвинск', 'Браслав', 'Докшицы', 'Дубровно', 'Сенно', 'Толочин', 'Шарковщина', 'Ушачи', 'Россоны', 'Бешенковичи', 'Лиозно']
  };

  const getAllCities = () => Object.values(citiesByRegion).flat();

  const roomsOptions = [
    { value: '1', label: '1 комната' }, { value: '2', label: '2 комнаты' },
    { value: '3', label: '3 комнаты' }, { value: '4', label: '4 комнаты' },
    { value: '5', label: '5 комнат' }, { value: '6', label: '6+ комнат' }
  ];

  const bathroomsOptions = [
    { value: '1', label: '1 санузел' }, { value: '2', label: '2 санузла' },
    { value: '3', label: '3 санузла' }, { value: '4', label: '4+ санузла' }
  ];

  const availableCities = useMemo(() => {
    if (!formData.region) return getAllCities();
    return citiesByRegion[formData.region] || getAllCities();
  }, [formData.region]);

  useEffect(() => {
    if (formData.region && formData.city) {
      const allowed = citiesByRegion[formData.region];
      if (allowed && !allowed.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    }
  }, [formData.region]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (newPhotos.length === 0) {
      showNotification('Выберите изображения (JPG, PNG) до 10 МБ', 'warning');
      return;
    }
    const maxPhotos = 20;
    if (formData.photos.length + newPhotos.length > maxPhotos) {
      showNotification(`Максимум ${maxPhotos} фотографий`, 'warning');
      return;
    }
    const newPhotoUrls = newPhotos.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
      photoUrls: [...prev.photoUrls, ...newPhotoUrls]
    }));
    showNotification(`Добавлено ${newPhotos.length} фотографий`, 'success');
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(formData.photoUrls[index]);
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
    showNotification('Фотография удалена', 'success');
  };

  const handleSetMainPhoto = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...formData.photos];
    const newUrls = [...formData.photoUrls];
    const [photo] = newPhotos.splice(index, 1);
    const [url] = newUrls.splice(index, 1);
    newPhotos.unshift(photo);
    newUrls.unshift(url);
    setFormData(prev => ({ ...prev, photos: newPhotos, photoUrls: newUrls }));
    showNotification('Главная фотография изменена', 'success');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const input = document.getElementById('photoUpload') as HTMLInputElement;
      const dataTransfer = new DataTransfer();
      Array.from(e.dataTransfer.files).forEach(f => dataTransfer.items.add(f));
      input.files = dataTransfer.files;
      handlePhotoUpload({ target: input } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const validateForm = (step: number): boolean => {
    if (step === 1) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        showNotification('Введите корректную цену', 'error');
        return false;
      }
      if (!formData.area || parseFloat(formData.area) <= 0) {
        showNotification('Введите корректную площадь', 'error');
        return false;
      }
      if (!formData.houseType) {
        showNotification('Выберите тип дома', 'error');
        return false;
      }
      if (!formData.rentType) {
        showNotification('Выберите тип аренды', 'error');
        return false;
      }
      const floor = parseInt(formData.floor);
      if (floor < 0 || floor > 10) {
        showNotification('Этаж должен быть от 0 до 10', 'error');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.region.trim()) { showNotification('Введите область', 'error'); return false; }
      if (!formData.city.trim()) { showNotification('Введите город', 'error'); return false; }
      if (!formData.street.trim()) { showNotification('Введите адрес', 'error'); return false; }
      if (!formData.description.trim() || formData.description.length < 50) {
        showNotification('Описание должно содержать минимум 50 символов', 'error');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (formData.photos.length === 0) {
        showNotification('Добавьте хотя бы одну фотографию', 'error');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateForm(formStep)) {
      setFormStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handlePrevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'rent_app');
    fd.append('cloud_name', 'dnblbt7wc');
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dnblbt7wc/image/upload', { method: 'POST', body: fd });
      const data = await res.json();
      return data.secure_url || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formStep)) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Требуется авторизация', 'error');
        navigate('/login');
        return;
      }
      const uploadedUrls: string[] = [];
      for (const photo of formData.photos) {
        const url = await uploadToCloudinary(photo);
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length === 0 && formData.photos.length > 0) {
        showNotification('Не удалось загрузить фотографии', 'error');
        setIsSubmitting(false);
        return;
      }
      const houseData = {
        Price: parseFloat(formData.price),
        Area: parseFloat(formData.area),
        Description: formData.description,
        HouseType: formData.houseType,
        RentType: formData.rentType,
        Region: formData.region,
        City: formData.city,
        Street: formData.street,
        Rooms: parseInt(formData.rooms),
        Bathrooms: parseInt(formData.bathrooms),
        Floor: parseInt(formData.floor),
        Conditioner: formData.conditioner,
        Furniture: formData.furniture,
        Internet: formData.internet,
        Security: formData.security,
        VideoSurveillance: formData.videoSurveillance,
        FireAlarm: formData.fireAlarm,
        Parking: formData.parking,
        Garage: formData.garage,
        Garden: formData.garden,
        SwimmingPool: formData.swimmingPool,
        Sauna: formData.sauna,
        Transport: formData.transport || '',
        Education: formData.education || '',
        Shops: formData.shops || '',
        PhotoUrls: uploadedUrls
      };
      const response = await fetch('http://localhost:5213/api/houses/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(houseData)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        localStorage.removeItem('propertyDraft');
        showNotification('Объявление успешно создано', 'success');
        setTimeout(() => navigate('/my-houses'), 2000);
      } else {
        showNotification(result.message || 'Ошибка при создании', 'error');
      }
    } catch  {
      showNotification('Ошибка соединения', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const photosCount = formData.photos.length;
  const maxPhotos = 20;

  return (
    <div className="createad-page">
      {notification && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}
      <Header />
      <div className="createad-hero-section">
        <div className="createad-container">
          <div className="createad-hero-content">
            <h1>Создать объявление о доме</h1>
            <p>Разместите объявление о вашем доме в аренду на PrimeHouse</p>
            <div className="createad-progress-steps">
              <div className={`createad-step ${formStep === 1 ? 'createad-active' : ''} ${formStep > 1 ? 'createad-completed' : ''}`}>
                <div className="createad-step-number">1</div>
                <div className="createad-step-info"><span className="createad-step-title">Основная информация</span><span className="createad-step-description">Тип, цена, площадь</span></div>
              </div>
              <div className={`createad-step ${formStep === 2 ? 'createad-active' : ''} ${formStep > 2 ? 'createad-completed' : ''}`}>
                <div className="createad-step-number">2</div>
                <div className="createad-step-info"><span className="createad-step-title">Описание и фото</span><span className="createad-step-description">Местоположение, удобства</span></div>
              </div>
              <div className={`createad-step ${formStep === 3 ? 'createad-active' : ''}`}>
                <div className="createad-step-number">3</div>
                <div className="createad-step-info"><span className="createad-step-title">Контакты</span><span className="createad-step-description">Контактная информация</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="createad-main-content">
        <div className="createad-container">
          <div className="createad-form-wrapper">
            <div className="createad-form-header">
              <h2>{formStep === 1 && 'Основная информация'}{formStep === 2 && 'Описание и фотографии'}{formStep === 3 && 'Завершение'}</h2>
              <div className="createad-form-progress">
                <span>Шаг {formStep} из 3</span>
                <div className="createad-progress-bar"><div className="createad-progress-fill" style={{ width: `${(formStep / 3) * 100}%` }}></div></div>
              </div>
            </div>
            <form className="createad-property-form" onSubmit={handleSubmit}>
              {formStep === 1 && (
                <div className="createad-form-step">
                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-home"></i> Тип дома</h3>
                    <p className="createad-section-description">Выберите тип вашего дома</p>
                    <div className="createad-house-type-grid">
                      {houseTypes.map(type => (
                        <label key={type.value} className={`createad-house-type-card ${formData.houseType === type.value ? 'createad-selected' : ''}`}>
                          <input type="radio" name="houseType" value={type.value} checked={formData.houseType === type.value} onChange={handleInputChange} className="createad-visually-hidden" />
                          <div className="createad-card-content">
                            <div className="createad-card-icon"></div>
                            <h4>{type.label}</h4>
                            <p>{type.description}</p>
                            <div className="createad-checkmark"><i className="fas fa-check"></i></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-calendar-alt"></i> Тип аренды</h3>
                    <p className="createad-section-description">Укажите, как вы сдаёте дом</p>
                    <div className="createad-rent-type-group">
                    <label className={`createad-rent-option ${formData.rentType === 'month' ? 'active' : ''}`}>
                      <input type="radio" name="rentType" value="month" checked={formData.rentType === 'month'} onChange={handleInputChange} />
                      <i className="fas fa-calendar-alt createad-rent-icon"></i>
                      <div className="createad-rent-text">
                        <strong>Помесячно</strong>
                        <small>Долгосрочная аренда</small>
                      </div>
                    </label>
                    <label className={`createad-rent-option ${formData.rentType === 'day' ? 'active' : ''}`}>
                      <input type="radio" name="rentType" value="day" checked={formData.rentType === 'day'} onChange={handleInputChange} />
                      <i className="fas fa-sun createad-rent-icon"></i>
                      <div className="createad-rent-text">
                        <strong>Посутчно</strong>
                        <small>Аренда на короткий срок</small>
                      </div>
                    </label>
                  </div>
                  </div>

                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-info-circle"></i> Основная информация</h3>
                    <div className="createad-form-grid">
                      <div className="createad-form-group">
                        <label className="createad-form-label">
                          <span>Цена аренды {formData.rentType === 'month' ? 'в месяц' : 'за сутки'}</span>
                          <span className="createad-required">*</span>
                        </label>
                        <div className="createad-input-with-suffix">
                          <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="100" placeholder="50000" className="createad-form-input" />
                          <span className="createad-suffix">
                            <i className="nbrb-icon">&#xe901;</i>
                            {formData.rentType === 'month' ? '/мес' : '/сут'}
                          </span>
                        </div>
                      </div>
                      <div className="createad-form-group">
                        <label className="createad-form-label"><span>Общая площадь</span><span className="createad-required">*</span></label>
                        <div className="createad-input-with-suffix">
                          <input type="number" name="area" value={formData.area} onChange={handleInputChange} required min="0" step="0.1" placeholder="120.5" className="createad-form-input" />
                          <span className="createad-suffix">м²</span>
                        </div>
                      </div>
                      <div className="createad-form-group">
                        <label className="createad-form-label"><span>Количество комнат</span><span className="createad-required">*</span></label>
                        <div className="createad-select-wrapper">
                          <select name="rooms" value={formData.rooms} onChange={handleInputChange} required className="createad-form-select">
                            {roomsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <i className="createad-select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>
                      <div className="createad-form-group">
                        <label className="createad-form-label"><span>Количество санузлов</span><span className="createad-required">*</span></label>
                        <div className="createad-select-wrapper">
                          <select name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} required className="createad-form-select">
                            {bathroomsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <i className="createad-select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>
                      <div className="createad-form-group">
                        <label className="createad-form-label"><span>Этаж</span><span className="createad-required">*</span></label>
                        <input type="number" name="floor" value={formData.floor} onChange={handleInputChange} required min="0" max="10" placeholder="1" className="createad-form-input" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="createad-form-step">
                  {/* Местоположение */}
                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-map-marker-alt"></i> Местоположение</h3>
                    <div className="createad-form-grid">
                      <div className="createad-form-group">
                        <label className="createad-form-label"><span>Область</span><span className="createad-required">*</span></label>
                        <div className="createad-select-wrapper">
                          <select name="region" value={formData.region} onChange={handleInputChange} required className="createad-form-select">
                            {belarusianRegions.map(region => <option key={region} value={region}>{region}</option>)}
                          </select>
                          <i className="createad-select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>
                      <div className="createad-form-group">
                        <label className="createad-form-label"><span>Город</span><span className="createad-required">*</span></label>
                        <div className="createad-select-wrapper">
                          <select name="city" value={formData.city} onChange={handleInputChange} required className="createad-form-select">
                            <option value="">Выберите город</option>
                            {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                          </select>
                          <i className="createad-select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>
                      <div className="createad-form-group createad-full-width">
                        <label className="createad-form-label"><span>Адрес дома</span><span className="createad-required">*</span></label>
                        <input type="text" name="street" value={formData.street} onChange={handleInputChange} required placeholder="ул. Ленина, д. 15" className="createad-form-input" />
                      </div>
                    </div>
                  </div>

                  {/* Описание */}
                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-pencil-alt"></i> Описание дома</h3>
                    <p className="createad-section-description">Расскажите подробнее о вашем доме</p>
                    <div className="createad-form-group createad-full-width">
                      <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={6} minLength={50} maxLength={2000} placeholder="Опишите ваш дом..." className="createad-form-textarea" />
                      <div className="createad-char-counter">
                        <span className={formData.description.length < 50 ? 'createad-warning' : ''}>{formData.description.length}</span> / 2000 символов
                        {formData.description.length < 50 && <span className="createad-char-warning"> (минимум 50 символов)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Удобства */}
                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-star"></i> Удобства и особенности</h3>
                    <p className="createad-section-description">Выберите доступные удобства</p>
                    <div className="createad-features-grid">
                      <div className="createad-features-column">
                        <h4>Комфорт</h4>
                        <div className="createad-checkbox-group">
                          <label className="createad-checkbox"><input type="checkbox" name="conditioner" checked={formData.conditioner} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Кондиционер</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="furniture" checked={formData.furniture} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Мебель</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="internet" checked={formData.internet} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Интернет</span></label>
                        </div>
                      </div>
                      <div className="createad-features-column">
                        <h4>Безопасность</h4>
                        <div className="createad-checkbox-group">
                          <label className="createad-checkbox"><input type="checkbox" name="security" checked={formData.security} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Охрана</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="videoSurveillance" checked={formData.videoSurveillance} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Видеонаблюдение</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="fireAlarm" checked={formData.fireAlarm} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Пожарная сигнализация</span></label>
                        </div>
                      </div>
                      <div className="createad-features-column">
                        <h4>Инфраструктура</h4>
                        <div className="createad-checkbox-group">
                          <label className="createad-checkbox"><input type="checkbox" name="parking" checked={formData.parking} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Парковка</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="garage" checked={formData.garage} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Гараж</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="garden" checked={formData.garden} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Сад</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="swimmingPool" checked={formData.swimmingPool} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Бассейн</span></label>
                          <label className="createad-checkbox"><input type="checkbox" name="sauna" checked={formData.sauna} onChange={handleInputChange} /><span className="createad-custom-checkbox"></span><span className="createad-checkbox-label">Баня/сауна</span></label>
                        </div>
                      </div>
                    </div>
                    <div className="createad-environment-section">
                      <h4>Окружение</h4>
                      <div className="createad-environment-grid">
                        <div className="createad-form-group"><label className="createad-form-label">Транспорт поблизости</label><textarea name="transport" value={formData.transport} onChange={handleInputChange} rows={3} placeholder="Например: автобусная остановка в 100м" className="createad-form-textarea" /></div>
                        <div className="createad-form-group"><label className="createad-form-label">Образовательные учреждения</label><textarea name="education" value={formData.education} onChange={handleInputChange} rows={3} placeholder="Например: школа №15 в 500м" className="createad-form-textarea" /></div>
                        <div className="createad-form-group"><label className="createad-form-label">Магазины и ТЦ</label><textarea name="shops" value={formData.shops} onChange={handleInputChange} rows={3} placeholder="Например: супермаркет 'Евроопт' в 200м" className="createad-form-textarea" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Фотографии */}
                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-camera"></i> Фотографии дома</h3>
                    <p className="createad-section-description">Загрузите фотографии вашего дома</p>
                    <div className={`createad-upload-area ${dragActive ? 'createad-drag-active' : ''} ${photosCount > 0 ? 'createad-has-photos' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                      <div className="createad-upload-content">
                        <i className="createad-upload-icon fas fa-cloud-upload-alt"></i>
                        <h4>Перетащите фото сюда</h4>
                        <p>или</p>
                        <label htmlFor="photoUpload" className="createad-upload-btn"><i className="fas fa-folder-open"></i> Выбрать файлы</label>
                        <input type="file" id="photoUpload" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      </div>
                      {photosCount > 0 && (
                        <div className="createad-upload-stats">
                          <div className="createad-stats-info"><span className="createad-count">{photosCount}</span><span>/{maxPhotos} фото</span></div>
                          <div className="createad-stats-bar"><div className="createad-stats-fill" style={{ width: `${(photosCount / maxPhotos) * 100}%` }}></div></div>
                        </div>
                      )}
                    </div>
                    <div className="createad-upload-hint">
                      <p><strong>Рекомендации:</strong></p>
                      <ul><li>Добавьте 5-20 качественных фотографий</li><li>Первая фотография будет главной в объявлении</li><li>Формат: JPG, PNG, до 10 МБ каждая</li></ul>
                    </div>
                    {photosCount > 0 && (
                      <div className="createad-photos-preview">
                        <h4>Загруженные фотографии</h4>
                        <div className="createad-preview-grid">
                          {formData.photoUrls.map((url, index) => (
                            <div key={index} className="createad-photo-preview">
                              <img src={url} alt={`Фото ${index + 1}`} />
                              {index === 0 && <div className="createad-photo-badge"><i className="fas fa-crown"></i> Главное</div>}
                              <div className="createad-photo-actions">
                                {index !== 0 && <button type="button" className="createad-photo-action" onClick={() => handleSetMainPhoto(index)} title="Сделать главным"><i className="fas fa-star"></i></button>}
                                <button type="button" className="createad-photo-action createad-delete" onClick={() => handleRemovePhoto(index)} title="Удалить"><i className="fas fa-trash"></i></button>
                              </div>
                            </div>
                          ))}
                          {photosCount < maxPhotos && (
                            <label className="createad-photo-preview createad-add-more" htmlFor="photoUpload">
                              <div className="createad-add-content"><i className="fas fa-plus"></i><span>Добавить фото</span></div>
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="createad-form-step">
                  <div className="createad-form-section">
                    <h3 className="createad-section-title"><i className="createad-icon fas fa-camera"></i> Завершение создания объявления</h3>
                    <p className="createad-section-description">Проверьте фотографии и нажмите "Опубликовать"</p>
                    <div className="createad-final-check">
                      <div className="createad-check-item"><i className="fas fa-check-circle"></i><span>Основная информация заполнена</span></div>
                      <div className="createad-check-item"><i className="fas fa-check-circle"></i><span>Описание и удобства добавлены</span></div>
                      <div className="createad-check-item"><i className={`fas ${photosCount > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i><span>Фотографии загружены ({photosCount}/{maxPhotos})</span></div>
                    </div>
                    {photosCount === 0 && <div className="createad-photo-reminder"><i className="fas fa-exclamation-triangle"></i><p>Добавьте хотя бы одну фотографию для публикации</p></div>}
                  </div>
                </div>
              )}

              <div className="createad-form-navigation">
                <div className="createad-navigation-left"></div>
                <div className="createad-navigation-right">
                  {formStep > 1 && <button type="button" onClick={handlePrevStep} className="createad-btn createad-btn-outline"><i className="fas fa-arrow-left"></i> Назад</button>}
                  {formStep < 3 ? (
                    <button type="button" onClick={handleNextStep} className="createad-btn createad-btn-primary">Продолжить <i className="fas fa-arrow-right"></i></button>
                  ) : (
                    <button type="submit" className="createad-btn createad-btn-primary createad-btn-publish" disabled={isSubmitting || photosCount === 0}>
                      {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Публикация...</> : <><i className="fas fa-eye"></i> Опубликовать объявление</>}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="createad-benefits-section">
        <div className="createad-container">
          <h2>Почему стоит размещать объявления у нас?</h2>
          <div className="createad-benefits-grid">
            <div className="createad-benefit-card"><div className="createad-benefit-icon"><i className="fas fa-users"></i></div><h4>Широкая аудитория</h4><p>Тысячи потенциальных арендаторов ежедневно</p></div>
            <div className="createad-benefit-card"><div className="createad-benefit-icon"><i className="fas fa-rocket"></i></div><h4>Быстрое размещение</h4><p>Ваше объявление увидят сразу</p></div>
            <div className="createad-benefit-card"><div className="createad-benefit-icon"><i className="fas fa-headset"></i></div><h4>Поддержка 24/7</h4><p>Помощь на всех этапах</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;