import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./AboutPage.css";

// Импорт Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faUsers,
faCheckCircle,
  faHeart,
  faShieldAlt,
  faMapMarkerAlt,
  faEnvelope,
  faStar,
  faLeaf,
  faHome,
  faWater,
  faTree,
 faSearch,
 faCalendarAlt,
  faAward,
  faPhone,
  faClock,
  faDirections,
faInfoCircle,
  faMountain,
  faCampground,
 faHeadset
} from '@fortawesome/free-solid-svg-icons';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Александр Борисов",
      role: "Основатель & CEO",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
      bio: "Владелец нескольких эко-усадеб. 15 лет в сфере загородной недвижимости.",
      email: "alex@domabel.by"
    },
    {
      id: 2,
      name: "Елена Заречная",
      role: "Директор по подбору",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      bio: "Эксперт по загородной недвижимости. Лично проверяет каждый дом.",
      email: "elena@domabel.by"
    },
    {
      id: 3,
      name: "Виктор Лесной",
      role: "Гид по эко-туризму",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Знает каждую тропинку в белорусских лесах. Организует уникальные маршруты.",
      email: "victor@domabel.by"
    },
    {
      id: 4,
      name: "Ольга Усадебная",
      role: "Консьерж-сервис",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      bio: "Организует VIP-обслуживание. Ваш персональный помощник в отдыхе.",
      email: "concierge@domabel.by"
    }
  ];

  const values = [
    {
      icon: faCrown,
      title: "Эксклюзивность",
      description: "Только уникальные дома с характером и историей"
    },
    {
      icon: faLeaf,
      title: "Единение с природой",
      description: "Дома в гармонии с окружающей средой"
    },
    {
      icon: faHeart,
      title: "Забота о деталях",
      description: "Всё продумано для вашего комфорта"
    },
    {
      icon: faShieldAlt,
      title: "Надежность",
      description: "Каждый дом проверен лично нашей командой"
    }
  ];


  const propertyTypes = [
    {
      icon: faWater,
      title: "Дома у воды",
      description: "Собственные пляжи и виды на озеро"
    },
    {
      icon: faTree,
      title: "Лесные усадьбы",
      description: "Уединение среди вековых деревьев"
    },
    {
      icon: faMountain,
      title: "Загородные виллы",
      description: "Просторные дома с панорамными видами"
    },
    {
      icon: faCampground,
      title: "Эко-домики",
      description: "Экологичный отдых в гармонии с природой"
    }
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
<section className="about-hero">
  <div className="container">
    <div className="hero-content">
      <div className="hero-text">
        <div className="hero-badge">
          <FontAwesomeIcon icon={faCrown} />
          <span>Ваш гид в мире загородной недвижимости</span>
        </div>
        <h1>
          <span className="text-primary">DomaBel</span> — 
          находите и снимайте дом мечты
        </h1>
        <p className="hero-description">
          Мы объединяем тысячи предложений по аренде загородных домов в Беларуси. 
          Здесь вы найдёте как уютный домик для уикенда, так и просторную усадьбу для жизни на год.
        </p>
        
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faHome} />
            </div>
            <div className="stat-content">
              <h3>2,000+</h3>
              <p>Активных объявлений</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-content">
              <h3>12,500+</h3>
              <p>Довольных клиентов</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div className="stat-content">
              <h3>98.9%</h3>
              <p>Положительных отзывов</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <div className="stat-content">
              <h3>100%</h3>
              <p>Проверенные контакты</p>
            </div>
          </div>
        </div>

        <div className="hero-cta-buttons">
          <button className="btn btn-primary btn-lg">
            <FontAwesomeIcon icon={faSearch} /> Найти дом для отдыха
          </button>
          <button className="btn btn-secondary btn-lg">
            <FontAwesomeIcon icon={faCalendarAlt} /> Смотреть долгосрочную аренду
          </button>
        </div>
      </div>
      
      <div className="hero-image">
        <div className="image-container">
          <img 
            src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=800&fit=crop" 
            alt="Загородный дом" 
          />
          <div className="image-badge">
            <FontAwesomeIcon icon={faAward} />
            <span>Аренда от владельцев и агентств</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div className="hero-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
    </svg>
  </div>
</section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <div className="section-header center">
            <h2>Наши ценности</h2>
            <p className="section-subtitle">
              Принципы, которые делают наш сервис уникальным
            </p>
          </div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="types-section">
        <div className="container">
          <div className="section-header center">
            <h2>Что мы предлагаем</h2>
            <p className="section-subtitle">
              Только лучшие варианты для вашего отдыха
            </p>
          </div>
          
          <div className="types-grid">
            {propertyTypes.map((type, index) => (
              <div key={index} className="type-card">
                <div className="type-icon">
                  <FontAwesomeIcon icon={type.icon} />
                </div>
                <h3>{type.title}</h3>
                <p>{type.description}</p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header center">
            <h2>Наша команда</h2>
            <p className="section-subtitle">
              Эксперты, которые помогут найти дом мечты
            </p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="team-overlay">
                    <a href={`mailto:${member.email}`}>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </a>
                  </div>
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Section */}
<section className="office-section">
  <div className="container">
    <div className="office-content">
      <div className="office-info">
        <div className="section-header">
          <h2>Нужна помощь в подборе?</h2>
          <p className="section-subtitle">
            Наши эксперты бесплатно помогут вам:
          </p>
        </div>
        
        <div className="office-features">
          <div className="feature">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Найти дом по вашим критериям</span>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Организовать просмотр</span>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Проверить документы и договор</span>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Согласовать выгодные условия</span>
          </div>
        </div>
        
        <div className="office-details">
          <div className="detail-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <div>
              <h4>Главный офис</h4>
              <p>г. Минск, ул. Ландера, 2</p>
              <p>БЦ "Плаза", 5 этаж</p>
            </div>
          </div>
          
          <div className="detail-item">
            <FontAwesomeIcon icon={faPhone} />
            <div>
              <h4>Единый номер</h4>
              <p>+375 (29) 123-45-67</p>
              <p>Звонок бесплатный</p>
            </div>
          </div>
          
          <div className="detail-item">
            <FontAwesomeIcon icon={faClock} />
            <div>
              <h4>Консультации</h4>
              <p>Пн-Пт: 9:00-20:00</p>
              <p>Сб-Вс: 10:00-18:00</p>
            </div>
          </div>
        </div>
        
        <div className="office-cta">
          <p className="cta-note">
            <FontAwesomeIcon icon={faInfoCircle} />
            Услуги подбора и консультации — бесплатно для арендаторов
          </p>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faHeadset} /> Заказать консультацию
          </button>
        </div>
      </div>
      
      <div className="office-map">
        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-marker">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="map-info">
              <h4>Приезжайте в офис</h4>
              <p>Изучите каталог вместе с экспертом</p>
              <button className="btn btn-outline">
                <FontAwesomeIcon icon={faDirections} /> Проложить маршрут
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <FontAwesomeIcon icon={faCrown} className="cta-icon" />
            <h2>Начните свой идеальный отдых</h2>
            <p>Выберите дом мечты среди лучших усадеб Беларуси</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg">
                Смотреть все дома
              </button>
              <button className="btn btn-secondary btn-lg">
                Получить консультацию
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutPage;