import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Home.css";

// Импорт Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faBed,
  faBath,
  faRulerCombined,
  faMapMarkerAlt,
  faArrowRight,
  faBuilding,
  faUsers,
  faCheckCircle,
  faHeadset,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rent' | 'post'>('rent');

  const properties = [
    {
      badge: "Аренда",
      type: "rent" as const,
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      price: "120,000 ₽/мес",
      address: "Санкт-Петербург, Приморский р-н",
      info: "2-комн. квартира, 65 м²",
      beds: 2,
      baths: 1,
      area: 65,
      year: 2022,
    },
    {
      badge: "Аренда",
      type: "rent" as const,
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      price: "85,000 ₽/мес",
      address: "Казань, Вахитовский р-н",
      info: "1-комн. квартира, 45 м²",
      beds: 1,
      baths: 1,
      area: 45,
      year: 2021,
    },
    {
      badge: "Аренда",
      type: "rent" as const,
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      price: "250,000 ₽/мес",
      address: "Москва, ЦАО, ул. Тверская",
      info: "3-комн. квартира, 85 м²",
      beds: 3,
      baths: 2,
      area: 85,
      year: 2023,
    },
    {
      badge: "Аренда",
      type: "rent" as const,
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      price: "180,000 ₽/мес",
      address: "Москва, Хамовники",
      info: "4-комн. квартира, 120 м²",
      beds: 4,
      baths: 2,
      area: 120,
      year: 2022,
    },
  ];

  const stats = [
    { number: "5,000+", label: "Арендных объектов", icon: faBuilding },
    { number: "1,200+", label: "Довольных арендаторов", icon: faUsers },
    { number: "95%", label: "Успешных сделок", icon: faCheckCircle },
    { number: "24/7", label: "Поддержка клиентов", icon: faHeadset },
  ];

  const steps = [
    {
      number: "1",
      title: "Найдите жилье",
      description: "Используйте фильтры для поиска подходящих вариантов аренды"
    },
    {
      number: "2",
      title: "Свяжитесь с владельцем",
      description: "Организуйте просмотр и обсудите условия аренды"
    },
    {
      number: "3",
      title: "Безопасная сделка",
      description: "Заключите договор аренды с нашей помощью"
    }
  ];

  return (
    <>
      <Header />

      <section className="hero-home">
        <div className="container">
          <div className="hero-content-home">
            <h1>Найдите идеальное жилье для аренды</h1>
            <p>
              Более 5,000+ предложений по аренде жилья по всей Беларуси. 
              Безопасно, удобно и выгодно с нашей платформой.
            </p>
            
            <div className="search-box-container-home">
              <div className="search-box-home">
                <div className="search-tabs-home">
                  <button 
                    className={`tab-home ${activeTab === 'rent' ? 'tab-active-home' : ''}`}
                    onClick={() => setActiveTab('rent')}
                  >
                    <FontAwesomeIcon icon={faSearch} className="tab-icon-home" /> 
                    Найти жилье
                  </button>
                  <button 
                    className={`tab-home ${activeTab === 'post' ? 'tab-active-home' : ''}`}
                    onClick={() => setActiveTab('post')}
                  >
                    <FontAwesomeIcon icon={faPlusCircle} className="tab-icon-home" /> 
                    Сдать жилье
                  </button>
                </div>
                
                <div className="search-grid-home">
                  <div className="search-group-home">
                    <label className="search-label-home">Город</label>
                    <select className="search-select-home">
                      <option value="">Все города</option>
                      <option value="moscow">Минск</option>
                      <option value="spb">Гомель</option>
                      <option value="kazan">Гродно</option>
                      <option value="ekb">Брест</option>
                      <option value="nsk">Витебск</option>
                      <option value="mgl">Могилев</option>
                    </select>
                  </div>
                  
                  <div className="search-group-home">
                    <label className="search-label-home">Этажи</label>
                    <select className="search-select-home">
                      <option value="">Любое количество</option>
                      <option value="apartment">Один</option>
                      <option value="house">Два</option>
                      <option value="room">Три</option>
                      <option value="apartments">Чеыре</option>
                    </select>
                  </div>
                  
                  <div className="search-group-home">
                    <label className="search-label-home">Срок аренды</label>
                    <select className="search-select-home">
                      <option value="">Любой срок</option>
                      <option value="day">Посуточно</option>
                      <option value="month">Помесячно</option>
                      <option value="year">На длительный срок</option>
                    </select>
                  </div>
                  
                  <div className="search-group-home">
                    <label className="search-label-home">Цена, BYN/мес</label>
                    <select className="search-select-home">
                      <option value="">Любая цена</option>
                      <option value="0-30000">до 1000</option>
                      <option value="30000-60000">1000-2000</option>
                      <option value="60000-100000">2000-3500</option>
                      <option value="100000+">от 3500</option>
                    </select>
                  </div>
                  
                  <button className="search-button-home">
                    <FontAwesomeIcon icon={faSearch} /> 
                    {activeTab === 'rent' ? 'Найти жилье' : 'Разместить объявление'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-home">
        <div className="container">
          <h2 className="section-title-home">Популярные предложения</h2>
          <p className="section-subtitle-home">
            Самые востребованные объекты для аренды, проверенные нашими специалистами
          </p>
          
          <div className="properties-grid-home">
            {properties.map((property, index) => (
              <div key={index} className="property-card-home">
                <div className={`property-badge-home ${property.type}`}>
                  {property.badge}
                </div>
                <div className="property-image-home">
                  <img src={property.imageUrl} alt={property.address} />
                </div>
                <div className="property-content-home">
                  <div className="property-price-home">{property.price}</div>
                  <div className="property-address-home">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {property.address}
                  </div>
                  <div className="property-info-home">{property.info}</div>
                  <div className="property-features-home">
                    <span className="property-feature-home">
                      <FontAwesomeIcon icon={faBed} /> {property.beds}
                    </span>
                    <span className="property-feature-home">
                      <FontAwesomeIcon icon={faBath} /> {property.baths}
                    </span>
                    <span className="property-feature-home">
                      <FontAwesomeIcon icon={faRulerCombined} /> {property.area} м²
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button className="btn btn-primary btn-lg">
              Смотреть все предложения
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-home">
        <div className="container">
          <div className="stats-grid-home">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item-home">
                <div className="stat-icon-home">
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="stat-number-home">{stat.number}</div>
                <div className="stat-label-home">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-home">
        <div className="container">
          <h2 className="section-title-home">Как это работает</h2>
          <p className="section-subtitle-home">
            Простой и безопасный процесс аренды жилья
          </p>
          
          <div className="steps-grid-home">
            {steps.map((step, index) => (
              <div key={index} className="step-home">
                <div className="step-number-home">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-home">
        <div className="container">
          <div className="cta-content-home">
            <h2>Готовы найти свое идеальное жилье?</h2>
            <p>
              Начните поиск уже сегодня или разместите свое объявление об аренде
            </p>
            <div className="cta-buttons-home">
              <button className="btn btn-primary cta-primary-home">
                Начать поиск
              </button>
              <button className="btn cta-secondary-home">
                Сдать жилье
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;