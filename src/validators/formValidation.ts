import { z } from 'zod';
import { TRAVEL_THEMES, CURRENCIES, TRAVEL_INTERESTS } from '@/types';

// Country and region selector validation
export const countryStepSchema = z.object({
  country: z.string().min(1, 'Please select a country').refine(
    (val) => val.trim().length > 0,
    'Country cannot be empty'
  ),
  region: z.string().min(1, 'Please select a region').refine(
    (val) => val.trim().length > 0,
    'Region cannot be empty'
  ),
});

export type CountryStepData = z.infer<typeof countryStepSchema>;

// Travel Details validation (dates, budget, theme, flights)
export const travelDetailsSchema = z.object({
  startDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid start date'
  ),
  endDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid end date'
  ),
  budget: z.number().positive('Budget must be greater than 0'),
  currency: z.string().refine(
    (val) => (CURRENCIES as readonly string[]).includes(val),
    'Invalid currency'
  ),
  theme: z.string().refine(
    (val) => (TRAVEL_THEMES as readonly string[]).includes(val),
    'Invalid travel theme'
  ),
  accommodation: z.string().optional(),
  arrivalTime: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Invalid arrival time (HH:MM format)'
  ),
  departureTime: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Invalid departure time (HH:MM format)'
  ),
  origin: z.string().min(2, 'Please enter origin country'),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type TravelDetailsData = z.infer<typeof travelDetailsSchema>;

// Day start time validation
export const dayStartTimeSchema = z.object({
  dayStartTime: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Please enter a valid time in HH:MM format'
  ),
});

export type DayStartTimeData = z.infer<typeof dayStartTimeSchema>;

// Trip interests validation
export const interestsSchema = z.object({
  interests: z.array(z.string())
    .min(1, 'Please select at least one interest'),
});

export type InterestsData = z.infer<typeof interestsSchema>;

// Complete form data validation
export const completeFormSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  startDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid start date'
  ),
  endDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid end date'
  ),
  budget: z.number().positive('Budget must be greater than 0'),
  currency: z.string().refine(
    (val) => (CURRENCIES as readonly string[]).includes(val),
    'Invalid currency'
  ),
  theme: z.string().refine(
    (val) => (TRAVEL_THEMES as readonly string[]).includes(val),
    'Invalid travel theme'
  ),
  dayStartTime: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Invalid time format'
  ),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type CompleteFormData = z.infer<typeof completeFormSchema>;

// Activity validation (for editing/creating activities)
export const activitySchema = z.object({
  title: z.string().min(1, 'Activity title is required'),
  startTime: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Invalid time format'
  ),
  duration: z.number().positive('Duration must be greater than 0').max(1440, 'Duration cannot exceed 24 hours'),
  location: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  costEstimate: z.number().nonnegative('Cost cannot be negative'),
  category: z.enum(['dining', 'transport', 'attraction', 'accommodation', 'activity', 'shopping', 'other'] as const),
  notes: z.string().optional(),
});

export type ActivityData = z.infer<typeof activitySchema>;

// API Request validation
export const aiGenerationRequestSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  startDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid start date'
  ),
  endDate: z.string().refine(
    (date) => !isNaN(new Date(date).getTime()),
    'Invalid end date'
  ),
  budget: z.number().positive('Budget must be greater than 0'),
  currency: z.string(),
  theme: z.string(),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  accommodation: z.string().optional(),
  dayStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  flight: z.object({
    origin: z.string().min(1, 'Origin is required'),
    arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
});

export type AIGenerationRequestType = z.infer<typeof aiGenerationRequestSchema>;
