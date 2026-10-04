export interface Dish {
  id: string;
  name: string;
  description: string;
  category: 'Starters' | 'Pizza' | 'Burger' | 'Pasta' | 'Chinese' | 'Indian' | 'Beverages' | 'Desserts';
  price: number;
  image: string;
  type: 'veg' | 'non-veg';
  rating: number;
  prepTime: string;
  popular: boolean;
  available: boolean;
  spiceLevel: number; // 0 = none, 1 = mild, 2 = medium, 3 = fiery
  tags?: string[];
  pairing?: string;
}

export type CategoryKey = 'All' | 'Starters' | 'Pizza' | 'Burger' | 'Pasta' | 'Chinese' | 'Indian' | 'Beverages' | 'Desserts';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Interior' | 'Ambiance' | 'Culinary' | 'Architecture';
  image: string;
  caption: string;
  span?: string; // grid span hint
}

export interface ReservationDetails {
  fullName: string;
  phone: string;
  email: string;
  guests: number;
  date: string;
  timeSlot: string;
  seatingZone: 'Velvet Lounge' | 'Botanical Banquette' | 'Intimate Arch Booth' | 'Bar & Cocktail Counter';
  specialOccasion?: string;
  notes?: string;
}
