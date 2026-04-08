import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './CreateAd.css';

// Компонент уведомлений
const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }> = ({ 
  message, 
  type, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle'
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <i className={`notification-icon ${icons[type]}`}></i>
        <span className="notification-text">{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

const CreateAd: React.FC = () => {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Основные данные формы
  const [formData, setFormData] = useState({
    // Основная информация
    price: '',
    area: '',
    rooms: '1',
    bathrooms: '1',
    floor: '1',
    houseType: 'Коттедж',
    
    // Местоположение
    region: 'Минская область',
    city: 'Минск',
    district: '',
    street: '',
    
    // Описание
    description: '',
    
    // Удобства
    conditioner: false,
    furniture: false,
    appliances: false,
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
    
    // Окружение
    transport: '',
    education: '',
    shops: '',
    
    // Контактная информация
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    hidePhone: false,
    
    // Фотографии
    photos: [] as File[],
    photoUrls: [] as string[],
  });

  // Показать уведомление
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
  };

  // Закрыть уведомление
  const closeNotification = () => {
    setNotification(null);
  };

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Загружаем данные пользователя
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.fio || user.username || '',
        contactEmail: user.email || '',
        contactPhone: user.phone_num || '',
      }));
    }
    
    // Загружаем черновик если есть
    const draft = localStorage.getItem('propertyDraft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setFormData(parsedDraft.formData);
      setFormStep(parsedDraft.formStep);
    }
  }, [navigate]);

  // Список городов Беларуси
  const belarusianCities = [
    'Минск', 'Гомель', 'Гродно', 'Могилёв', 'Брест', 'Витебск',
    'Бобруйск', 'Барановичи', 'Борисов', 'Пинск', 'Орша', 'Мозырь',
    'Солигорск', 'Новополоцк', 'Лида', 'Молодечно', 'Полоцк', 'Жлобин'
  ];

  // Типы домов
  const houseTypes = [
    { value: 'Коттедж', label: 'Коттедж', description: 'Отдельный дом с участком' },
    { value: 'Вилла', label: 'Вилла', description: 'Комфортабельный загородный дом' },
    { value: 'Особняк', label: 'Особняк', description: 'Просторный дом высшего класса' },
    { value: 'Таунхаус', label: 'Таунхаус',  description: 'Дом на несколько семей' },
    { value: 'Усадьба', label: 'Усадьба',  description: 'Большой дом с обширной территорией' },
    { value: 'Резиденция', label: 'Резиденция', description: 'Элитный дом премиум-класса' }
  ];

  // Области Беларуси
  const belarusianRegions = [
    'Минская область',
    'Гомельская область',
    'Гродненская область',
    'Могилёвская область',
    'Брестская область',
    'Витебская область'
  ];

  // Количество комнат
  const roomsOptions = [
    { value: '1', label: '1 комната' },
    { value: '2', label: '2 комнаты' },
    { value: '3', label: '3 комнаты' },
    { value: '4', label: '4 комнаты' },
    { value: '5', label: '5 комнат' },
    { value: '6', label: '6+ комнат' }
  ];

  // Количество санузлов
  const bathroomsOptions = [
    { value: '1', label: '1 санузел' },
    { value: '2', label: '2 санузла' },
    { value: '3', label: '3 санузла' },
    { value: '4', label: '4+ санузла' }
  ];

  // Обработчики изменения формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Обработчик загрузки фотографий
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    
    if (newPhotos.length === 0) {
      showNotification('Пожалуйста, выберите изображения (JPG, PNG) размером до 10 МБ', 'warning');
      return;
    }

    // Ограничение до 10 фотографий
    const maxPhotos = 10;
    if (formData.photos.length + newPhotos.length > maxPhotos) {
      showNotification('Максимум 10 фотографий', 'warning');
      return;
    }

    // Создаем URL для предпросмотра
    const newPhotoUrls = newPhotos.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
      photoUrls: [...prev.photoUrls, ...newPhotoUrls]
    }));

    showNotification(`Добавлено ${newPhotos.length} фотографий`, 'success');
  };

  // Удаление фотографии
  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(formData.photoUrls[index]);
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
    showNotification('Фотография удалена', 'success');
  };

  // Установка главной фотографии
  const handleSetMainPhoto = (index: number) => {
    if (index === 0) return;
    
    const newPhotos = [...formData.photos];
    const newPhotoUrls = [...formData.photoUrls];
    
    const [selectedPhoto] = newPhotos.splice(index, 1);
    const [selectedPhotoUrl] = newPhotoUrls.splice(index, 1);
    
    newPhotos.unshift(selectedPhoto);
    newPhotoUrls.unshift(selectedPhotoUrl);
    
    setFormData(prev => ({
      ...prev,
      photos: newPhotos,
      photoUrls: newPhotoUrls
    }));

    showNotification('Главная фотография изменена', 'success');
  };

  // Перетаскивание фотографий
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileList = e.dataTransfer.files;
      const input = document.getElementById('photoUpload') as HTMLInputElement;
      
      // Создаем DataTransfer для имитации input.files
      const dataTransfer = new DataTransfer();
      Array.from(fileList).forEach(file => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      
      // Создаем искусственное событие с правильным типом
      const changeEvent = {
        target: input
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handlePhotoUpload(changeEvent);
    }
  };

  // Валидация формы
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
      // Валидация этажей
      const floor = parseInt(formData.floor);
      if (floor < 0 || floor > 10) {
        showNotification('Этаж должен быть от 0 до 10', 'error');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.region.trim()) {
        showNotification('Введите область', 'error');
        return false;
      }
      if (!formData.city.trim()) {
        showNotification('Введите город', 'error');
        return false;
      }
      if (!formData.street.trim()) {
        showNotification('Введите адрес', 'error');
        return false;
      }
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

  // Переход к следующему шагу
  const handleNextStep = () => {
    if (validateForm(formStep)) {
      setFormStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Переход к предыдущему шагу
  const handlePrevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Сохранение черновика
  const handleSaveDraft = () => {
    const draft = {
      formData,
      formStep,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('propertyDraft', JSON.stringify(draft));
    
    // Показываем уведомление
    showNotification('Черновик сохранен', 'success');
  };

  // Очистка черновика
  const handleClearDraft = () => {
    if (window.confirm('Удалить черновик? Вы потеряете все несохраненные данные.')) {
      localStorage.removeItem('propertyDraft');
      window.location.reload();
    }
  };

  // Функция загрузки одного файла в Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rent_app'); // Ваш Upload Preset
    formData.append('cloud_name', 'dnblbt7wc'); // Ваш Cloud Name

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dnblbt7wc/image/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url; // Возвращаем HTTPS-URL изображения
      }
      return null;
    } catch (error) {
      console.error('Ошибка загрузки в Cloudinary:', error);
      return null;
    }
  };

  // Функция отправки формы
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

      // 1. Загрузка всех фотографий в Cloudinary
      const uploadedImageUrls: string[] = [];
      for (const photo of formData.photos) {
        const url = await uploadToCloudinary(photo);
        if (url) {
          uploadedImageUrls.push(url);
        }
      }

      if (uploadedImageUrls.length === 0 && formData.photos.length > 0) {
        showNotification('Не удалось загрузить фотографии', 'error');
        setIsSubmitting(false);
        return;
      }

      // 2. Подготовка данных для отправки на ваш бэкенд
      const houseData = {
        Price: parseFloat(formData.price),
        Area: parseFloat(formData.area),
        Description: formData.description,
        HouseType: formData.houseType,
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
        // Передаем массив URL, а не файлы
        PhotoUrls: uploadedImageUrls
      };

      // 3. Отправка данных о доме на ваш API
      const response = await fetch('http://localhost:5213/api/houses/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(houseData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.removeItem('propertyDraft');
        showNotification('Объявление успешно создано', 'success');
        setTimeout(() => {
          navigate('/my-houses');
        }, 2000);
      } else {
        showNotification(result.message || 'Ошибка при создании объявления', 'error');
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Статистика загруженных фото
  const photosCount = formData.photos.length;
  const maxPhotos = 10;

  return (
    <div className="create-ad-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      
      <Header />
      
      {/* Hero секция */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Создать объявление о доме</h1>
            <p>Разместите объявление о вашем доме в аренду на PrimeHouse</p>
            
            <div className="progress-steps">
              <div className={`step ${formStep === 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-info">
                  <span className="step-title">Основная информация</span>
                  <span className="step-description">Тип, цена, площадь</span>
                </div>
              </div>
              
              <div className={`step ${formStep === 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-info">
                  <span className="step-title">Описание и фото</span>
                  <span className="step-description">Местоположение, удобства</span>
                </div>
              </div>
              
              <div className={`step ${formStep === 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-info">
                  <span className="step-title">Контакты</span>
                  <span className="step-description">Контактная информация</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основная форма */}
      <div className="main-content">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>
                {formStep === 1 && 'Основная информация о доме'}
                {formStep === 2 && 'Описание и фотографии'}
                {formStep === 3 && 'Контактная информация'}
              </h2>
              <div className="form-progress">
                <span>Шаг {formStep} из 3</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(formStep / 3) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <form className="property-form" onSubmit={handleSubmit}>
              {/* Шаг 1: Основная информация */}
              {formStep === 1 && (
                <div className="form-step">
                  {/* Тип дома */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-home"></i>
                      Тип дома
                    </h3>
                    <p className="section-description">Выберите тип вашего дома</p>
                    
                    <div className="house-type-grid">
                      {houseTypes.map((type) => (
                        <label 
                          key={type.value}
                          className={`house-type-card ${formData.houseType === type.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="houseType"
                            value={type.value}
                            checked={formData.houseType === type.value}
                            onChange={handleInputChange}
                            className="visually-hidden"
                          />
                          <div className="card-content">
                            <div className="card-icon"></div>
                            <h4>{type.label}</h4>
                            <p>{type.description}</p>
                            <div className="checkmark">
                              <i className="fas fa-check"></i>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Основная информация */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-info-circle"></i>
                      Основная информация
                    </h3>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          <span>Цена аренды в месяц</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="100"
                            placeholder="50000"
                            className="form-input"
                          />
                          <span className="suffix">Br/мес</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>Общая площадь</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.1"
                            placeholder="120.5"
                            className="form-input"
                          />
                          <span className="suffix">м²</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>Количество комнат</span>
                          <span className="required">*</span>
                        </label>
                        <div className="select-wrapper">
                          <select
                            name="rooms"
                            value={formData.rooms}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            {roomsOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <i className="select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>Количество санузлов</span>
                          <span className="required">*</span>
                        </label>
                        <div className="select-wrapper">
                          <select
                            name="bathrooms"
                            value={formData.bathrooms}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            {bathroomsOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <i className="select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>Этаж</span>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          name="floor"
                          value={formData.floor}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max="10"
                          placeholder="1"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 2: Описание и фото */}
              {formStep === 2 && (
                <div className="form-step">
                  {/* Местоположение */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-map-marker-alt"></i>
                      Местоположение
                    </h3>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          <span>Область</span>
                          <span className="required">*</span>
                        </label>
                        <div className="select-wrapper">
                          <select
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            {belarusianRegions.map(region => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                          <i className="select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>Город</span>
                          <span className="required">*</span>
                        </label>
                        <div className="select-wrapper">
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            <option value="">Выберите город</option>
                            {belarusianCities.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          <i className="select-arrow fas fa-chevron-down"></i>
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">
                          <span>Адрес дома</span>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          required
                          placeholder="ул. Ленина, д. 15"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Описание */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-pencil-alt"></i>
                      Описание дома
                    </h3>
                    <p className="section-description">Расскажите подробнее о вашем доме</p>
                    
                    <div className="form-group full-width">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        minLength={50}
                        maxLength={2000}
                        placeholder="Опишите ваш дом: количество этажей, планировка, год постройки, ремонт, участок, вид из окон, инфраструктура района..."
                        className="form-textarea"
                      />
                      <div className="char-counter">
                        <span className={formData.description.length < 50 ? 'warning' : ''}>
                          {formData.description.length}
                        </span>
                        / 2000 символов
                        {formData.description.length < 50 && (
                          <span className="char-warning"> (минимум 50 символов)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Удобства */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-star"></i>
                      Удобства и особенности
                    </h3>
                    <p className="section-description">Выберите доступные удобства</p>
                    
                    <div className="features-grid">
  <div className="features-column">
    <h4>Комфорт</h4>
    <div className="checkbox-group">
      <label className="checkbox">
        <input
          type="checkbox"
          name="conditioner"
          checked={formData.conditioner}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label" style={{ color: '#1e293b' }}>Кондиционер</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="furniture"
          checked={formData.furniture}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Мебель</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="internet"
          checked={formData.internet}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Интернет</span>
      </label>
    </div>
  </div>

  <div className="features-column">
    <h4>Безопасность</h4>
    <div className="checkbox-group">
      <label className="checkbox">
        <input
          type="checkbox"
          name="security"
          checked={formData.security}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Охрана</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="videoSurveillance"
          checked={formData.videoSurveillance}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Видеонаблюдение</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="fireAlarm"
          checked={formData.fireAlarm}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Пожарная сигнализация</span>
      </label>
    </div>
  </div>

  <div className="features-column">
    <h4>Инфраструктура</h4>
    <div className="checkbox-group">
      <label className="checkbox">
        <input
          type="checkbox"
          name="parking"
          checked={formData.parking}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Парковка</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="garage"
          checked={formData.garage}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Гараж</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="garden"
          checked={formData.garden}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Сад</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="swimmingPool"
          checked={formData.swimmingPool}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Бассейн</span>
      </label>
      
      <label className="checkbox">
        <input
          type="checkbox"
          name="sauna"
          checked={formData.sauna}
          onChange={handleInputChange}
        />
        <span className="custom-checkbox"></span>
        <span className="checkbox-label">Баня/сауна</span>
      </label>
    </div>
  </div>
</div>

                    {/* Окружение */}
                    <div className="environment-section">
                      <h4>Окружение</h4>
                      <div className="environment-grid">
                        <div className="form-group">
                          <label className="form-label">Транспорт поблизости</label>
                          <textarea
                            name="transport"
                            value={formData.transport}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Например: автобусная остановка в 100м, метро в 10 минутах"
                            className="form-textarea"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Образовательные учреждения</label>
                          <textarea
                            name="education"
                            value={formData.education}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Например: школа №15 в 500м, детский сад через дорогу"
                            className="form-textarea"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Магазины и ТЦ</label>
                          <textarea
                            name="shops"
                            value={formData.shops}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Например: супермаркет 'Евроопт' в 200м, ТЦ 'Галерея' в 15 минутах"
                            className="form-textarea"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Фотографии */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-camera"></i>
                      Фотографии дома
                    </h3>
                    <p className="section-description">Загрузите фотографии вашего дома</p>
                    
                    <div 
                      className={`upload-area ${dragActive ? 'drag-active' : ''} ${photosCount > 0 ? 'has-photos' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="upload-content">
                        <i className="upload-icon fas fa-cloud-upload-alt"></i>
                        <h4>Перетащите фото сюда</h4>
                        <p>или</p>
                        <label htmlFor="photoUpload" className="upload-btn">
                          <i className="fas fa-folder-open"></i>
                          Выбрать файлы
                        </label>
                        <input
                          type="file"
                          id="photoUpload"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      
                      {photosCount > 0 && (
                        <div className="upload-stats">
                          <div className="stats-info">
                            <span className="count">{photosCount}</span>
                            <span>/{maxPhotos} фото</span>
                          </div>
                          <div className="stats-bar">
                            <div 
                              className="stats-fill" 
                              style={{ width: `${(photosCount / maxPhotos) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="upload-hint">
                      <p><strong>Рекомендации:</strong></p>
                      <ul>
                        <li>Добавьте 5-10 качественных фотографий</li>
                        <li>Первая фотография будет главной в объявлении</li>
                        <li>Формат: JPG, PNG, до 10 МБ каждая</li>
                        <li>Сделайте фотографии с разных ракурсов</li>
                      </ul>
                    </div>

                    {/* Превью фотографий */}
                    {photosCount > 0 && (
                      <div className="photos-preview">
                        <h4>Загруженные фотографии</h4>
                        <div className="preview-grid-created-ad">
                          {formData.photoUrls.map((url, index) => (
                            <div key={index} className="photo-preview-created-ad">
                              <img src={url} alt={`Фото ${index + 1}`} />
                              {index === 0 && (
                                <div className="photo-badge-created-ad main">
                                  <i className="fas fa-crown"></i>
                                  Главное
                                </div>
                              )}
                              <div className="photo-actions-created-ad">
                                {index !== 0 && (
                                  <button
                                    type="button"
                                    className="photo-action-created-ad"
                                    onClick={() => handleSetMainPhoto(index)}
                                    title="Сделать главным"
                                  >
                                    <i className="fas fa-star"></i>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="photo-action-created-ad delete"
                                  onClick={() => handleRemovePhoto(index)}
                                  title="Удалить"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {photosCount < maxPhotos && (
                            <label className="photo-preview-created-ad add-more" htmlFor="photoUpload">
                              <div className="add-content">
                                <i className="fas fa-plus"></i>
                                <span>Добавить фото</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Шаг 3: Контакты - Упрощенная версия, только фото */}
              {formStep === 3 && (
                <div className="form-step">
                  <div className="form-section">
                    <h3 className="section-title">
                      <i className="icon fas fa-camera"></i>
                      Завершение создания объявления
                    </h3>
                    <p className="section-description">Проверьте фотографии и нажмите "Опубликовать"</p>
                    
                    <div className="final-check">
                      <div className="check-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Основная информация заполнена</span>
                      </div>
                      <div className="check-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Описание и удобства добавлены</span>
                      </div>
                      <div className="check-item">
                        <i className={`fas ${photosCount > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        <span>Фотографии загружены ({photosCount}/{maxPhotos})</span>
                      </div>
                    </div>
                    
                    {photosCount === 0 && (
                      <div className="photo-reminder">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>Пожалуйста, добавьте хотя бы одну фотографию для публикации объявления.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Навигация */}
              <div className="form-navigation">
                <div className="navigation-left">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="btn btn-secondary"
                  >
                    <i className="fas fa-save"></i>
                    Сохранить черновик
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="btn btn-text"
                  >
                    <i className="fas fa-trash"></i>
                    Очистить черновик
                  </button>
                </div>
                
                <div className="navigation-right">
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-arrow-left"></i>
                      Назад
                    </button>
                  )}
                  
                  {formStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn btn-primary"
                    >
                      Продолжить
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary btn-publish"
                      disabled={isSubmitting || photosCount === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Публикация...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-eye"></i>
                          Опубликовать объявление
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Преимущества */}
      <div className="benefits-section">
        <div className="container">
          <h2>Почему стоит размещать объявления у нас?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4>Широкая аудитория</h4>
              <p>Тысячи потенциальных арендаторов ежедневно</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Безопасность сделок</h4>
              <p>Проверенные договоры аренды</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h4>Быстрое размещение</h4>
              <p>Ваше объявление увидят сразу</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h4>Поддержка 24/7</h4>
              <p>Помощь на всех этапах</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreateAd;