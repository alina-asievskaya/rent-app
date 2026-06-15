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
    <div className={`createad-notification createad-${type}`}>
      <div className="createad-notification-content">
        <i className={`createad-notification-icon ${icons[type]}`}></i>
        <span className="createad-notification-text">{message}</span>
      </div>
      <button className="createad-notification-close" onClick={onClose}>&times;</button>
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
  rentType: string;
  announcementData: string;
  photos: string[];
  houseInfo: {
    region: string;
    city: string;
    street: string;
    houseNumber: string;
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

// Тип для кейтеринговой компании
interface CateringCompany {
  id: number;
  companyName: string;
  city: string;
  description: string;
  phone: string;
}

const EditHousePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [houseData, setHouseData] = useState<HouseData | null>(null);

  // ----- Состояния для кейтеринга -----
  const [cateringCompanies, setCateringCompanies] = useState<CateringCompany[]>([]);
  const [selectedCaterings, setSelectedCaterings] = useState<number[]>([]);
  const [cateringCompaniesLoading, setCateringCompaniesLoading] = useState(false);

  const [formData, setFormData] = useState({
    price: '',
    area: '',
    rooms: '1',
    bathrooms: '1',
    floor: '1',
    houseType: 'Коттедж',
    rentType: 'month',
    region: 'Минская область',
    city: '',
    street: '',
    houseNumber: '',
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
    transport: '',
    education: '',
    shops: '',
    existingPhotos: [] as string[],
    newPhotos: [] as File[],
  });

  // Справочник городов по областям (для валидации)
  const citiesByRegion: Record<string, string[]> = {
    'Минская область': ['Минск', 'Борисов', 'Солигорск', 'Молодечно', 'Жодино', 'Слуцк', 'Вилейка', 'Дзержинск', 'Марьина Горка', 'Столбцы', 'Несвиж', 'Клецк', 'Любань', 'Старые Дороги', 'Узда', 'Червень', 'Березино', 'Крупки', 'Смолевичи', 'Логойск', 'Воложин', 'Мядель'],
    'Гомельская область': ['Гомель', 'Мозырь', 'Жлобин', 'Светлогорск', 'Речица', 'Калинковичи', 'Рогачёв', 'Добруш', 'Петриков', 'Ельск', 'Наровля', 'Хойники', 'Брагин', 'Лельчицы', 'Октябрьский', 'Ветка', 'Чечерск', 'Буда-Кошелёво', 'Корма'],
    'Гродненская область': ['Гродно', 'Лида', 'Слоним', 'Волковыск', 'Сморгонь', 'Новогрудок', 'Ошмяны', 'Щучин', 'Мосты', 'Берёзовка', 'Ивье', 'Дятлово', 'Зельва', 'Свислочь', 'Островец'],
    'Могилёвская область': ['Могилёв', 'Бобруйск', 'Горки', 'Осиповичи', 'Кричев', 'Быхов', 'Климовичи', 'Шклов', 'Чаусы', 'Костюковичи', 'Мстиславль', 'Чериков', 'Славгород', 'Кировск', 'Краснополье', 'Дрибин'],
    'Брестская область': ['Брест', 'Барановичи', 'Пинск', 'Кобрин', 'Берёза', 'Лунинец', 'Ивацевичи', 'Пружаны', 'Дрогичин', 'Ганцевичи', 'Жабинка', 'Столин', 'Каменец', 'Малорита', 'Антополь', 'Микашевичи', 'Высокое'],
    'Витебская область': ['Витебск', 'Орша', 'Новополоцк', 'Полоцк', 'Глубокое', 'Лепель', 'Поставы', 'Миоры', 'Верхнедвинск', 'Браслав', 'Докшицы', 'Дубровно', 'Сенно', 'Толочин', 'Шарковщина', 'Ушачи', 'Россоны', 'Бешенковичи', 'Лиозно']
  };

  // Обратный словарь: город -> область
  const cityToRegion: Record<string, string> = {};
  for (const [region, cities] of Object.entries(citiesByRegion)) {
    for (const city of cities) {
      cityToRegion[city] = region;
    }
  }

  const belarusianRegions = [
    'Минская область', 'Гомельская область', 'Гродненская область',
    'Могилёвская область', 'Брестская область', 'Витебская область'
  ];

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

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
    Id?: number; id?: number;
    Price?: number; price?: number;
    Area?: number; area?: number;
    Description?: string; description?: string;
    Active?: boolean; active?: boolean;
    HouseType?: string; houseType?: string;
    RentType?: string; rentType?: string;
    AnnouncementData?: string; announcementData?: string;
    Photos?: string[]; photos?: string[];
    HouseInfo?: {
      Region?: string; region?: string;
      City?: string; city?: string;
      Street?: string; street?: string;
      HouseNumber?: string; houseNumber?: string;
      Rooms?: number; rooms?: number;
      Bathrooms?: number; bathrooms?: number;
      Floor?: number; floor?: number;
    };
    houseInfo?: {
      Region?: string; region?: string;
      City?: string; city?: string;
      Street?: string; street?: string;
      HouseNumber?: string; houseNumber?: string;
      Rooms?: number; rooms?: number;
      Bathrooms?: number; bathrooms?: number;
      Floor?: number; floor?: number;
    };
    Convenience?: {
      Conditioner?: boolean; conditioner?: boolean;
      Furniture?: boolean; furniture?: boolean;
      Internet?: boolean; internet?: boolean;
      Security?: boolean; security?: boolean;
      VideoSurveillance?: boolean; videoSurveillance?: boolean;
      FireAlarm?: boolean; fireAlarm?: boolean;
      Parking?: boolean; parking?: boolean;
      Garage?: boolean; garage?: boolean;
      Garden?: boolean; garden?: boolean;
      SwimmingPool?: boolean; swimmingPool?: boolean;
      Sauna?: boolean; sauna?: boolean;
      Transport?: string; transport?: string;
      Education?: string; education?: string;
      Shops?: string; shops?: string;
    };
    convenience?: {
      Conditioner?: boolean; conditioner?: boolean;
      Furniture?: boolean; furniture?: boolean;
      Internet?: boolean; internet?: boolean;
      Security?: boolean; security?: boolean;
      VideoSurveillance?: boolean; videoSurveillance?: boolean;
      FireAlarm?: boolean; fireAlarm?: boolean;
      Parking?: boolean; parking?: boolean;
      Garage?: boolean; garage?: boolean;
      Garden?: boolean; garden?: boolean;
      SwimmingPool?: boolean; swimmingPool?: boolean;
      Sauna?: boolean; sauna?: boolean;
      Transport?: string; transport?: string;
      Education?: string; education?: string;
      Shops?: string; shops?: string;
    };
  }

  const transformApiData = useCallback((apiData: ApiHouseData): HouseData => {
    const houseInfoData = apiData.HouseInfo || apiData.houseInfo || {};
    const convenienceData = apiData.Convenience || apiData.convenience || {};

    return {
      id: Number(apiData.Id || apiData.id || 0),
      price: Number(apiData.Price || apiData.price || 0),
      area: Number(apiData.Area || apiData.area || 0),
      description: String(apiData.Description || apiData.description || ''),
      active: Boolean(apiData.Active || apiData.active || false),
      houseType: String(apiData.HouseType || apiData.houseType || 'Коттедж'),
      rentType: String(apiData.RentType || apiData.rentType || 'month'),
      announcementData: String(apiData.AnnouncementData || apiData.announcementData || ''),
      photos: Array.isArray(apiData.Photos) ? apiData.Photos : 
              Array.isArray(apiData.photos) ? apiData.photos : [],
      houseInfo: {
        region: String(houseInfoData.Region || houseInfoData.region || 'Минская область'),
        city: String(houseInfoData.City || houseInfoData.city || ''),
        street: String(houseInfoData.Street || houseInfoData.street || ''),
        houseNumber: String(houseInfoData.HouseNumber || houseInfoData.houseNumber || ''),
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

  // ----- Загрузка доступных кейтеринговых компаний -----
  const fetchAvailableCaterings = async (token: string) => {
    try {
      setCateringCompaniesLoading(true);
      const res = await fetch('http://localhost:5213/api/houses/available-caterings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCateringCompanies(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки кейтерингов:', error);
    } finally {
      setCateringCompaniesLoading(false);
    }
  };

  // ----- Загрузка текущих привязанных компаний для дома -----
  const fetchCurrentCaterings = async (token: string, houseId: number) => {
    try {
      const res = await fetch(`http://localhost:5213/api/houses/${houseId}/caterings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const currentIds = data.data.map((c: { cateringOwnerId: number }) => c.cateringOwnerId);
        setSelectedCaterings(currentIds);
      }
    } catch (error) {
      console.error('Ошибка загрузки текущих кейтерингов:', error);
    }
  };

  const fetchHouseData = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5213/api/houses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        const houseData = transformApiData(result.data);
        setHouseData(houseData);
        setFormData({
          price: houseData.price.toString(),
          area: houseData.area.toString(),
          rooms: houseData.houseInfo.rooms.toString(),
          bathrooms: houseData.houseInfo.bathrooms.toString(),
          floor: houseData.houseInfo.floor.toString(),
          houseType: houseData.houseType,
          rentType: houseData.rentType,
          region: houseData.houseInfo.region,
          city: houseData.houseInfo.city,
          street: houseData.houseInfo.street,
          houseNumber: houseData.houseInfo.houseNumber,
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
        // Загружаем привязанные кейтеринговые компании
        await fetchCurrentCaterings(token, houseData.id);
      } else {
        showNotification(result.message || 'Ошибка загрузки данных', 'error');
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (error) {
      console.error('fetch error:', error);
      showNotification('Ошибка соединения с сервером', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showNotification, transformApiData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else {
      fetchHouseData(token);
      fetchAvailableCaterings(token);
    }
  }, [id, navigate, fetchHouseData]);

  const houseTypes = [
    { value: 'Коттедж', label: 'Коттедж', description: 'Отдельный дом с участком' },
    { value: 'Вилла', label: 'Вилла', description: 'Комфортабельный загородный дом' },
    { value: 'Особняк', label: 'Особняк', description: 'Просторный дом высшего класса' },
    { value: 'Таунхаус', label: 'Таунхаус', description: 'Дом на несколько семей' },
    { value: 'Усадьба', label: 'Усадьба', description: 'Большой дом с обширной территорией' },
    { value: 'Резиденция', label: 'Резиденция', description: 'Элитный дом премиум-класса' }
  ];

  const roomsOptions = [
    { value: '1', label: '1 комната' }, { value: '2', label: '2 комнаты' },
    { value: '3', label: '3 комнаты' }, { value: '4', label: '4 комнаты' },
    { value: '5', label: '5 комнат' }, { value: '6', label: '6+ комнат' }
  ];

  const bathroomsOptions = [
    { value: '1', label: '1 санузел' }, { value: '2', label: '2 санузла' },
    { value: '3', label: '3 санузла' }, { value: '4', label: '4+ санузла' }
  ];

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
    const newPhotosArray = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (newPhotosArray.length === 0) {
      showNotification('Выберите изображения (JPG, PNG) до 10 МБ', 'warning');
      return;
    }
    const maxPhotos = 20;
    const totalPhotos = formData.existingPhotos.length + formData.newPhotos.length + newPhotosArray.length;
    if (totalPhotos > maxPhotos) {
      showNotification(`Максимум ${maxPhotos} фотографий`, 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...newPhotosArray]
    }));
    showNotification(`Добавлено ${newPhotosArray.length} фотографий`, 'success');
  };

  const handleRemoveExistingPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((_, i) => i !== index)
    }));
    showNotification('Фотография помечена для удаления', 'success');
  };

  const handleRemoveNewPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      newPhotos: prev.newPhotos.filter((_, i) => i !== index)
    }));
    showNotification('Фотография удалена', 'success');
  };

  const handleSetMainPhoto = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...formData.existingPhotos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    setFormData(prev => ({ ...prev, existingPhotos: newPhotos }));
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
      const changeEvent: React.ChangeEvent<HTMLInputElement> = { target: input } as React.ChangeEvent<HTMLInputElement>;
      handlePhotoUpload(changeEvent);
    }
  };

  const validateCityByRegion = (city: string, region: string): boolean => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return true;
    if (cityToRegion[trimmedCity] && cityToRegion[trimmedCity] !== region) {
      return false;
    }
    return true;
  };

  const validateForm = (): boolean => {
    if (!formData.price || parseFloat(formData.price) <= 0) { showNotification('Введите корректную цену', 'error'); return false; }
    if (!formData.area || parseFloat(formData.area) <= 0) { showNotification('Введите корректную площадь', 'error'); return false; }
    if (!formData.houseType) { showNotification('Выберите тип дома', 'error'); return false; }
    if (!formData.rentType) { showNotification('Выберите тип аренды', 'error'); return false; }
    if (!formData.region.trim()) { showNotification('Выберите область', 'error'); return false; }
    if (!formData.city.trim()) { showNotification('Введите населённый пункт', 'error'); return false; }
    if (!validateCityByRegion(formData.city, formData.region)) {
      showNotification(`Город "${formData.city}" не относится к области "${formData.region}". Пожалуйста, выберите правильную область или уточните населённый пункт.`, 'error');
      return false;
    }
    if (!formData.street.trim()) { showNotification('Введите улицу', 'error'); return false; }
    if (!formData.houseNumber.trim()) { showNotification('Введите номер дома', 'error'); return false; }
    if (!formData.description.trim() || formData.description.length < 50) { showNotification('Описание должно содержать минимум 50 символов', 'error'); return false; }
    if (formData.existingPhotos.length + formData.newPhotos.length === 0) { showNotification('Добавьте хотя бы одну фотографию', 'error'); return false; }
    return true;
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

  // ----- Обновление привязки кейтеринга (отправка заявок) -----
  const updateCaterings = async (token: string, houseId: number, cateringIds: number[]) => {
    try {
      const res = await fetch(`http://localhost:5213/api/houses/${houseId}/caterings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cateringOwnerIds: cateringIds })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.warn('Ошибка обновления кейтерингов:', data.message);
        showNotification('Не удалось обновить список кейтеринга', 'warning');
      } else {
        showNotification('Список кейтеринговых компаний обновлён', 'success');
      }
    } catch (error) {
      console.error('Ошибка при обновлении кейтерингов:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsSubmitting(true);
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Требуется авторизация', 'error');
    navigate('/login');
    return;
  }

  try {
    const uploadedImageUrls: string[] = [];
    for (const photo of formData.newPhotos) {
      const url = await uploadToCloudinary(photo);
      if (url) uploadedImageUrls.push(url);
    }
    const allPhotoUrls = [...formData.existingPhotos, ...uploadedImageUrls];
    if (allPhotoUrls.length === 0) {
      showNotification('Добавьте хотя бы одну фотографию', 'error');
      setIsSubmitting(false);
      return;
    }

    const housePayload = {
      Price: parseFloat(formData.price) || 0,
      Area: parseFloat(formData.area) || 0,
      Description: formData.description || '',
      HouseType: formData.houseType,
      RentType: formData.rentType,
      Region: formData.region,
      City: formData.city,
      Street: formData.street,
      HouseNumber: formData.houseNumber,
      Rooms: parseInt(formData.rooms) || 1,
      Bathrooms: parseInt(formData.bathrooms) || 1,
      Floor: parseInt(formData.floor) || 1,
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
      PhotoUrls: allPhotoUrls,
      DeleteExistingPhotos: true
    };

    const response = await fetch(`http://localhost:5213/api/houses/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(housePayload)
    });
    const result = await response.json();

    if (response.ok && result.success) {
      await updateCaterings(token, parseInt(id!), selectedCaterings);
      showNotification('Объявление успешно обновлено', 'success');
      navigate('/profile'); // ✅ Переход в профиль после сохранения
    } else {
      showNotification(result.message || 'Ошибка при обновлении', 'error');
    }
  } catch (error) {
    console.error('Update error:', error);
    showNotification('Ошибка соединения с сервером', 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="createad-page">
        <div className="createad-loading-screen">
          <div className="createad-spinner"></div>
          <p>Загрузка данных объявления...</p>
        </div>
      </div>
    );
  }

  const totalPhotosCount = formData.existingPhotos.length + formData.newPhotos.length;
  const maxPhotos = 20;

  return (
    <div className="createad-page">
      {notification && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}
      <Header />
      <div className="createad-hero-section">
        <div className="createad-container">
          <div className="createad-hero-content">
            <h1>Редактирование объявления #{id}</h1>
            <p>Обновите информацию о вашем доме на PrimeHouse</p>
            {houseData && (
              <div className="createad-house-info-badge">
                <span>Создано: {formatDate(houseData.announcementData)}</span>
                <span className={`createad-status ${houseData.active ? 'active' : 'inactive'}`}>
                  {houseData.active ? 'Активно' : 'Неактивно'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="createad-main-content">
        <div className="createad-container">
          <div className="createad-form-wrapper">
            <div className="createad-form-header">
              <h2>Редактировать объявление о доме</h2>
              <div className="createad-form-progress"><span>Все поля обязательны для заполнения</span></div>
            </div>

            <form className="createad-property-form" onSubmit={handleSubmit}>
              {/* Тип дома */}
              <div className="createad-form-section">
                <h3 className="createad-section-title"><i className="createad-icon fas fa-home"></i> Тип дома</h3>
                <p className="createad-section-description">Выберите тип вашего дома</p>
                <div className="createad-house-type-grid">
                  {houseTypes.map(type => (
                    <label key={type.value} className={`createad-house-type-card ${formData.houseType === type.value ? 'createad-selected' : ''}`}>
                      <input type="radio" name="houseType" value={type.value} checked={formData.houseType === type.value} onChange={handleInputChange} className="createad-visually-hidden" />
                      <div className="createad-card-content">
                        <h4>{type.label}</h4>
                        <p>{type.description}</p>
                        <div className="createad-checkmark"><i className="fas fa-check"></i></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Тип аренды */}
              <div className="createad-form-section">
                <h3 className="createad-section-title"><i className="createad-icon fas fa-calendar-alt"></i> Тип аренды</h3>
                <p className="createad-section-description">Укажите, как вы сдаёте дом</p>
                <div className="createad-rent-type-group">
                  <label className={`createad-rent-option ${formData.rentType === 'month' ? 'active' : ''}`}>
                    <input type="radio" name="rentType" value="month" checked={formData.rentType === 'month'} onChange={handleInputChange} />
                    <i className="fas fa-calendar-alt createad-rent-icon"></i>
                    <div className="createad-rent-text"><strong>Помесячно</strong><small>Долгосрочная аренда</small></div>
                  </label>
                  <label className={`createad-rent-option ${formData.rentType === 'day' ? 'active' : ''}`}>
                    <input type="radio" name="rentType" value="day" checked={formData.rentType === 'day'} onChange={handleInputChange} />
                    <i className="fas fa-sun createad-rent-icon"></i>
                    <div className="createad-rent-text"><strong>Посутчно</strong><small>Аренда на короткий срок</small></div>
                  </label>
                </div>
              </div>

              {/* Основная информация */}
              <div className="createad-form-section">
                <h3 className="createad-section-title"><i className="createad-icon fas fa-info-circle"></i> Основная информация</h3>
                <div className="createad-form-grid">
                  <div className="createad-form-group">
                    <label className="createad-form-label"><span>Цена аренды {formData.rentType === 'month' ? 'в месяц' : 'за сутки'}</span><span className="createad-required">*</span></label>
                    <div className="createad-input-with-suffix">
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="100" className="createad-form-input" />
                      <span className="createad-suffix">
                        <i className="nbrb-icon">&#xe901;</i>
                        {formData.rentType === 'month' ? '/мес' : '/сут'}
                      </span>
                    </div>
                  </div>
                  <div className="createad-form-group">
                    <label className="createad-form-label"><span>Общая площадь</span><span className="createad-required">*</span></label>
                    <div className="createad-input-with-suffix">
                      <input type="number" name="area" value={formData.area} onChange={handleInputChange} required min="0" step="0.1" className="createad-form-input" />
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
                    <input type="number" name="floor" value={formData.floor} onChange={handleInputChange} required min="0" max="10" className="createad-form-input" />
                  </div>
                </div>
              </div>

              {/* Местоположение */}
              <div className="createad-form-section">
                <h3 className="createad-section-title"><i className="createad-icon fas fa-map-marker-alt"></i> Местоположение</h3>
                <div className="createad-form-grid">
                  <div className="createad-form-group">
                    <label className="createad-form-label"><span>Область</span><span className="createad-required">*</span></label>
                    <div className="createad-select-wrapper">
                      <select name="region" value={formData.region} onChange={handleInputChange} required className="createad-form-select">
                        {belarusianRegions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <i className="createad-select-arrow fas fa-chevron-down"></i>
                    </div>
                  </div>
                  <div className="createad-form-group">
                    <label className="createad-form-label"><span>Населённый пункт (город, деревня, посёлок)</span><span className="createad-required">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="Минск, Столбцы, Сула, Боровляны..." className="createad-form-input" />
                  </div>
                  <div className="createad-form-group">
                    <label className="createad-form-label"><span>Улица</span><span className="createad-required">*</span></label>
                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} required placeholder="ул. Ленина" className="createad-form-input" />
                  </div>
                  <div className="createad-form-group">
                    <label className="createad-form-label"><span>Номер дома</span><span className="createad-required">*</span></label>
                    <input type="text" name="houseNumber" value={formData.houseNumber} onChange={handleInputChange} required placeholder="15, 15А, 15/2" className="createad-form-input" />
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

              {/* Удобства и особенности */}
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

              {/* НОВЫЙ БЛОК: Кейтеринг */}
              <div className="createad-form-section">
                <h3 className="createad-section-title"><i className="createad-icon fas fa-utensils"></i> Кейтеринг</h3>
                <p className="createad-section-description">Выберите компании, которые будут доступны для заказа еды при бронировании дома</p>
                <div className="createad-catering-selector">
                  {cateringCompaniesLoading ? (
                    <p>Загрузка компаний...</p>
                  ) : cateringCompanies.length === 0 ? (
                    <p>Нет доступных кейтеринговых компаний</p>
                  ) : (
                    <div className="createad-checkbox-group">
                      {cateringCompanies.map(company => (
                        <label key={company.id} className="createad-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCaterings.includes(company.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCaterings(prev => [...prev, company.id]);
                              } else {
                                setSelectedCaterings(prev => prev.filter(id => id !== company.id));
                              }
                            }}
                          />
                          <span className="createad-custom-checkbox"></span>
                          <span className="createad-checkbox-label">
                            <strong>{company.companyName}</strong> ({company.city})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Фотографии */}
              <div className="createad-form-section">
                <h3 className="createad-section-title"><i className="createad-icon fas fa-camera"></i> Фотографии дома</h3>
                <p className="createad-section-description">Обновите фотографии вашего дома</p>
                <div className={`createad-upload-area ${dragActive ? 'createad-drag-active' : ''} ${totalPhotosCount > 0 ? 'createad-has-photos' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                  <div className="createad-upload-content">
                    <i className="createad-upload-icon fas fa-cloud-upload-alt"></i>
                    <h4>Перетащите новые фото сюда</h4>
                    <p>или</p>
                    <label htmlFor="photoUpload" className="createad-upload-btn"><i className="fas fa-folder-open"></i> Выбрать файлы</label>
                    <input type="file" id="photoUpload" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </div>
                  {totalPhotosCount > 0 && (
                    <div className="createad-upload-stats">
                      <div className="createad-stats-info"><span className="createad-count">{totalPhotosCount}</span><span>/{maxPhotos} фото</span></div>
                      <div className="createad-stats-bar"><div className="createad-stats-fill" style={{ width: `${(totalPhotosCount / maxPhotos) * 100}%` }}></div></div>
                    </div>
                  )}
                </div>
                <div className="createad-upload-hint">
                  <p><strong>Рекомендации:</strong></p>
                  <ul><li>Добавьте 5-20 качественных фотографий</li><li>Первая фотография будет главной в объявлении</li><li>Формат: JPG, PNG, до 10 МБ каждая</li><li>Сделайте фотографии с разных ракурсов</li></ul>
                </div>

                {/* Существующие фото */}
                {formData.existingPhotos.length > 0 && (
                  <div className="createad-photos-preview">
                    <h4>Текущие фотографии ({formData.existingPhotos.length})</h4>
                    <div className="createad-preview-grid">
                      {formData.existingPhotos.map((url, index) => (
                        <div key={`existing-${index}`} className="createad-photo-preview">
                          <img src={url} alt={`Фото ${index + 1}`} />
                          {index === 0 && <div className="createad-photo-badge"><i className="fas fa-crown"></i> Главное</div>}
                          <div className="createad-photo-actions">
                            {index !== 0 && <button type="button" className="createad-photo-action" onClick={() => handleSetMainPhoto(index)} title="Сделать главным"><i className="fas fa-star"></i></button>}
                            <button type="button" className="createad-photo-action createad-delete" onClick={() => handleRemoveExistingPhoto(index)} title="Удалить"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Новые фото */}
                {formData.newPhotos.length > 0 && (
                  <div className="createad-photos-preview">
                    <h4>Новые фотографии ({formData.newPhotos.length})</h4>
                    <div className="createad-preview-grid">
                      {formData.newPhotos.map((file, index) => {
                        const objectUrl = URL.createObjectURL(file);
                        return (
                          <div key={`new-${index}`} className="createad-photo-preview">
                            <img src={objectUrl} alt={`Новое фото ${index + 1}`} />
                            <div className="createad-photo-actions">
                              <button type="button" className="createad-photo-action createad-delete" onClick={() => handleRemoveNewPhoto(index)} title="Удалить"><i className="fas fa-trash"></i></button>
                            </div>
                          </div>
                        );
                      })}
                      {totalPhotosCount < maxPhotos && (
                        <label className="createad-photo-preview createad-add-more" htmlFor="photoUpload">
                          <div className="createad-add-content"><i className="fas fa-plus"></i><span>Добавить еще фото</span></div>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Навигация */}
              <div className="createad-form-navigation">
                <div className="createad-navigation-left">
                  <button type="button" onClick={() => navigate('/profile')} className="createad-btn createad-btn-secondary"><i className="fas fa-arrow-left"></i> Вернуться в профиль</button>
                </div>
                <div className="createad-navigation-right">
                  <button type="submit" className="createad-btn createad-btn-primary createad-btn-publish" disabled={isSubmitting}>
                    {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Сохранение...</> : <><i className="fas fa-save"></i> Сохранить изменения</>}
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