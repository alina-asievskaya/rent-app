import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./AboutPage.css";

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
  faAward,
  faPhone,
  faClock,
  faDirections,
  faMountain,
  faCampground,
} from '@fortawesome/free-solid-svg-icons';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      id: 1,
      name: "Дмитрий Медов",
      role: "Основатель",
      image: "https://i.pinimg.com/736x/47/b4/08/47b408d514b99960bd5041e7f9153e3f.jpg",
      bio: "Владелец нескольких эко-усадеб. 10 лет в сфере загородной недвижимости.",
      email: "alex@domabel.by"
    },
    {
      id: 2,
      name: "Анна Медова",
      role: "Директор по подбору",
      image: "https://i.pinimg.com/736x/87/ab/fa/87abfa0103a3bb7e801b7e90bc58260a.jpg",
      bio: "Эксперт по загородной недвижимости. Лично проверяет каждый дом.",
      email: "elena@domabel.by"
    },
    {
      id: 3,
      name: "Иван Лесной",
      role: "Гид по эко-туризму",
      image: "https://i.pinimg.com/736x/96/fb/a5/96fba5ba9dbbc8b6f67dc282c050a568.jpg",
      bio: "Знает каждую тропинку в белорусских лесах. Организует уникальные маршруты.",
      email: "victor@domabel.by"
    },
    {
      id: 4,
      name: "Ольга Богдашевич",
      role: "Консьерж-сервис",
      image: "https://img.freepik.com/premium-photo/portrait-young-woman-standing-against-white-background_1048944-8425580.jpg?semt=ais_hybrid&w=740",
      bio: "Ваш персональный помощник в отдыхе.",
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
      description: "Собственные пляжи и виды на озеро",
      link: "/catalog?type=Дома у воды"
    },
    {
      icon: faTree,
      title: "Лесные усадьбы",
      description: "Уединение среди вековых деревьев",
      link: "/catalog?type=Лесные усадьбы"
    },
    {
      icon: faMountain,
      title: "Загородные виллы",
      description: "Просторные дома с панорамными видами",
      link: "/catalog?type=Загородные виллы"
    },
    {
      icon: faCampground,
      title: "Эко-домики",
      description: "Экологичный отдых в гармонии с природой",
      link: "/catalog?type=Эко-домики"
    }
  ];

  const handleSearchClick = () => {
    navigate("/catalog");
  };

  const handleConsultationClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/profile?tab=consultation");
    } else {
      alert("Для записи на консультацию необходимо войти в систему");
      navigate("/login");
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "+375291234567";
    const message = "Здравствуйте! Мне нужна консультация по подбору жилья.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleRouteClick = () => {
    const url = "https://yandex.ru/maps/157/minsk/?ll=27.561831,53.902284&mode=routes&rtext=~53.902284,27.561831&rtt=auto&z=16";
    window.open(url, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:info@primehouse.by";
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="about-hero-aboutpage">
        <div className="container">
          <div className="hero-content-aboutpage">
            <div className="hero-text-aboutpage">
              <div className="hero-badge-aboutpage">
                <FontAwesomeIcon icon={faCrown} />
                <span>Ваш гид в мире загородной недвижимости</span>
              </div>
              <h1>
                <span className="text-primary-aboutpage">PrimeHouse</span> — 
                находите и снимайте дом мечты
              </h1>
              <p className="hero-description-aboutpage">
                Мы объединяем тысячи предложений по аренде загородных домов в Беларуси. 
                Здесь вы найдёте как уютный домик для уикенда, так и просторную усадьбу для жизни на год.
              </p>
              
              <div className="hero-stats-aboutpage">
                <div className="stat-card-aboutpage">
                  <div className="stat-icon-aboutpage">
                    <FontAwesomeIcon icon={faHome} />
                  </div>
                  <div className="stat-content-aboutpage">
                    <h3>200+</h3>
                    <p>Активных объявлений</p>
                  </div>
                </div>
                <div className="stat-card-aboutpage">
                  <div className="stat-icon-aboutpage">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="stat-content-aboutpage">
                    <h3>125+</h3>
                    <p>Довольных клиентов</p>
                  </div>
                </div>
                <div className="stat-card-aboutpage">
                  <div className="stat-icon-aboutpage">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div className="stat-content-aboutpage">
                    <h3>98.9%</h3>
                    <p>Положительных отзывов</p>
                  </div>
                </div>
                <div className="stat-card-aboutpage">
                  <div className="stat-icon-aboutpage">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <div className="stat-content-aboutpage">
                    <h3>100%</h3>
                    <p>Проверенные контакты</p>
                  </div>
                </div>
              </div>

              <div className="hero-cta-buttons-aboutpage">
                <button className="btn btn-primary btn-lg" onClick={handleSearchClick}>
                  <FontAwesomeIcon icon={faSearch} /> Найти дом для отдыха
                </button>
              </div>
            </div>
            
            <div className="hero-image-aboutpage">
              <div className="image-container-aboutpage">
                <img 
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=800&fit=crop" 
                  alt="Загородный дом" 
                />
                <div className="image-badge-aboutpage">
                  <FontAwesomeIcon icon={faAward} />
                  <span>Аренда от владельцев и агентств</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-wave-aboutpage">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values-aboutpage">
        <div className="container">
          <div className="section-header-aboutpage center">
            <h2>Наши ценности</h2>
            <p className="section-subtitle-aboutpage">
              Принципы, которые делают наш сервис уникальным
            </p>
          </div>
          
          <div className="values-grid-aboutpage">
            {values.map((value, index) => (
              <div key={index} className="value-card-aboutpage">
                <div className="value-icon-aboutpage">
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
      <section className="types-section-aboutpage">
        <div className="container">
          <div className="section-header-aboutpage center">
            <h2>Что мы предлагаем</h2>
            <p className="section-subtitle-aboutpage">
              Только лучшие варианты для вашего отдыха
            </p>
          </div>
          
          <div className="types-grid-aboutpage">
            {propertyTypes.map((type, index) => (
              <div 
                key={index} 
                className="type-card-aboutpage"
                onClick={() => navigate(type.link)}
                style={{ cursor: 'pointer' }}
              >
                <div className="type-icon-aboutpage">
                  <FontAwesomeIcon icon={type.icon} />
                </div>
                <h3>{type.title}</h3>
                <p>{type.description}</p>
                <button className="type-link-aboutpage">
                  Смотреть предложения
                  
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section-aboutpage">
        <div className="container">
          <div className="section-header-aboutpage center">
            <h2>Наша команда</h2>
            <p className="section-subtitle-aboutpage">
              Эксперты, которые помогут найти дом мечты
            </p>
          </div>
          
          <div className="team-grid-aboutpage">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card-aboutpage">
                <div className="team-image-aboutpage">
                  <img src={member.image} alt={member.name} />
                  <div className="team-overlay-aboutpage">
                    <a href={`mailto:${member.email}`} onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `mailto:${member.email}`;
                    }}>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </a>
                  </div>
                </div>
                <div className="team-info-aboutpage">
                  <h3>{member.name}</h3>
                  <p className="team-role-aboutpage">{member.role}</p>
                  <p className="team-bio-aboutpage">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Улучшенная Office Section */}
      <section className="office-section-aboutpage">
        <div className="container">
          <div className="office-content-aboutpage">
            <div className="office-info">
              <div className="section-header-aboutpage">
                <h2>Нужна помощь в подборе?</h2>
                <p className="section-subtitle-aboutpage">
                  Наши эксперты бесплатно помогут вам:
                </p>
              </div>
              
              <div className="office-features-aboutpage">
                <div className="feature-aboutpage">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Найти дом по вашим критериям</span>
                </div>
                <div className="feature-aboutpage">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Организовать просмотр</span>
                </div>
                <div className="feature-aboutpage">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Проверить документы и договор</span>
                </div>
                <div className="feature-aboutpage">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Согласовать выгодные условия</span>
                </div>
              </div>
              
              <div className="office-details-aboutpage">
                <div className="detail-item-aboutpage">
                  <div className="detail-icon-wrapper">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div>
                    <h4>Главный офис</h4>
                    <p className="detail-address">г. Минск, ул. Ландера, 2</p>
                    <p className="detail-building">БЦ "Плаза", 5 этаж, офис 502</p>
                    <p className="detail-note">🚇 5 минут от метро "Пушкинская"</p>
                  </div>
                </div>
                
                <div className="detail-item-aboutpage">
                  <div className="detail-icon-wrapper">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <h4>Единый номер</h4>
                    <p className="detail-phone">
                      <a href="tel:+375291234567" onClick={(e) => {
                        e.preventDefault();
                        window.location.href = 'tel:+375291234567';
                      }}>+375 (29) 123-45-67</a>
                    </p>
                    <p className="detail-email">
                      <a href="mailto:info@primehouse.by" onClick={(e) => {
                        e.preventDefault();
                        window.location.href = 'mailto:info@primehouse.by';
                      }}>info@primehouse.by</a>
                    </p>
                    <p className="detail-whatsapp">💬 WhatsApp: +375 (29) 123-45-67</p>
                  </div>
                </div>
                
                <div className="detail-item-aboutpage">
                  <div className="detail-icon-wrapper">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <h4>Время работы</h4>
                    <div className="working-hours">
                      <div className="hours-item">
                        <span>Пн-Пт:</span>
                        <strong>9:00-20:00</strong>
                      </div>
                      <div className="hours-item">
                        <span>Суббота:</span>
                        <strong>10:00-18:00</strong>
                      </div>
                      <div className="hours-item">
                        <span>Воскресенье:</span>
                        <strong>10:00-16:00</strong>
                      </div>
                    </div>
                    <p className="detail-note">📅 Консультации по предварительной записи</p>
                  </div>
                </div>
              </div>
              
              <div className="office-cta-aboutpage">
                <div className="cta-content">
                  <div className="cta-icon">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <div className="cta-text">
                    <h4>Первая консультация — бесплатно</h4>
                    <p>Приходите к нам в офис и получите индивидуальный подбор домов</p>
                  </div>
                </div>
                <div className="cta-buttons">
                  <button className="btn btn-primary btn-lg" onClick={handleConsultationClick}>
                    <FontAwesomeIcon icon={faPhone} /> Записаться на консультацию
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={handleWhatsAppClick}>
                    <FontAwesomeIcon icon={faEnvelope} /> Написать в WhatsApp
                  </button>
                </div>
              </div>
            </div>
            
            <div className="office-map-aboutpage">
              <div className="map-container-aboutpage">
                {/* Яндекс Карта */}
                <div className="yandex-map-wrapper">
                  <iframe
                    title="Yandex Map - PrimeHouse Office"
                    src="https://yandex.ru/map-widget/v1/?um=constructor%3A70cbe8c4d3b8be8d6f6b2f3b3c8e7a7e1&source=constructor&ll=27.561831,53.902284&z=16"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: 'var(--radius-xl)' }}
                    allowFullScreen
                  />
                  <div className="map-overlay-info">
                    <div className="map-marker-animated">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <div className="map-info-content">
                      <h5>PrimeHouse Office</h5>
                      <p>Минск, ул. Ландера, 2</p>
                      <small>БЦ "Плаза", 5 этаж</small>
                    </div>
                  </div>
                </div>
                
                <div className="map-actions">
                  <a 
                    href="#"
                    className="btn btn-outline map-action-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRouteClick();
                    }}
                  >
                    <FontAwesomeIcon icon={faDirections} /> Проложить маршрут
                  </a>
                  <button className="btn btn-outline map-action-btn" onClick={handleEmailClick}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Сохранить адрес
                  </button>
                </div>
              </div>
              
              <div className="visit-info-card">
                <div className="visit-icon">
                  <FontAwesomeIcon icon={faHome} />
                </div>
                <div className="visit-content">
                  <h4>Приезжайте в офис!</h4>
                  <p>Изучите каталог вместе с экспертом за чашкой кофе</p>
                  <p className="visit-bonus">🎁 При первой консультации — каталог лучших домов в подарок</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;