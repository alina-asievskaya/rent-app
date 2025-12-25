
import Header from "../components/Header";
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
  faStar,
  faChevronRight,
  faShieldAlt,
  faCalendarCheck,
  faHome,
  faHeart,
  faCouch
} from '@fortawesome/free-solid-svg-icons';

const Home: React.FC = () => {
 

  const properties = [
    {
      badge: "Популярное",
      type: "featured" as const,
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      price: "850 BYN/мес",
      address: "Минский район, Логойск",
      info: "Современный двухэтажный дом",
      beds: 2,
      baths: 1,
      area: 65,
      rating: 4.8,
      features: ["С мебелью", "Кондиционер", "Балкон"]
    },
    {
      badge: "Новое",
      type: "new" as const,
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      price: "650 BYN/мес",
      address: "Гомель, Советский район",
      info: "Уютная 1-комн. квартира",
      beds: 1,
      baths: 1,
      area: 45,
      rating: 4.5,
      features: ["Ремонт 2023", "Паркинг", "Лифт"]
    },
    {
      badge: "Премиум",
      type: "premium" as const,
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      price: "1,200 BYN/мес",
      address: "Минск, Ленинский район",
      info: "Просторная 3-комн. квартира",
      beds: 3,
      baths: 2,
      area: 85,
      rating: 4.9,
      features: ["С видом", "Камин", "Два балкона"]
    },
    {
      badge: "Выгодное",
      type: "discount" as const,
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      price: "950 BYN/мес",
      address: "Брест, Московский район",
      info: "Светлая 4-комн. квартира",
      beds: 4,
      baths: 2,
      area: 120,
      rating: 4.7,
      features: ["С террасой", "Кабинет", "Гардеробная"]
    },
  ];

  const categories = [
    { icon: faHome, label: "Виллы", count: "10+" },
    { icon: faBuilding, label: "Особняки", count: "20+" },
    { icon: faCouch, label: "Меблированные", count: "45+" },
    { icon: faHome, label: "Коттеджи", count: "45+" },
  ];

  const benefits = [
    {
      icon: faShieldAlt,
      title: "Безопасные сделки",
      description: "Все договоры проверяются юристами"
    },
    {
      icon: faCalendarCheck,
      title: "Быстрое заселение",
      description: "Средний срок оформления - 3 дня"
    },
    {
      icon: faCheckCircle,
      title: "Проверенные объекты",
      description: "Каждое жилье проходит верификацию"
    }
  ];

  const stats = [
    { number: "5,000+", label: "Активных предложений", icon: faBuilding },
    { number: "98%", label: "Довольных клиентов", icon: faUsers },
    { number: "24/7", label: "Поддержка", icon: faHeadset },
    { number: "15 мин", label: "Среднее время ответа", icon: faCheckCircle },
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content-modern">
            <div className="hero-text-modern">
              <h1 className="hero-title-modern">
                <span className="gradient-text">Найди свой идеальный дом</span>
                <br />в несколько кликов
              </h1>
              <p className="hero-subtitle-modern">
                Самый удобный способ аренды жилья в Беларуси. 
                Более 5,000 проверенных вариантов для комфортной жизни.
              </p>
              <div className="hero-actions-modern">
                <button className="btn-primary-modern">
                  <FontAwesomeIcon icon={faSearch} />
                  Начать поиск
                </button>
                <button className="btn-secondary-modern">
                  <FontAwesomeIcon icon={faBuilding} />
                  Сдать жилье
                </button>
              </div>
            </div>
            <div className="hero-image-modern">
              <div className="floating-card-modern">
                <div className="card-content-modern">
                  <div className="card-badge-modern">Топ выбор</div>
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop" 
                    alt="Лучшее предложение" 
                  />
                  <div className="card-info-modern">
                    <h4>Минский район, Логойск</h4>
                    <p>1850 BYN/мес • 2-этажный дом</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title-modern">Категории жилья</h2>
          <p className="section-subtitle-modern">
            Выберите тип жилья, который подходит именно вам
          </p>
          
          <div className="categories-grid-modern">
            {categories.map((category, index) => (
              <div key={index} className="category-card-modern">
                <div className="category-icon-modern">
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <h3>{category.label}</h3>
                <p>{category.count} предложений</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="featured-section-modern">
        <div className="container">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title-modern">Популярные предложения</h2>
              <p className="section-subtitle-modern">
                Самые востребованные варианты этой недели
              </p>
            </div>
            <button className="view-all-btn-modern">
              Все предложения
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          
          <div className="properties-grid-modern">
            {properties.map((property, index) => (
              <div key={index} className="property-card-modern">
                <div className={`property-badge-modern ${property.type}`}>
                  {property.badge}
                </div>
                <div className="property-image-modern">
                  <img src={property.imageUrl} alt={property.address} />
                  <button className="favorite-btn-modern">
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                </div>
                <div className="property-content-modern">
                  <div className="property-price-modern">
                    <span className="price-modern">{property.price}</span>
                    <div className="rating-modern">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{property.rating}</span>
                    </div>
                  </div>
                  <h3 className="property-title-modern">{property.info}</h3>
                  <div className="property-address-modern">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {property.address}
                  </div>
                  <div className="property-features-modern">
                    <span className="feature-modern">
                      <FontAwesomeIcon icon={faBed} /> {property.beds}
                    </span>
                    <span className="feature-modern">
                      <FontAwesomeIcon icon={faBath} /> {property.baths}
                    </span>
                    <span className="feature-modern">
                      <FontAwesomeIcon icon={faRulerCombined} /> {property.area} м²
                    </span>
                  </div>
                  <div className="property-tags-modern">
                    {property.features.map((feature, idx) => (
                      <span key={idx} className="tag-modern">{feature}</span>
                    ))}
                  </div>
                  <button className="property-btn-modern">
                    Подробнее
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title-modern">Почему выбирают нас</h2>
          <p className="section-subtitle-modern">
            Мы делаем аренду жилья простой и безопасной
          </p>
          
          <div className="benefits-grid-modern">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card-modern">
                <div className="benefit-icon-modern">
                  <FontAwesomeIcon icon={benefit.icon} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-modern">
        <div className="container">
          <div className="stats-grid-modern">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item-modern">
                <div className="stat-icon-modern">
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="stat-content-modern">
                  <div className="stat-number-modern">{stat.number}</div>
                  <div className="stat-label-modern">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content-modern">
            <div className="newsletter-text-modern">
              <h2>Получайте лучшие предложения первыми</h2>
              <p>Подпишитесь на рассылку и узнавайте о новых объектах</p>
            </div>
            <div className="newsletter-form-modern">
              <input 
                type="email" 
                placeholder="Ваш email" 
                className="email-input-modern"
              />
              <button className="subscribe-btn-modern">
                Подписаться
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;