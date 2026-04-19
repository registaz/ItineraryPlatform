import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormData, Itinerary } from '@/types';

interface FormStore {
  // Form State
  formData: Partial<FormData>;
  currentStep: number;
  isFormComplete: boolean;
  
  // Form Actions
  setFormData: (data: Partial<FormData>) => void;
  updateFormField: (field: keyof FormData, value: any) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetForm: () => void;
  markFormComplete: () => void;
  
  // Itinerary State
  currentItinerary: Itinerary | null;
  loadingItinerary: boolean;
  
  // Itinerary Actions
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  setLoadingItinerary: (loading: boolean) => void;
  
  // localStorage Helper
  getFormDataJSON: () => string;
}

const initialFormData: Partial<FormData> = {
  country: '',
  region: '',
  startDate: '',
  endDate: '',
  budget: 1000,
  currency: 'USD',
  theme: 'adventure',
  dayStartTime: '09:00',
  interests: [],
  accommodation: '',
  flight: {
    origin: '',
    arrivalTime: '12:00',
    departureTime: '18:00',
  },
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      // Initial state
      formData: initialFormData,
      currentStep: 1,
      isFormComplete: false,
      currentItinerary: null,
      loadingItinerary: false,

      // Form Actions
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      updateFormField: (field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [field]: value,
          },
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 7),
        })),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      resetForm: () =>
        set({
          formData: initialFormData,
          currentStep: 1,
          isFormComplete: false,
          currentItinerary: null,
        }),

      markFormComplete: () => set({ isFormComplete: true }),

      // Itinerary Actions
      setCurrentItinerary: (itinerary) =>
        set({ currentItinerary: itinerary }),

      setLoadingItinerary: (loading) =>
        set({ loadingItinerary: loading }),

      // Helper
      getFormDataJSON: () => JSON.stringify(get().formData),
    }),
    {
      name: 'travel-app-form-store',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        isFormComplete: state.isFormComplete,
        currentItinerary: state.currentItinerary,
      }),
    }
  )
);

// Itinerary Store (separate for larger data)
interface ItineraryStore {
  itineraries: Itinerary[];
  addItinerary: (itinerary: Itinerary) => void;
  updateItinerary: (id: string, itinerary: Itinerary) => void;
  deleteItinerary: (id: string) => void;
  getItinerary: (id: string) => Itinerary | undefined;
}

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set, get) => ({
      itineraries: [],

      addItinerary: (itinerary) =>
        set((state) => ({
          itineraries: [...state.itineraries, itinerary],
        })),

      updateItinerary: (id, itinerary) =>
        set((state) => ({
          itineraries: state.itineraries.map((it) =>
            it.id === id ? itinerary : it
          ),
        })),

      deleteItinerary: (id) =>
        set((state) => ({
          itineraries: state.itineraries.filter((it) => it.id !== id),
        })),

      getItinerary: (id) => {
        const itinerary = get().itineraries.find((it) => it.id === id);
        return itinerary;
      },
    }),
    {
      name: 'travel-app-itinerary-store',
    }
  )
);
