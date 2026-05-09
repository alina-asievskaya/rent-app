export interface FoodItem {
  restaurantName: string;
  itemName: string;
  price: number;
  quantity: number;
}

export interface DecorationItem {
  category: string;
  itemName: string;
  price: number;
  quantity: number;
}

export interface CreateBookingDto {
  houseId: number;
  bookingDate: string; // ISO date
  foodItems: FoodItem[];
  decorationItems: DecorationItem[];
}