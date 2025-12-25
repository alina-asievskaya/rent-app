import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as faHeartSolid,
  faMapMarkerAlt,
  faBed,
  faBath,
  faRulerCombined,
  faStar,
  faTrash,
  faShare,
  faEnvelope,
  faCalendar,
  faSearch,
  faFilter,
  faEye,
  faSortAmountDown,
  faSortAmountUp,
  faChevronDown,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutlineRegular } from '@fortawesome/free-regular-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import "./Favorites.css";

interface Property {
  id: number;
  badge: string;
  imageUrl: string;
  price: string;
  address: string;
  info: string;
  beds: number;
  baths: number;
  area: number;
  year: number;
  rating: number;
  description: string;
  features: string[];
  dateAdded?: string;
  views?: number;
}

interface SortOption {
  id: string;
  label: string;
  icon: IconProp;
}

const Favorites: React.FC = () => {
  const [favoritesFavorit, setFavoritesFavorit] = useState<Property[]>([
    {
      id: 1,
      badge: "Аренда",
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      price: "3,500 BYN/мес",
      address: "Минская область, д. Ратомка",
      info: "Загородный дом, 180 м²",
      beds: 2,
      baths: 1,
      area: 65,
      year: 2022,
      rating: 4.8,
      description: "Светлая квартира с современным ремонтом, мебелью и техникой. Рядом метро и парк.",
      features: ["Меблированная", "С техникой", "Балкон"],
      dateAdded: "2024-01-15",
      views: 245
    },
    {
      id: 2,
      badge: "Аренда",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      price: "2,800 BYN/мес",
      address: "Гродненская область, д. Озеры",
      info: "Коттедж, 150 м²",
      beds: 1,
      baths: 1,
      area: 45,
      year: 2021,
      rating: 4.5,
      description: "Уютная квартира в новом доме. Идеально для одного человека или пары.",
      features: ["Меблированная", "С ремонтом"],
      dateAdded: "2024-01-10",
      views: 189
    },
    {
      id: 3,
      badge: "Аренда",
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      price: "4,500 BYN/мес",
      address: "Брестская область, д. Томашовка",
      info: "Усадьба, 250 м²",
      beds: 3,
      baths: 2,
      area: 85,
      year: 2023,
      rating: 4.9,
      description: "Элитная квартира в историческом центре с панорамным видом на город.",
      features: ["Меблированная", "С техникой", "Балкон", "Консьерж", "Парковка"],
      dateAdded: "2024-01-05",
      views: 312
    }
  ]);

  const [selectedItemsFavorit, setSelectedItemsFavorit] = useState<Set<number>>(new Set());
  const [sortByFavorit, setSortByFavorit] = useState('date-desc');

  const sortOptionsFavorit: SortOption[] = [
    { id: 'date-desc', label: 'Сначала новые', icon: faCalendar },
    { id: 'price-asc', label: 'Цена: по возрастанию', icon: faSortAmountUp },
    { id: 'price-desc', label: 'Цена: по убыванию', icon: faSortAmountDown },
    { id: 'area-desc', label: 'Площадь: большая', icon: faRulerCombined },
    { id: 'rating-desc', label: 'Высокий рейтинг', icon: faStar }
  ];

  const removeFromFavoritesFavorit = (id: number) => {
    setFavoritesFavorit(favoritesFavorit.filter(item => item.id !== id));
    setSelectedItemsFavorit(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const removeSelectedFavorit = () => {
    setFavoritesFavorit(favoritesFavorit.filter(item => !selectedItemsFavorit.has(item.id)));
    setSelectedItemsFavorit(new Set());
  };

  const clearAllFavoritesFavorit = () => {
    setFavoritesFavorit([]);
    setSelectedItemsFavorit(new Set());
  };

  const toggleSelectItemFavorit = (id: number) => {
    setSelectedItemsFavorit(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllItemsFavorit = () => {
    if (selectedItemsFavorit.size === favoritesFavorit.length) {
      setSelectedItemsFavorit(new Set());
    } else {
      setSelectedItemsFavorit(new Set(favoritesFavorit.map(item => item.id)));
    }
  };

  const shareFavoritesFavorit = () => {
    const selectedTitles = favoritesFavorit
      .filter(item => selectedItemsFavorit.has(item.id))
      .map(item => item.info);
    
    if (selectedTitles.length === 0) {
      alert("Выберите дома для отправки!");
      return;
    }

    const message = `Мои избранные дома:\n\n${selectedTitles.join('\n')}`;
    alert(`Готово для отправки:\n\n${message}`);
  };

  // Сортировка избранного
  const sortedFavoritesFavorit = [...favoritesFavorit].sort((a, b) => {
    const priceA = parseInt(a.price.replace(/\D/g, ''));
    const priceB = parseInt(b.price.replace(/\D/g, ''));

    switch (sortByFavorit) {
      case 'date-desc':
        return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'area-desc':
        return b.area - a.area;
      case 'rating-desc':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (favoritesFavorit.length === 0) {
    return (
      <>
        <Header />
        <div className="favorites-page-favorit">
          <div className="container-favorit">
            <div className="favorites-empty-state-favorit">
              <div className="empty-state-icon-favorit">
                <FontAwesomeIcon icon={faHeartOutlineRegular} />
              </div>
              <h1>Ваше избранное пусто</h1>
              <p>Сохраняйте понравившиеся дома, нажимая на сердечко ♡</p>
              <div className="empty-state-actions-favorit">
                <Link to="/catalog" className="btn-primary-favorit">
                  <FontAwesomeIcon icon={faSearch} />
                  Найти дома
                </Link>
                <Link to="/agents" className="btn-secondary-favorit">
                  <FontAwesomeIcon icon={faFilter} />
                  Выбрать агента
                </Link>
              </div>
              
              <div className="favorites-tips-favorit">
                <h3>Почему стоит сохранять в избранное?</h3>
                <div className="tips-grid-favorit">
                  <div className="tip-card-favorit">
                    <div className="tip-icon-favorit">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <h4>Быстрый доступ</h4>
                    <p>Все понравившиеся дома в одном месте для удобного сравнения</p>
                  </div>
                  <div className="tip-card-favorit">
                    <div className="tip-icon-favorit">
                      <FontAwesomeIcon icon={faCalendar} />
                    </div>
                    <h4>Планирование</h4>
                    <p>Сохраняйте варианты для будущих просмотров с агентом</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="favorites-page-favorit">
        <div className="container-favorit">
          <div className="favorites-header-favorit">
            <div className="favorites-hero-favorit">
              <div className="hero-content-favorit">
                <h1>
                  <FontAwesomeIcon icon={faHeartSolid} />
                  Моё избранное
                </h1>
                <p className="favorites-subtitle-favorit">
                  Все сохраненные дома в одном месте. Сравнивайте, планируйте и делитесь с близкими.
                </p>
              </div>
              <div className="hero-stats-favorit">
                <div className="stat-item-favorit">
                  <div className="stat-value-favorit">{favoritesFavorit.length}</div>
                  <div className="stat-label-favorit">дома</div>
                </div>
              </div>
            </div>
            
            <div className="favorites-controls-favorit">
              <div className="controls-left-favorit">
                <div className="selection-info-favorit">
                  {selectedItemsFavorit.size > 0 ? (
                    <>
                      <span className="selected-count-favorit">
                        Выбрано: {selectedItemsFavorit.size} домов
                      </span>
                      <button 
                        className="btn-clear-selection-favorit"
                        onClick={() => setSelectedItemsFavorit(new Set())}
                      >
                        Снять выделение
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-select-all-favorit"
                      onClick={selectAllItemsFavorit}
                    >
                      Выбрать все
                    </button>
                  )}
                </div>
              </div>
              
              <div className="controls-right-favorit">
                <div className="action-buttons-favorit">
                  {selectedItemsFavorit.size > 0 ? (
                    <>
                      <button 
                        className="btn-danger-favorit"
                        onClick={removeSelectedFavorit}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Удалить выбранное
                      </button>
                      <button 
                        className="btn-primary-favorit"
                        onClick={shareFavoritesFavorit}
                      >
                        <FontAwesomeIcon icon={faShare} />
                        Поделиться
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-secondary-favorit"
                        onClick={clearAllFavoritesFavorit}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Очистить всё
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Контрол для сортировки */}
            <div className="catalog-controls-favorit">
              <div className="controls-left-favorit">
                <div className="sort-control-favorit">
                  <FontAwesomeIcon icon={faSortAmountDown} />
                  <select 
                    className="sort-select-favorit"
                    value={sortByFavorit}
                    onChange={(e) => setSortByFavorit(e.target.value)}
                  >
                    {sortOptionsFavorit.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="sort-arrow-favorit" />
                </div>
              </div>

              <div className="controls-right-favorit">
                <div className="results-count-favorit">
                  Показано: <strong>{sortedFavoritesFavorit.length}</strong> домов
                </div>
              </div>
            </div>
          </div>

          {/* Карточки в виде списка */}
          <div className="properties-container-favorit list-view-favorit">
            {sortedFavoritesFavorit.map(property => (
              <div key={property.id} className="property-item-favorit list-favorit">
                <div className="property-item-image-favorit">
                  <img src={property.imageUrl} alt={property.address} />
                  <div className="property-item-badges-favorit">

                    <button 
                      className="favorite-btn-favorit active-favorit"
                      onClick={() => removeFromFavoritesFavorit(property.id)}
                      title="Удалить из избранного"
                    >
                      <FontAwesomeIcon icon={faHeartSolid} />
                    </button>
                    <div className="card-select-favorit">
                      <input
                        type="checkbox"
                        checked={selectedItemsFavorit.has(property.id)}
                        onChange={() => toggleSelectItemFavorit(property.id)}
                        id={`select-${property.id}-favorit`}
                      />
                      <label htmlFor={`select-${property.id}-favorit`}></label>
                    </div>
                  </div>
                </div>
                
                <div className="property-item-content-favorit">
                  <div className="property-item-header-favorit">
                    <h3>{property.price}</h3>
                    <div className="property-rating-favorit">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{property.rating}</span>
                    </div>
                  </div>
                  
                  <div className="property-item-address-favorit">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {property.address}
                  </div>
                  
                  <p className="property-item-info-favorit">{property.info}</p>
                  
                  <div className="property-item-features-favorit">
                    <span>
                      <FontAwesomeIcon icon={faBed} /> {property.beds} комн.
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faBath} /> {property.baths}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faRulerCombined} /> {property.area} м²
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faCheckCircle} /> {property.year}
                    </span>
                  </div>
                  
                  <p className="property-item-description-favorit">
                    {property.description}
                  </p>
                  
                  <div className="property-item-tags-favorit">
                    {property.features.map((feature: string, index: number) => (
                      <span key={index} className="tag-favorit">{feature}</span>
                    ))}
                  </div>
                  
                  <div className="property-item-actions-favorit">
                    <button className="btn-primary-favorit">Подробнее</button>
                    <button className="btn-secondary-favorit">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Написать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
      
    </>
  );
};

export default Favorites;