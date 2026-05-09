import React, { useState } from 'react';
import { foodMenu } from '../data/bookingData';
import type { MenuItem } from '../data/bookingData';
import type { FoodItem } from '../types/booking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './FoodSelector.css';

interface FoodSelectorProps {
  onNext: (items: FoodItem[]) => void;
  onSkip: () => void;
}

const FoodSelector: React.FC<FoodSelectorProps> = ({ onNext, onSkip }) => {
  const [selectedItems, setSelectedItems] = useState<Map<string, FoodItem>>(new Map());

  const groupedByRestaurant = foodMenu.reduce((acc, item) => {
    if (!acc[item.restaurant]) acc[item.restaurant] = [];
    acc[item.restaurant].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const addItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(item.id);
      if (existing) {
        newMap.set(item.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newMap.set(item.id, {
          restaurantName: item.restaurant,
          itemName: item.name,
          price: item.price,
          quantity: 1
        });
      }
      return newMap;
    });
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId);
      if (existing && existing.quantity > 1) {
        newMap.set(itemId, { ...existing, quantity: existing.quantity - 1 });
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });
  };

  const handleNext = () => {
    onNext(Array.from(selectedItems.values()));
  };

  return (
    <div className="food-selector">
      <h3>Выберите блюда из ресторанов</h3>
      {Object.entries(groupedByRestaurant).map(([restaurant, items]) => (
        <div key={restaurant} className="restaurant-group">
          <h4>{restaurant}</h4>
          <div className="menu-items">
            {items.map(item => {
              const selected = selectedItems.get(item.id);
              return (
                <div key={item.id} className="menu-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price} BYN</span>
                  </div>
                  <div className="item-controls">
                    {selected ? (
                      <>
                        <button onClick={() => removeItem(item.id)}>
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="quantity">{selected.quantity}</span>
                        <button onClick={() => addItem(item)}>
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => addItem(item)} className="add-btn">
                        Добавить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="actions">
        <button onClick={onSkip} className="skip-btn">Пропустить</button>
        <button onClick={handleNext} className="next-btn">Далее</button>
      </div>
    </div>
  );
};

export default FoodSelector;