import React from "react";
import Header from "../components/Header";
import "./AboutPage.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faUsers,
  faHeart,
  faShieldAlt,
  faMapMarkerAlt,
  // faLeaf,
  faHome,
  faPhone,
  faClock,
  faUserTie,
  faHistory,
  faBuilding,
  faGraduationCap,

  faGlobe,

  faKey,
  faBuilding as faBuildingOffice
} from '@fortawesome/free-solid-svg-icons';

const AboutPage: React.FC = () => {
 

  const familyTeam = [
    {
      id: 1,
      name: "Дмитрий Медов",
      role: "Основатель компании",
      image: "https://i.pinimg.com/736x/47/b4/08/47b408d514b99960bd5041e7f9153e3f.jpg",
      description: "Инженер-строитель по образованию. 15 лет опыта в строительстве и недвижимости.",
      isFounder: true,
      connection: "Основатель семейного дела"
    },
    {
      id: 2,
      name: "Анна Медова",
      role: "Директор по подбору объектов",
      image: "https://i.pinimg.com/736x/87/ab/fa/87abfa0103a3bb7e801b7e90bc58260a.jpg",
      description: "Экономист, специалист по загородной недвижимости. 10 лет опыта в недвижимости.",
      isSpouse: true,
      connection: "Супруга основателя"
    },
    {
      id: 3,
      name: "Михаил Богдашевич",
      role: "Директор по развитию",
      image: "https://i.pinimg.com/736x/96/fb/a5/96fba5ba9dbbc8b6f67dc282c050a568.jpg",
      description: "Брат Анны. Выпускник БГУ по специальности 'Туризм и гостеприимство'.",
      isRelative: true,
      connection: "Брат Анны"
    },
    {
      id: 4,
      name: "Ольга Богдашевич",
      role: "Менеджер по клиентскому сервису",
      image: "https://img.freepik.com/premium-photo/portrait-young-woman-standing-against-white-background_1048944-8425580.jpg?semt=ais_hybrid&w=740",
      description: "Однокурсница Михаила. Специалист по туризму и гостеприимству.",
      isPartner: true,
      connection: "Девушка Михаила"
    }
  ];

  // Новые статистики для геро-секции
 

  const companyStory = [
    {
      year: "2010",
      title: "Начало",
      description: "Дмитрий и Анна Медовы начали с аренды собственной загородной усадьбы."
    },
    {
      year: "2012",
      title: "Первая команда",
      description: "К команде присоединился брат Анны - Михаил, специалист по туризму."
    },
    {
      year: "2014",
      title: "Расширение",
      description: "Ольга, однокурсница Михаила, стала частью команды как эксперт по сервису."
    },
    {
      year: "2024",
      title: "PrimeHouse сегодня",
      description: "Более 200 элитных объектов и 125 довольных семей."
    }
  ];

  

  

  const contactInfo = [
    {
      icon: faMapMarkerAlt,
      title: "Главный офис",
      details: [
        "проспект Победителей 98",
        "город Минск"
      ]
    },
    {
      icon: faPhone,
      title: "Контакты",
      details: [
        "+375 (29) 584-99-96",
        "info@primehouse.by"
      ],
    },
    {
      icon: faClock,
      title: "Время работы",
      details: [
        "Пн-Пт: 9:00-20:00",
        "Суббота: 10:00-18:00",
        "Воскресенье: 10:00-16:00"
      ]
    }
  ];

 
  return (
    <>
      <Header />

      <section className="about-hero-aboutpage">
        <div className="container">
          <div className="hero-content-aboutpage">
            <div className="hero-text-aboutpage">
              <div className="hero-badge-aboutpage">
                <FontAwesomeIcon icon={faCrown} />
                <span>История нашей семьи</span>
              </div>
              <h1>
                <span className="text-primary-aboutpage">PrimeHouse</span> — 
                семейная история успеха
              </h1>
              <p className="hero-description-aboutpage">
                Мы - специализированное агентство по подбору элитной недвижимости в Беларуси. 
                С 2010 года мы помогаем клиентам находить идеальные дома для аренды и отдыха, 
                сотрудничая только с проверенными агентами.
              </p>
              
              
            </div>
            
            <div className="hero-stats-section-aboutpage">
              <div className="stats-header">
                <FontAwesomeIcon icon={faKey} />
                <h2>Наша специализация</h2>
              </div>
              <div className="stats-grid-aboutpage">
                <div className="stats-card-aboutpage">
                  <div className="stats-icon-wrapper">
                    <FontAwesomeIcon icon={faHome} />
                  </div>
                  <h3>Экспертный подбор</h3>
                  <p>Работаем только с профессиональными агентами по недвижимости</p>
                </div>
                
                <div className="stats-card-aboutpage">
                  <div className="stats-icon-wrapper">
                    <FontAwesomeIcon icon={faBuildingOffice} />
                  </div>
                  <h3>Проверка объектов</h3>
                  <p>Каждый объект лично проверяется нашими специалистами</p>
                </div>
                
                <div className="stats-card-aboutpage">
                  <div className="stats-icon-wrapper">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <h3>Персональный подход</h3>
                  <p>Индивидуальный подбор домов под ваши требования</p>
                </div>
                
                <div className="stats-card-aboutpage">
                  <div className="stats-icon-wrapper">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <h3>Безопасность сделок</h3>
                  <p>Полное юридическое сопровождение и гарантии</p>
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

      {/* Остальные секции остаются без изменений */}
      <section className="story-section-aboutpage">
        <div className="container">
          <div className="section-header-aboutpage center">
            <div className="story-badge">
              <FontAwesomeIcon icon={faHistory} />
              <span>Наша история</span>
            </div>
            <h2>Как всё начиналось</h2>
            <p className="section-subtitle-aboutpage">
              Путь от маленькой семейной идеи до лидера рынка
            </p>
          </div>
          
          <div className="story-timeline">
            {companyStory.map((story, index) => (
              <div key={index} className="story-point">
                <div className="story-year">{story.year}</div>
                <div className="story-content">
                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                </div>
                {index < companyStory.length - 1 && (
                  <div className="timeline-line"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>      

      <section className="team-section-aboutpage">
        <div className="container">
          <div className="section-header-aboutpage center">
            <div className="family-badge">
              <FontAwesomeIcon icon={faHeart} />
              <span>Семейное древо PrimeHouse</span>
            </div>
            <h2>Наша команда - наша семья</h2>
            <p className="section-subtitle-aboutpage">
              Мы не просто коллеги, мы - одна семья
            </p>
          </div>
          
          <div className="family-tree">
            
            <div className="founders-row">
              <div className="founder-card">
                <div className="founder-avatar">
                  <img src={familyTeam[0].image} alt={familyTeam[0].name} />
                  <div className="avatar-ring"></div>
                </div>
                <div className="founder-info">
                  <div className="founder-connection">
                    <FontAwesomeIcon icon={faUserTie} />
                    <span>{familyTeam[0].connection}</span>
                  </div>
                  <h3>{familyTeam[0].name}</h3>
                  <p className="founder-role">{familyTeam[0].role}</p>
                  <p className="founder-description">{familyTeam[0].description}</p>
                </div>
              </div>
              
              <div className="couple-connection">
                <div className="heart-pulse">
                  <FontAwesomeIcon icon={faHeart} />
                </div>
                <div className="connection-text">С 2008 года вместе</div>
              </div>
              
              <div className="founder-card">
                <div className="founder-avatar">
                  <img src={familyTeam[1].image} alt={familyTeam[1].name} />
                  <div className="avatar-ring"></div>
                </div>
                <div className="founder-info">
                  <div className="founder-connection">
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{familyTeam[1].connection}</span>
                  </div>
                  <h3>{familyTeam[1].name}</h3>
                  <p className="founder-role">{familyTeam[1].role}</p>
                  <p className="founder-description">{familyTeam[1].description}</p>
                </div>
              </div>
            </div>
            
            
            
            <div className="relatives-row">
              <div className="relative-card">
                <div className="relative-avatar">
                  <img src={familyTeam[2].image} alt={familyTeam[2].name} />
                  <div className="avatar-badge">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                </div>
                <div className="relative-info">
                  <div className="relative-connection">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{familyTeam[2].connection}</span>
                  </div>
                  <h4>{familyTeam[2].name}</h4>
                  <p className="relative-role">{familyTeam[2].role}</p>
                  <p className="relative-description">{familyTeam[2].description}</p>
                </div>
              </div>
              
              <div className="partner-connection">
                <div className="study-icon">
                  <FontAwesomeIcon icon={faBuilding} />
                </div>
                <div className="connection-text">Однокурсники в БГУ</div>
              </div>
              
              <div className="relative-card">
                <div className="relative-avatar">
                  <img src={familyTeam[3].image} alt={familyTeam[3].name} />
                  <div className="avatar-badge">
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                </div>
                <div className="relative-info">
                  <div className="relative-connection">
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{familyTeam[3].connection}</span>
                  </div>
                  <h4>{familyTeam[3].name}</h4>
                  <p className="relative-role">{familyTeam[3].role}</p>
                  <p className="relative-description">{familyTeam[3].description}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="team-story">
            <h3>Наша история в деталях</h3>
            <p>
              Всё началось с простой идеи - сделать отдых в загородных домах доступным и комфортным. 
              Дмитрий, инженер-строитель по образованию, и Анна, экономист, начали с аренды собственной усадьбы. 
              Увидев потенциал бизнеса, они пригласили брата Анны - Михаила, который учился на туризм в БГУ. 
              Михаил познакомился с Ольгой в университете, и теперь она помогает нам создавать незабываемый сервис для наших гостей.
            </p>
            <p>
              Сегодня мы - одна большая семья, где каждый знает свою роль и вносит вклад в общее дело. 
              Наш секрет успеха прост: мы относимся к клиентам так же тепло, как относимся друг к другу.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section-aboutpage">
        <div className="container">
          <div className="section-header-aboutpage center">
            <h2>Свяжитесь с нами</h2>
            <p className="section-subtitle-aboutpage">
              Мы всегда рады помочь вам найти идеальный дом
            </p>
          </div>
          
          <div className="contact-grid">
            {contactInfo.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={contact.icon} />
                </div>
                <h3>{contact.title}</h3>
                <div className="contact-details">
                  {contact.details.map((detail, i) => (
                    <p key={i} className="contact-detail">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;