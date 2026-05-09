import React, { useState } from 'react';
import { decorationCatalog } from '../data/bookingData';
import type { DecorationCatalogItem } from '../data/bookingData';
import type { DecorationItem } from '../types/booking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './DecorationSelector.css';

interface DecorationSelectorProps {
  onComplete: (items: DecorationItem[]) => void;
  onSkip: () => void;
}

const DecorationSelector: React.FC<DecorationSelectorProps> = ({ onComplete, onSkip }) => {
  const [selectedItems, setSelectedItems] = useState<Map<string, DecorationItem>>(new Map());

  const groupedByCategory = decorationCatalog.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DecorationCatalogItem[]>);

  const addItem = (item: DecorationCatalogItem) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(item.id);
      if (existing) {
        newMap.set(item.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newMap.set(item.id, {
          category: item.category,
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

  const handleComplete = () => {
    onComplete(Array.from(selectedItems.values()));
  };

  return (
    <div className="decoration-selector">
      <h3>Дополнительные украшения и услуги</h3>
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category} className="category-group">
          <h4>{category}</h4>
          <div className="decoration-items">
            {items.map(item => {
              const selected = selectedItems.get(item.id);
              return (
                <div key={item.id} className="decoration-item">
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
        <button onClick={handleComplete} className="complete-btn">Завершить бронирование</button>
      </div>
    </div>
  );
};

export default DecorationSelector;