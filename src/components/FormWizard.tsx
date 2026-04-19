'use client';

import React, { useMemo } from 'react';
import { useFormStore } from '@/stores/formStore';
import CountrySelector from './steps/CountrySelector';
import TravelDetails from './steps/TravelDetails';
import TripInterests from './steps/TripInterests';
import DayStartTime from './steps/DayStartTime';
import ReviewItinerary from './steps/ReviewItinerary';
import ReviewSuggestions from './steps/ReviewSuggestions';
import ExportOptions from './steps/ExportOptions';
import EditItinerary from './steps/EditItinerary';
import SavedItineraries from './SavedItineraries';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WizardLayout from './WizardLayout';

export default function FormWizard() {
  const { currentStep, setCurrentStep, nextStep, previousStep, formData, resetForm } = useFormStore();

  const steps = useMemo(
    () => [
      { id: 1, label: 'Select Country', component: CountrySelector },
      { id: 2, label: 'Travel Details', component: TravelDetails },
      { id: 3, label: 'Trip Interests', component: TripInterests },
      { id: 4, label: 'Day Start Time', component: DayStartTime },
      { id: 5, label: 'Review Itinerary', component: ReviewItinerary },
      { id: 6, label: 'Review Suggestions', component: ReviewSuggestions },
      { id: 7, label: 'Export Options', component: ExportOptions },
      { id: 8, label: 'Edit Itinerary', component: EditItinerary },
      { id: 9, label: 'My Library', component: SavedItineraries },
    ],
    []
  );

  const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component;

  const handleStepClick = (stepId: number) => {
    // Allow clicking on any step to navigate
    setCurrentStep(stepId);
  };

  return (
    <WizardLayout
      steps={steps}
      currentStepComponent={CurrentStepComponent ? <CurrentStepComponent /> : null}
      onStepClick={handleStepClick}
    />
  );
}
