import React from "react";
import Header from "../components/Header";
import "./AboutPage.css";

const AboutPage: React.FC = () => {
  const team = [
    {
      id: 1,
      name: "Дмитрий Медов",
      role: "Основатель",
      image: "https://i.pinimg.com/736x/47/b4/08/47b408d514b99960bd5041e7f9153e3f.jpg",
      description: "Инженер-строитель. Специализация — элитная загородная недвижимость.",
    },
    {
      id: 2,
      name: "Анна Медова",
      role: "Директор по подбору",
      image: "https://i.pinimg.com/736x/87/ab/fa/87abfa0103a3bb7e801b7e90bc58260a.jpg",
      description: "Экономист. Эксперт по загородным резиденциям.",
    },
    {
      id: 3,
      name: "Михаил Богдашевич",
      role: "Стратегическое развитие",
      image: "https://i.pinimg.com/736x/96/fb/a5/96fba5ba9dbbc8b6f67dc282c050a568.jpg",
      description: "БГУ, факультет международного туризма.",
    },
    {
      id: 4,
      name: "Ольга Богдашевич",
      role: "Клиентский сервис",
      image: "https://img.freepik.com/premium-photo/portrait-young-woman-standing-against-white-background_1048944-8425580.jpg?semt=ais_hybrid&w=740",
      description: "Эксперт по гостеприимству премиум-класса.",
    },
  ];

  return (
    <>
      <Header />
      <main className="about-page">
        {/* Hero — без годов */}
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__overline">PrimeHouse</div>
            <h1 className="hero__title">
              Агентство
              <br />
              элитной загородной
              <br />
              недвижимости
            </h1>
            <div className="hero__separator"></div>
            <p className="hero__text">
              Мы помогаем найти идеальные дома для аренды и отдыха в Беларуси.
              Большой выбор проверенных объектов и прозрачные условия.
            </p>
            <div className="hero__stats">
              <div className="stat">
                <span className="stat__value">1000+</span>
                <span className="stat__label">объектов в базе</span>
              </div>
              <div className="stat">
                <span className="stat__value">500+</span>
                <span className="stat__label">довольных арендаторов</span>
              </div>
              <div className="stat">
                <span className="stat__value">100%</span>
                <span className="stat__label">актуальных объявлений</span>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__experience">
              <span className="hero__experience-number">10+</span>
              <span className="hero__experience-text">лет<br />экспертизы</span>
            </div>
            <div className="hero__gold-line"></div>
            <div className="hero__quote">
              «Аренда загородного дома — это новый уровень свободы»
            </div>
          </div>
        </section>

        {/* Принципы работы */}
        <section className="principles">
          <div className="principles__grid">
            <div className="principle principle--border-left">
              <h3>Большой выбор объектов</h3>
              <p>Коттеджи, усадьбы и резиденции по всей Беларуси на любой вкус и бюджет.</p>
            </div>
            <div className="principle principle--border-top">
              <h3>Честные фото и описания</h3>
              <p>Мы публикуем только реальные фотографии и точные характеристики домов.</p>
            </div>
            <div className="principle principle--border-right">
              <h3>Помощь с выбором</h3>
              <p>Учтем все пожелания: от планировки до наличия бани или разрешения на pets.</p>
            </div>
            <div className="principle principle--border-bottom">
              <h3>Прямой контакт с владельцем</h3>
              <p>Вы общаетесь напрямую с хозяином дома — без посредников и скрытых комиссий.</p>
            </div>
          </div>
        </section>

        {/* Команда */}
        <section className="team">
          <h2 className="section-title">Наша команда</h2>
          <div className="team__grid">
            {team.map((member, idx) => (
              <div key={member.id} className={`team-card ${idx === 0 ? 'team-card--featured' : ''}`}>
                <div className="team-card__image">
                  <img src={member.image} alt={member.name} />
                  {idx === 0 && <div className="team-card__crown"></div>}
                </div>
                <div className="team-card__content">
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
              <p className="team__story-quote">«Аренда без головной боли — наша главная ценность»</p>
              <p>
                PrimeHouse — это команда профессионалов, которые знают про рынок аренды загородного жилья всё.
                Наша цель — сделать процесс поиска дома быстрым, удобным и максимально прозрачным.
              </p>
              <p>
                Мы помогаем гостям находить идеальные дома для отдыха, а владельцам — ответственных арендаторов.
                Просто выбирайте объект на сайте и связывайтесь с хозяином напрямую. 
                Если нужна помощь с выбором — мы всегда на связи.
              </p>
            </div>
          </div>
        </section>

        {/* Дополнительные услуги при бронировании */}
        <section className="partners">
          <div className="partners__row">
            <div className="partners__col">
              <h3 className="partners__heading">Дополнительные услуги</h3>
              <ul className="partners__list">
                <li>Доставка еды из ресторанов</li>
                <li>Кейтеринг и обслуживание мероприятий</li>
                <li>Фотографы и видеооператоры</li>
                <li>Аниматоры и ведущие</li>
                <li>Организация праздников «под ключ»</li>
              </ul>
              <p className="partners__note">Можно заказать при бронировании дома</p>
            </div>
            <div className="partners__col">
              <h3 className="partners__heading">Популярные рестораны-партнёры</h3>
              <ul className="partners__list">
                <li>Мак Бай</li>
                <li>KFC</li>
                <li>Burger King</li>
                <li>Пицца Лисица</li>
                <li>Пицца Темпо</li>
                <li>Доминос</li>
                <li>Суши Wok</li>
                <li>Papa John's</li>
              </ul>
              <p className="partners__note">Доставка на территорию дома в день заезда</p>
            </div>
          </div>
        </section>

        {/* Контакты */}
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