// Form Data Structure
export interface FormData {
  country: string;
  region: string; // Specific region/area within the country
  startDate: string; // ISO 8601 format YYYY-MM-DD
  endDate: string;
  budget: number;
  currency: string;
  theme: string;
  dayStartTime: string; // HH:MM format
  interests: string[]; // e.g., ["hiking", "museums", "local food"]
  accommodation?: string; // Hotel/accommodation name or area
  flight: {
    origin: string; // Country code or name
    arrivalTime: string; // HH:MM format on start date
    departureTime: string; // HH:MM format on end date
  };
}

// Activity Suggestion Option
export interface ActivitySuggestion {
  title: string;
  location?: string;
  description: string;
  costEstimate: number;
}

// Activity Structure
export interface Activity {
  id: string;
  startTime: string; // HH:MM format
  duration: number; // minutes
  category: 'dining' | 'transport' | 'attraction' | 'accommodation' | 'activity' | 'shopping' | 'other';
  customized: boolean;
  notes?: string;
  // Either single activity (legacy) or suggestions to choose from
  title?: string;
  location?: string;
  description?: string;
  costEstimate?: number;
  // New suggestions-based approach
  suggestions?: ActivitySuggestion[];
  selectedSuggestionIndex?: number; // Index of selected suggestion from suggestions array
}

// Single Day Structure
export interface Day {
  id: string;
  date: string; // ISO 8601 format YYYY-MM-DD
  dayNumber: number;
  area?: string; // Specific area/neighborhood for this day
  activities: Activity[];
  totalCost: number;
}

// Full Itinerary Structure
export interface Itinerary {
  id: string;
  title: string;
  country: string;
  region: string; // Specific region/area
  dateRange: {
    start: string; // ISO 8601
    end: string;
  };
  budget: {
    total: number;
    currency: string;
    spent: number;
  };
  theme: string;
  dayStartTime: string; // HH:MM format
  flight: {
    origin: string;
    arrivalTime: string;
    departureTime: string;
  };
  days: Day[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    aiGenerated: boolean;
  };
}

// API Response Structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI Generation Request
export interface AIGenerationRequest {
  country: string;
  region: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  theme: string;
  dayStartTime: string;
  interests: string[];
  accommodation?: string;
  flight: {
    origin: string;
    arrivalTime: string;
    departureTime: string;
  };
}

// Export Format Structure
export interface ItineraryExport {
  metadata: {
    title: string;
    country: string;
    region: string;
    dateRange: {
      start: string;
      end: string;
    };
    generatedAt: string;
    theme: string;
  };
  budget: {
    total: number;
    currency: string;
    spent: number;
    byCategory: Record<string, number>;
  };
  days: Array<{
    date: string;
    dayNumber: number;
    activities: Array<{
      time: string;
      duration: number;
      title: string;
      cost: number;
      category: string;
      description?: string;
      location?: string;
    }>;
  }>;
}

// Travel Themes
export const TRAVEL_THEMES = [
  'adventure',
  'shopping',
  'relaxation',
  'culture',
  'food',
  'nature',
  'nightlife',
  'budget-friendly',
  'luxury',
  'family-friendly',
] as const;

export type TravelTheme = (typeof TRAVEL_THEMES)[number];

// Activity Categories
export const ACTIVITY_CATEGORIES = [
  'dining',
  'transport',
  'attraction',
  'accommodation',
  'activity',
  'shopping',
  'other',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

// Currencies
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD', 'HKD', 'CNY'] as const;

export type Currency = (typeof CURRENCIES)[number];

// Travel Interests
export const TRAVEL_INTERESTS = [
  'hiking',
  'museums',
  'local food',
  'nightlife',
  'beaches',
  'historical sites',
  'shopping',
  'photography',
  'adventure sports',
  'spa & wellness',
  'art galleries',
  'architecture',
  'nature & wildlife',
  'spiritual sites',
  'local markets',
] as const;

export type TravelInterest = (typeof TRAVEL_INTERESTS)[number];
