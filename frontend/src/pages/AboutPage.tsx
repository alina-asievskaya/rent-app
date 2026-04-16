import React from "react";
import Header from "../components/Header";
import "./AboutPage.css";

const AboutPage: React.FC = () => {
  const familyTeam = [
    {
      id: 1,
      name: "Дмитрий Медов",
      role: "Основатель",
      image: "https://i.pinimg.com/736x/47/b4/08/47b408d514b99960bd5041e7f9153e3f.jpg",
      description: "Инженер-строитель. 15 лет в сегменте элитной недвижимости.",
      connection: "Основатель",
    },
    {
      id: 2,
      name: "Анна Медова",
      role: "Директор по подбору",
      image: "https://i.pinimg.com/736x/87/ab/fa/87abfa0103a3bb7e801b7e90bc58260a.jpg",
      description: "Экономист. Специализация — загородные резиденции.",
      connection: "Супруга",
    },
    {
      id: 3,
      name: "Михаил Богдашевич",
      role: "Стратегическое развитие",
      image: "https://i.pinimg.com/736x/96/fb/a5/96fba5ba9dbbc8b6f67dc282c050a568.jpg",
      description: "БГУ, факультет международного туризма.",
      connection: "Брат",
    },
    {
      id: 4,
      name: "Ольга Богдашевич",
      role: "Клиентский сервис",
      image: "https://img.freepik.com/premium-photo/portrait-young-woman-standing-against-white-background_1048944-8425580.jpg?semt=ais_hybrid&w=740",
      description: "Эксперт по гостеприимству премиум-класса.",
      connection: "Девушка",
    },
  ];

  const partnersRestaurants = [
    "Мак Бай", "KFC", "Burger King", "Пицца Лисица", "Пицца Темпо", "Доминос", "Суши Wok", "Papa John's"
  ];

  const partnersServices = [
    "Детские аниматоры",
    "Фотографы",
    "Организаторы мероприятий",
    "Кейтеринг",
  ];

  return (
    <>
      <Header />
      <main className="about-page">
        {/* Hero — усиленная композиция */}
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__overline">PrimeHouse Est. 2010</div>
            <h1 className="hero__title">
              Семейное агентство
              <br />
              элитной загородной
              <br />
              недвижимости
            </h1>
            <div className="hero__separator"></div>
            <p className="hero__text">
              Мы подбираем исключительные дома для аренды и отдыха в Беларуси. 
              Каждый объект проходит личную инспекцию и строгий отбор.
            </p>
            <div className="hero__stats">
              <div className="stat">
                <span className="stat__value">12</span>
                <span className="stat__label">лет опыта</span>
              </div>
              <div className="stat">
                <span className="stat__value">350+</span>
                <span className="stat__label">закрытых сделок</span>
              </div>
              <div className="stat">
                <span className="stat__value">100%</span>
                <span className="stat__label">проверка объектов</span>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__experience">
              <span className="hero__experience-number">15</span>
              <span className="hero__experience-text">лет<br />экспертизы</span>
            </div>
            <div className="hero__gold-line"></div>
            <div className="hero__quote">
              «Мы создаём не просто аренду — мы формируем образ жизни»
            </div>
          </div>
        </section>

        {/* Принципы — с золотыми акцентами и графикой */}
        <section className="principles">
          <div className="principles__grid">
            <div className="principle principle--border-left">
              <h3>Экспертный подбор</h3>
              <p>Только профессиональные агенты с доступом к закрытым базам элитных объектов.</p>
            </div>
            <div className="principle principle--border-top">
              <h3>Личная инспекция</h3>
              <p>Каждый дом проходит выездную проверку на соответствие высоким стандартам.</p>
            </div>
            <div className="principle principle--border-right">
              <h3>Индивидуальный подход</h3>
              <p>Учитываем все требования: от архитектурного стиля до приватности территории.</p>
            </div>
            <div className="principle principle--border-bottom">
              <h3>Юридическая безопасность</h3>
              <p>Полное сопровождение сделки с гарантией чистоты документов.</p>
            </div>
          </div>
        </section>

        {/* Семейная команда — с изысканными деталями */}
        <section className="team">
          <h2 className="section-title">Наша команда</h2>
          <div className="team__grid">
            {familyTeam.map((member, idx) => (
              <div key={member.id} className={`team-card ${idx === 0 ? 'team-card--featured' : ''}`}>
                <div className="team-card__image">
                  <img src={member.image} alt={member.name} />
                  {idx === 0 && <div className="team-card__crown"></div>}
                </div>
                <div className="team-card__content">
                  <div className="team-card__relation">{member.connection}</div>
                  <h3 className="team-card__name">{member.name}</h3>
                  <p className="team-card__role">{member.role}</p>
                  <p className="team-card__desc">{member.description}</p>
                  <div className="team-card__line"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="team__story">
            <div className="team__story-inner">
              <p className="team__story-quote">«Семейные ценности — основа доверия»</p>
              <p>
                В 2010 году Дмитрий и Анна Медовы начали с аренды собственной усадьбы. 
                Стремление к совершенству и персональный подход быстро выделили их на рынке. 
                Со временем к семейному делу присоединились брат Анны Михаил и его избранница Ольга — 
                специалисты с безупречным чувством стиля и пониманием запросов состоятельных клиентов.
              </p>
              <p>
                Сегодня PrimeHouse — это синоним доверия и безупречного вкуса в сегменте элитной недвижимости. 
                Мы остаёмся семейным агентством, где каждая сделка — это история уважения и заботы.
              </p>
            </div>
          </div>
        </section>

        {/* Партнёры — в две строгие колонки */}
        <section className="partners">
          <div className="partners__row">
            <div className="partners__col">
              <h3 className="partners__heading">Гастрономические партнёры</h3>
              <ul className="partners__list">
                {partnersRestaurants.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="partners__note">Доставка из ресторанов высокого уровня к вашему дому</p>
            </div>
            <div className="partners__col">
              <h3 className="partners__heading">Организация событий</h3>
              <ul className="partners__list">
                {partnersServices.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="partners__note">Праздники, фотосессии, мероприятия любого масштаба</p>
            </div>
          </div>
        </section>

        {/* Контакты — с нежным градиентом и золотом */}
        <section className="contacts">
          <div className="contacts__item">
            <h4>Офис</h4>
            <p>Минск, пр. Победителей 98</p>
          </div>
          <div className="contacts__item contacts__item--gold">
            <h4>Связь</h4>
            <p>+375 (29) 584-99-96</p>
            <p className="contacts__email">info@primehouse.by</p>
          </div>
          <div className="contacts__item">
            <h4>Часы работы</h4>
            <p>Пн–Пт 9:00–20:00</p>
            <p>Сб 10:00–18:00, Вс 10:00–16:00</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;