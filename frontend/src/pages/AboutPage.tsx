import React from "react";
import Header from "../components/Header";
import "./AboutPage.css";

const AboutPage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="about-page">
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
          </div>
          <div className="hero__visual">
            <div className="hero__gold-line"></div>
            <div className="hero__quote">
              «Аренда загородного дома — это новый уровень свободы»
            </div>
          </div>
        </section>

        <section className="principles">
          <div className="principles__grid">
            <div className="principle principle--border-left">
              <h3>Большой выбор объектов</h3>
              <p>Коттеджи, усадьбы и резиденции по всей Беларуси на любой вкус и бюджет.</p>
            </div>
            <div className="principle principle--border-top">
              <h3>Честные фото и описания</h3>
              <p>Публикуются только реальные фотографии и точные характеристики домов.</p>
            </div>
            <div className="principle principle--border-right">
              <h3>Помощь с выбором</h3>
              <p>Учтем все пожелания: от планировки до наличия бани или разрешения на животных.</p>
            </div>
            <div className="principle principle--border-bottom">
              <h3>Прямой контакт с владельцем</h3>
              <p>Вы общаетесь напрямую с хозяином дома — без посредников и скрытых комиссий.</p>
            </div>
          </div>
        </section>

        <section className="why">
          <h2 className="why__heading">Почему выбирают PrimeHouse</h2>
          <div className="why__grid">
            <div className="why__card">
              <h3 className="why__card-title">Проверенные объекты</h3>
              <p className="why__card-text">
                Только реальные объявления, актуальные фотографии и честные описания без скрытых условий.
              </p>
            </div>
            <div className="why__card">
              <h3 className="why__card-title">Онлайн-бронирование</h3>
              <p className="why__card-text">
                Удобный выбор дат и мгновенное оформление заявки на аренду в любое время суток.
              </p>
            </div>
            <div className="why__card">
              <h3 className="why__card-title">Премиум-сервис</h3>
              <p className="why__card-text">
                От спокойного семейного отдыха до масштабных мероприятий под ключ — всё в одном месте.
              </p>
            </div>
          </div>
        </section>

        <section className="two-col">
          <div className="two-col__block">
            <span className="two-col__label">Мероприятия под ключ</span>
            <p className="two-col__intro">
              Подберите идеального организатора и он организует событие, которое запомнится каждому гостю.
            </p>
            <ul className="event-list">
              <li>Свадьбы</li>
              <li>Дни рождения</li>
              <li>Корпоративы</li>
              <li>Мальчишники</li>
              <li>Девичники</li>
              <li>Гендер-пати</li>
              <li>Выпускные</li>
              <li>Семейные праздники</li>
            </ul>
          </div>
          <div className="two-col__divider"></div>
          <div className="two-col__block">
            <span className="two-col__label">Кейтеринг</span>
            <p className="two-col__intro">
              Владельцы домов подключают проверенных кейтеринговых партнёров к своему объявлению — вы выбираете питание вместе с домом.
            </p>
            <ol className="catering-steps">
              <li>
                <span className="catering-steps__n">01</span>
                <span>Поставщик заполняет анкету и отправляет на проверку</span>
              </li>
              <li>
                <span className="catering-steps__n">02</span>
                <span>Администратор рассматривает и одобряет заявку</span>
              </li>
              <li>
                <span className="catering-steps__n">03</span>
                <span>Владелец дома добавляет услуги к своему объявлению</span>
              </li>
              <li>
                <span className="catering-steps__n">04</span>
                <span>Гость выбирает кейтеринг при бронировании</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="owners">
          <div className="owners__label">Для владельцев домов</div>
          <div className="owners__grid">
            <div className="owners__item">
              <span className="owners__n">01</span>
              <h3>Создайте объявление</h3>
              <p>Добавьте описание дома, фотографии и условия аренды.</p>
            </div>
            <div className="owners__item">
              <span className="owners__n">02</span>
              <h3>Управляйте календарём</h3>
              <p>Отмечайте занятые даты и принимайте бронирования онлайн.</p>
            </div>
            <div className="owners__item">
              <span className="owners__n">03</span>
              <h3>Подключайте кейтеринг</h3>
              <p>Добавляйте проверенных кейтеринговых партнёров к вашему объявлению.</p>
            </div>
            <div className="owners__item">
              <span className="owners__n">04</span>
              <h3>Получайте клиентов</h3>
              <p>Развивайте свой объект и получайте больше бронирований круглый год.</p>
            </div>
          </div>
        </section>

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