import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface HouseData {
  id: number;
  price: number;
  area: number;
  description: string;
  active: boolean;
  houseType: string;
  announcementData: string;
  photos: string[];
  houseInfo: {
    region: string;
    city: string;
    street: string;
    rooms: number;
    bathrooms: number;
    floor: number;
  };
  convenience: {
    conditioner: boolean;
    furniture: boolean;
    internet: boolean;
    security: boolean;
    videoSurveillance: boolean;
    fireAlarm: boolean;
    parking: boolean;
    garage: boolean;
    garden: boolean;
    swimmingPool: boolean;
    sauna: boolean;
    transport: string;
    education: string;
    shops: string;
  };
}

const EditHousePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [houseData, setHouseData] = useState<HouseData | null>(null);

  // Данные формы
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
    street: '',
    
    // Описание
    description: '',
    
    // Удобства
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
    
    // Окружение
    transport: '',
    education: '',
    shops: '',
    
    // Фотографии
    existingPhotos: [] as string[],
    newPhotos: [] as File[],
  });

  // Показать уведомление
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
  }, []);

  // Закрыть уведомление
  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Функция для форматирования даты
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toLocaleDateString('ru-RU');
          }
        }
        return 'Некорректная дата';
      }
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Некорректная дата';
    }
  }, []);

  interface ApiHouseData {
  Id?: number;
  id?: number;
  Price?: number;
  price?: number;
  Area?: number;
  area?: number;
  Description?: string;
  description?: string;
  Active?: boolean;
  active?: boolean;
  HouseType?: string;
  houseType?: string;
  AnnouncementData?: string;
  announcementData?: string;
  Photos?: string[];
  photos?: string[];
  HouseInfo?: {
    Region?: string;
    region?: string;
    City?: string;
    city?: string;
    Street?: string;
    street?: string;
    Rooms?: number;
    rooms?: number;
    Bathrooms?: number;
    bathrooms?: number;
    Floor?: number;
    floor?: number;
  };
  houseInfo?: {
    Region?: string;
    region?: string;
    City?: string;
    city?: string;
    Street?: string;
    street?: string;
    Rooms?: number;
    rooms?: number;
    Bathrooms?: number;
    bathrooms?: number;
    Floor?: number;
    floor?: number;
  };
  Convenience?: {
    Conditioner?: boolean;
    conditioner?: boolean;
    Furniture?: boolean;
    furniture?: boolean;
    Internet?: boolean;
    internet?: boolean;
    Security?: boolean;
    security?: boolean;
    VideoSurveillance?: boolean;
    videoSurveillance?: boolean;
    FireAlarm?: boolean;
    fireAlarm?: boolean;
    Parking?: boolean;
    parking?: boolean;
    Garage?: boolean;
    garage?: boolean;
    Garden?: boolean;
    garden?: boolean;
    SwimmingPool?: boolean;
    swimmingPool?: boolean;
    Sauna?: boolean;
    sauna?: boolean;
    Transport?: string;
    transport?: string;
    Education?: string;
    education?: string;
    Shops?: string;
    shops?: string;
  };
  convenience?: {
    Conditioner?: boolean;
    conditioner?: boolean;
    Furniture?: boolean;
    furniture?: boolean;
    Internet?: boolean;
    internet?: boolean;
    Security?: boolean;
    security?: boolean;
    VideoSurveillance?: boolean;
    videoSurveillance?: boolean;
    FireAlarm?: boolean;
    fireAlarm?: boolean;
    Parking?: boolean;
    parking?: boolean;
    Garage?: boolean;
    garage?: boolean;
    Garden?: boolean;
    garden?: boolean;
    SwimmingPool?: boolean;
    swimmingPool?: boolean;
    Sauna?: boolean;
    sauna?: boolean;
    Transport?: string;
    transport?: string;
    Education?: string;
    education?: string;
    Shops?: string;
    shops?: string;
  };
}

// Функция для преобразования данных из API в нужный формат
// Функция для преобразования данных из API в нужный формат
const transformApiData = useCallback((apiData: ApiHouseData): HouseData => {
  // Проверяем и преобразуем вложенные объекты
  const houseInfoData = apiData.HouseInfo || apiData.houseInfo || {};
  const convenienceData = apiData.Convenience || apiData.convenience || {};

  return {
    id: Number(apiData.Id || apiData.id || 0),
    price: Number(apiData.Price || apiData.price || 0),
    area: Number(apiData.Area || apiData.area || 0),
    description: String(apiData.Description || apiData.description || ''),
    active: Boolean(apiData.Active || apiData.active || false),
    houseType: String(apiData.HouseType || apiData.houseType || 'Коттедж'),
    announcementData: String(apiData.AnnouncementData || apiData.announcementData || ''),
    photos: Array.isArray(apiData.Photos) ? apiData.Photos : 
            Array.isArray(apiData.photos) ? apiData.photos : [],
    houseInfo: {
      region: String(houseInfoData.Region || houseInfoData.region || 'Минская область'),
      city: String(houseInfoData.City || houseInfoData.city || 'Минск'),
      street: String(houseInfoData.Street || houseInfoData.street || ''),
      rooms: Number(houseInfoData.Rooms || houseInfoData.rooms || 1),
      bathrooms: Number(houseInfoData.Bathrooms || houseInfoData.bathrooms || 1),
      floor: Number(houseInfoData.Floor || houseInfoData.floor || 1),
    },
    convenience: {
      conditioner: Boolean(convenienceData.Conditioner || convenienceData.conditioner || false),
      furniture: Boolean(convenienceData.Furniture || convenienceData.furniture || false),
      internet: Boolean(convenienceData.Internet || convenienceData.internet || false),
      security: Boolean(convenienceData.Security || convenienceData.security || false),
      videoSurveillance: Boolean(convenienceData.VideoSurveillance || convenienceData.videoSurveillance || false),
      fireAlarm: Boolean(convenienceData.FireAlarm || convenienceData.fireAlarm || false),
      parking: Boolean(convenienceData.Parking || convenienceData.parking || false),
      garage: Boolean(convenienceData.Garage || convenienceData.garage || false),
      garden: Boolean(convenienceData.Garden || convenienceData.garden || false),
      swimmingPool: Boolean(convenienceData.SwimmingPool || convenienceData.swimmingPool || false),
      sauna: Boolean(convenienceData.Sauna || convenienceData.sauna || false),
      transport: String(convenienceData.Transport || convenienceData.transport || ''),
      education: String(convenienceData.Education || convenienceData.education || ''),
      shops: String(convenienceData.Shops || convenienceData.shops || ''),
    }
  };
}, []);

  // Загрузка данных объявления
  const fetchHouseData = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5213/api/houses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Fetching house data from:', `http://localhost:5213/api/houses/${id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result); // Для отладки
      
      if (result.success && result.data) {
        // Преобразуем данные из API
        const houseData: HouseData = transformApiData(result.data);
        console.log('Transformed house data:', houseData);
        setHouseData(houseData);
        
        // Заполняем форму данными из API
        setFormData({
          price: houseData.price.toString(),
          area: houseData.area.toString(),
          rooms: houseData.houseInfo.rooms.toString(),
          bathrooms: houseData.houseInfo.bathrooms.toString(),
          floor: houseData.houseInfo.floor.toString(),
          houseType: houseData.houseType,
          region: houseData.houseInfo.region,
          city: houseData.houseInfo.city,
          street: houseData.houseInfo.street,
          description: houseData.description,
          conditioner: houseData.convenience.conditioner,
          furniture: houseData.convenience.furniture,
          internet: houseData.convenience.internet,
          security: houseData.convenience.security,
          videoSurveillance: houseData.convenience.videoSurveillance,
          fireAlarm: houseData.convenience.fireAlarm,
          parking: houseData.convenience.parking,
          garage: houseData.convenience.garage,
          garden: houseData.convenience.garden,
          swimmingPool: houseData.convenience.swimmingPool,
          sauna: houseData.convenience.sauna,
          transport: houseData.convenience.transport,
          education: houseData.convenience.education,
          shops: houseData.convenience.shops,
          existingPhotos: houseData.photos || [],
          newPhotos: [],
        });
        
        console.log('Form data set:', {
          price: houseData.price.toString(),
          area: houseData.area.toString(),
          rooms: houseData.houseInfo.rooms.toString(),
          bathrooms: houseData.houseInfo.bathrooms.toString(),
          floor: houseData.houseInfo.floor.toString(),
          houseType: houseData.houseType,
          region: houseData.houseInfo.region,
          city: houseData.houseInfo.city,
          street: houseData.houseInfo.street,
          description: houseData.description,
        });
      } else {
        showNotification(result.message || 'Ошибка загрузки данных объявления', 'error');
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (error: unknown) {
      console.error('Error fetching house data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showNotification(`Ошибка соединения с сервером: ${errorMessage}. Проверьте: 1) Запущен ли сервер 2) Правильный ли порт (5213)`, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showNotification, transformApiData]);

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (id) {
      fetchHouseData(token);
    }
  }, [id, navigate, fetchHouseData]);

  // Списки для выбора
  const belarusianCities = [
    'Минск', 'Гомель', 'Гродно', 'Могилёв', 'Брест', 'Витебск',
    'Бобруйск', 'Барановичи', 'Борисов', 'Пинск', 'Орша', 'Мозырь',
    'Солигорск', 'Новополоцк', 'Лида', 'Молодечно', 'Полоцк', 'Жлобин'
  ];

  const houseTypes = [
    { value: 'Коттедж', label: 'Коттедж',  description: 'Отдельный дом с участком' },
    { value: 'Вилла', label: 'Вилла', description: 'Комфортабельный загородный дом' },
    { value: 'Особняк', label: 'Особняк', description: 'Просторный дом высшего класса' },
    { value: 'Таунхаус', label: 'Таунхаус', description: 'Дом на несколько семей' },
    { value: 'Усадьба', label: 'Усадьба', description: 'Большой дом с обширной территорией' },
    { value: 'Резиденция', label: 'Резиденция', description: 'Элитный дом премиум-класса' }
  ];

  const belarusianRegions = [
    'Минская область',
    'Гомельская область',
    'Гродненская область',
    'Могилёвская область',
    'Брестская область',
    'Витебская область'
  ];

  const roomsOptions = [
    { value: '1', label: '1 комната' },
    { value: '2', label: '2 комнаты' },
    { value: '3', label: '3 комнаты' },
    { value: '4', label: '4 комнаты' },
    { value: '5', label: '5 комнат' },
    { value: '6', label: '6+ комнат' }
  ];

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

  // Обработчик загрузки новых фотографий
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotosArray = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    
    if (newPhotosArray.length === 0) {
      showNotification('Пожалуйста, выберите изображения (JPG, PNG) размером до 10 МБ', 'warning');
      return;
    }

    // Ограничение до 10 фотографий всего
    const totalPhotos = formData.existingPhotos.length + formData.newPhotos.length + newPhotosArray.length;
    if (totalPhotos > 10) {
      showNotification('Максимум 10 фотографий всего', 'warning');
      return;
    }

    setFormData(prev => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...newPhotosArray]
    }));

    showNotification(`Добавлено ${newPhotosArray.length} фотографий`, 'success');
  };

  // Удаление существующей фотографии
  const handleRemoveExistingPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((_, i) => i !== index)
    }));
    
    showNotification('Фотография помечена для удаления', 'success');
  };

  // Удаление новой фотографии
  const handleRemoveNewPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      newPhotos: prev.newPhotos.filter((_, i) => i !== index)
    }));
    showNotification('Фотография удалена', 'success');
  };

  // Установка главной фотографии
  const handleSetMainPhoto = (index: number) => {
    if (index === 0) return;
    
    const newPhotos = [...formData.existingPhotos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    
    setFormData(prev => ({
      ...prev,
      existingPhotos: newPhotos
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
      
      const dataTransfer = new DataTransfer();
      Array.from(fileList).forEach(file => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      
      const changeEvent: React.ChangeEvent<HTMLInputElement> = {
        target: input
      } as React.ChangeEvent<HTMLInputElement>;
      
      handlePhotoUpload(changeEvent);
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
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
    if (formData.existingPhotos.length + formData.newPhotos.length === 0) {
      showNotification('Добавьте хотя бы одну фотографию', 'error');
      return false;
    }
    
    return true;
  };

  // Сохранение изменений
  // Сохранение изменений
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showNotification('Требуется авторизация', 'error');
      navigate('/login');
      return;
    }

    console.log('=== НАЧАЛО ОБНОВЛЕНИЯ ===');
    console.log('House ID:', id);
    console.log('Токен получен:', token.substring(0, 20) + '...');

    // 1. Загружаем новые фото в Cloudinary
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

        const data = await response.json();
        return data.secure_url || null;
      } catch (error) {
        console.error('Ошибка загрузки в Cloudinary:', error);
        return null;
      }
    };

    const uploadedImageUrls: string[] = [];
    
    if (formData.newPhotos.length > 0) {
      console.log('Начинаем загрузку новых фото в Cloudinary...');
      for (let i = 0; i < formData.newPhotos.length; i++) {
        const photo = formData.newPhotos[i];
        console.log(`Загрузка фото ${i + 1}:`, photo.name);
        
        const url = await uploadToCloudinary(photo);
        if (url) {
          uploadedImageUrls.push(url);
          console.log(`Фото ${i + 1} загружено:`, url);
        } else {
          console.log(`Фото ${i + 1} не загрузилось`);
        }
      }
    }

    // Все фото: существующие + новые
    const allPhotoUrls = [...formData.existingPhotos, ...uploadedImageUrls];
    
    console.log('Всего URL для сохранения:', allPhotoUrls.length);
    console.log('Существующие фото:', formData.existingPhotos.length);
    console.log('Новые загруженные фото:', uploadedImageUrls.length);

    if (allPhotoUrls.length === 0) {
      showNotification('Добавьте хотя бы одну фотографию', 'error');
      setIsSubmitting(false);
      return;
    }

    // 2. Подготавливаем данные в формате JSON
    const houseData = {
      Price: parseFloat(formData.price) || 0,
      Area: parseFloat(formData.area) || 0,
      Description: formData.description || '',
      HouseType: formData.houseType || 'Коттедж',
      Region: formData.region || '',
      City: formData.city || '',
      Street: formData.street || '',
      Rooms: parseInt(formData.rooms) || 1,
      Bathrooms: parseInt(formData.bathrooms) || 1,
      Floor: parseInt(formData.floor) || 1,
      Conditioner: formData.conditioner || false,
      Furniture: formData.furniture || false,
      Internet: formData.internet || false,
      Security: formData.security || false,
      VideoSurveillance: formData.videoSurveillance || false,
      FireAlarm: formData.fireAlarm || false,
      Parking: formData.parking || false,
      Garage: formData.garage || false,
      Garden: formData.garden || false,
      SwimmingPool: formData.swimmingPool || false,
      Sauna: formData.sauna || false,
      Transport: formData.transport || '',
      Education: formData.education || '',
      Shops: formData.shops || '',
      PhotoUrls: allPhotoUrls,
      DeleteExistingPhotos: true // Удаляем старые и заменяем на все (существующие + новые)
    };
    
    console.log('Данные для отправки:', JSON.stringify(houseData, null, 2));

    // 3. Отправляем запрос в формате JSON
    console.log(`Отправляем PUT запрос на: http://localhost:5213/api/houses/${id}`);
    
    const response = await fetch(`http://localhost:5213/api/houses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', // Важно: отправляем JSON!
      },
      body: JSON.stringify(houseData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    let result;
    try {
      const text = await response.text();
      console.log('Response text:', text);
      result = text ? JSON.parse(text) : {};
    } catch (jsonError: unknown) {
      console.error('Ошибка парсинга JSON:', jsonError);
      showNotification('Ошибка сервера. Проверьте консоль сервера.', 'error');
      return;
    }

    console.log('Response result:', result);

    if (response.ok && result.success) {
      showNotification('Объявление успешно обновлено!', 'success');
      
      // Обновляем данные
      setTimeout(() => {
        if (token) {
          fetchHouseData(token);
        }
      }, 1000);
    } else {
      console.error('Ошибка от сервера:', result.message || 'Неизвестная ошибка');
      showNotification(result.message || 'Ошибка при обновлении объявления', 'error');
    }
  } catch (error: unknown) {
    console.error('Критическая ошибка:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    showNotification(`Ошибка соединения с сервером: ${errorMessage}`, 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка данных объявления...</p>
      </div>
    );
  }

  const totalPhotosCount = formData.existingPhotos.length + formData.newPhotos.length;
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
            <h1>Редактирование объявления #{id}</h1>
            <p>Обновите информацию о вашем доме на PrimeHouse</p>
            {houseData && (
              <div className="house-info-badge">
                <span>Создано: {formatDate(houseData.announcementData)}</span>
                <span className={`status ${houseData.active ? 'active' : 'inactive'}`}>
                  {houseData.active ? '✓ Активно' : '✗ Неактивно'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основная форма */}
      <div className="main-content">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Редактировать объявление о доме</h2>
              <div className="form-progress">
                <span>Все поля обязательны для заполнения</span>
              </div>
            </div>

            <form className="property-form" onSubmit={handleSubmit}>
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
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Кондиционер</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="furniture"
                          checked={formData.furniture}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Мебель</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="internet"
                          checked={formData.internet}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
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
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Охрана</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="videoSurveillance"
                          checked={formData.videoSurveillance}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Видеонаблюдение</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="fireAlarm"
                          checked={formData.fireAlarm}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
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
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Парковка</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="garage"
                          checked={formData.garage}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Гараж</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="garden"
                          checked={formData.garden}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Сад</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="swimmingPool"
                          checked={formData.swimmingPool}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Бассейн</span>
                      </label>
                      
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="sauna"
                          checked={formData.sauna}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
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
                <p className="section-description">Обновите фотографии вашего дома</p>
                
                <div 
                  className={`upload-area ${dragActive ? 'drag-active' : ''} ${totalPhotosCount > 0 ? 'has-photos' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="upload-content">
                    <i className="upload-icon fas fa-cloud-upload-alt"></i>
                    <h4>Перетащите новые фото сюда</h4>
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
                  
                  {totalPhotosCount > 0 && (
                    <div className="upload-stats">
                      <div className="stats-info">
                        <span className="count">{totalPhotosCount}</span>
                        <span>/{maxPhotos} фото</span>
                      </div>
                      <div className="stats-bar">
                        <div 
                          className="stats-fill" 
                          style={{ width: `${(totalPhotosCount / maxPhotos) * 100}%` }}
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

                {/* Превью существующих фотографий */}
                {formData.existingPhotos.length > 0 && (
                  <div className="photos-preview">
                    <h4>Текущие фотографии ({formData.existingPhotos.length})</h4>
                    <div className="preview-grid-created-ad">
                      {formData.existingPhotos.map((url, index) => (
                        <div key={`existing-${index}`} className="photo-preview-created-ad">
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
                              onClick={() => handleRemoveExistingPhoto(index)}
                              title="Удалить"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Превью новых фотографий */}
                {formData.newPhotos.length > 0 && (
                  <div className="photos-preview">
                    <h4>Новые фотографии ({formData.newPhotos.length})</h4>
                    <div className="preview-grid-created-ad">
                      {formData.newPhotos.map((file, index) => {
                        const objectUrl = URL.createObjectURL(file);
                        return (
                          <div key={`new-${index}`} className="photo-preview-created-ad">
                            <img src={objectUrl} alt={`Новое фото ${index + 1}`} />
                            <div className="photo-actions-created-ad">
                              <button
                                type="button"
                                className="photo-action-created-ad delete"
                                onClick={() => handleRemoveNewPhoto(index)}
                                title="Удалить"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {totalPhotosCount < maxPhotos && (
                        <label className="photo-preview-created-ad add-more" htmlFor="photoUpload">
                          <div className="add-content">
                            <i className="fas fa-plus"></i>
                            <span>Добавить еще фото</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Навигация */}
              <div className="form-navigation">
                <div className="navigation-left">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="btn btn-secondary"
                  >
                    <i className="fas fa-arrow-left"></i>
                    Вернуться в профиль
                  </button>
                </div>
                
                <div className="navigation-right">
                  <button
                    type="submit"
                    className="btn btn-primary btn-publish"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Сохранить изменения
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHousePage;