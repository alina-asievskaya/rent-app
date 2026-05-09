export interface MenuItem {
  id: string;
  restaurant: string;
  name: string;
  price: number;
}

export const foodMenu: MenuItem[] = [
  { id: 'm1', restaurant: 'Мак Бай', name: 'Биг Мак', price: 15 },
  { id: 'm2', restaurant: 'Мак Бай', name: 'Чизбургер', price: 12 },
  { id: 'm3', restaurant: 'Мак Бай', name: 'Картофель фри', price: 8 },
  { id: 'k1', restaurant: 'KFC', name: 'Баскет', price: 25 },
  { id: 'k2', restaurant: 'KFC', name: 'Стрипсы', price: 18 },
  { id: 'b1', restaurant: 'Burger King', name: 'Воппер', price: 20 },
  { id: 'b2', restaurant: 'Burger King', name: 'Чикен Роял', price: 17 },
  { id: 'pl1', restaurant: 'Пицца Лисица', name: 'Маргарита', price: 22 },
  { id: 'pl2', restaurant: 'Пицца Лисица', name: 'Пепперони', price: 25 },
  { id: 'pt1', restaurant: 'Пицца Темпо', name: 'Четыре сыра', price: 28 },
  { id: 'pt2', restaurant: 'Пицца Темпо', name: 'Гавайская', price: 24 },
  { id: 'r1', restaurant: 'Ronin', name: 'Суши сет', price: 35 },
  { id: 'f1', restaurant: 'Fabriq', name: 'Салат Цезарь', price: 18 },
  { id: 'gc1', restaurant: 'Grand Cafe', name: 'Стейк', price: 45 },
  { id: 'e1', restaurant: 'Ember', name: 'Бургер с говядиной', price: 30 },
];

export interface DecorationCatalogItem {
  id: string;
  category: string;
  name: string;
  price: number;
  description?: string;
}

export const decorationCatalog: DecorationCatalogItem[] = [
  { id: 'd1', category: 'Шарики', name: 'Композиция из шаров', price: 50 },
  { id: 'd2', category: 'Шарики', name: 'Арка из шаров', price: 150 },
  { id: 'd3', category: 'Аниматоры', name: 'Аниматор (2 часа)', price: 200 },
  { id: 'd4', category: 'Аниматоры', name: 'Шоу мыльных пузырей', price: 180 },
  { id: 'd5', category: 'Фотографы', name: 'Фотосессия (1 час)', price: 120 },
  { id: 'd6', category: 'Фотографы', name: 'Видеосъемка', price: 250 },
  { id: 'd7', category: 'Гирлянды', name: 'Светодиодная гирлянда', price: 40 },
  { id: 'd8', category: 'Украшения', name: 'Цветочная композиция', price: 80 },
];